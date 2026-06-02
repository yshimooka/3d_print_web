import * as THREE from "three";

// ─── Types ───────────────────────────────────────────

export interface AnalysisIssue {
  type: "thin_wall" | "small_feature";
  severity: "warning" | "critical";
  label: string;
  description: string;
  count: number;
}

export interface AnalysisResult {
  issues: AnalysisIssue[];
  stats: {
    totalTriangles: number;
    boundingBox: THREE.Vector3;
    surfaceArea: number;
    thinWallPercentage: number;
  };
  // Per-face severity: 0 = ok, 1 = warning, 2 = critical
  faceSeverity: Float32Array;
}

// ─── Constants ───────────────────────────────────────

const THIN_WALL_THRESHOLD = 0.8;
const RAY_SAMPLE_RATE = 0.05;
// Above this triangle count, raycasting (O(n_rays × n_tris)) becomes prohibitively
// slow on the main thread — skip the thin-wall pass for large meshes.
const MAX_RAYCAST_TRIANGLES = 30_000;

// ─── Main Analysis ───────────────────────────────────

export function analyzeGeometry(object: THREE.Object3D): AnalysisResult {
  const allGeometries: THREE.BufferGeometry[] = [];

  object.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      const geo = child.geometry.clone();
      child.updateWorldMatrix(true, false);
      geo.applyMatrix4(child.matrixWorld);
      if (!geo.index) {
        const indices = [];
        for (let i = 0; i < geo.attributes.position.count; i++) indices.push(i);
        geo.setIndex(indices);
      }
      geo.computeVertexNormals();
      allGeometries.push(geo);
    }
  });

  if (allGeometries.length === 0) {
    return emptyResult();
  }

  const merged = mergeGeometries(allGeometries);
  const position = merged.attributes.position;
  const normal = merged.attributes.normal;
  const index = merged.index!;
  const triCount = index.count / 3;

  const faceSeverity = new Float32Array(triCount);

  merged.computeBoundingBox();
  const dimensions = new THREE.Vector3();
  merged.boundingBox!.getSize(dimensions);

  let thinWallFaces = 0;
  const thinWallIndices: number[] = [];

  // ── Thin wall detection (skipped for large meshes) ──
  // Raycasting is O(n_rays × n_triangles) with no BVH → freezes for large meshes.
  if (triCount <= MAX_RAYCAST_TRIANGLES) {
    const raycaster = new THREE.Raycaster();
    raycaster.firstHitOnly = true;

    const tempMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    const tempMesh = new THREE.Mesh(merged, tempMaterial);

    const sampleCount = Math.max(10, Math.floor(position.count * RAY_SAMPLE_RATE));
    const step = Math.max(1, Math.floor(position.count / sampleCount));
    const vertNormal = new THREE.Vector3();
    const rayOrigin = new THREE.Vector3();
    const thinVertexSet = new Set<number>();

    for (let vi = 0; vi < position.count; vi += step) {
      rayOrigin.fromBufferAttribute(position, vi);
      vertNormal.fromBufferAttribute(normal, vi).normalize();

      const invertedNormal = vertNormal.clone().negate();
      const offset = rayOrigin.clone().add(invertedNormal.clone().multiplyScalar(0.01));

      raycaster.set(offset, invertedNormal);
      const hits = raycaster.intersectObject(tempMesh, false);

      if (hits.length > 0 && hits[0].distance < THIN_WALL_THRESHOLD) {
        thinVertexSet.add(vi);
      }
    }

    if (thinVertexSet.size > 0) {
      for (let i = 0; i < triCount; i++) {
        const i0 = index.getX(i * 3);
        const i1 = index.getX(i * 3 + 1);
        const i2 = index.getX(i * 3 + 2);
        if (thinVertexSet.has(i0) || thinVertexSet.has(i1) || thinVertexSet.has(i2)) {
          faceSeverity[i] = Math.max(faceSeverity[i], 2);
          thinWallIndices.push(i);
          thinWallFaces++;
        }
      }
    }

    tempMaterial.dispose();
  }

  // ── Build issues ──
  const issues: AnalysisIssue[] = [];

  if (thinWallIndices.length > 0) {
    issues.push({
      type: "thin_wall", severity: "critical", label: "薄い壁",
      description: `${thinWallIndices.length}箇所で壁厚が${THIN_WALL_THRESHOLD}mm未満です。印刷中に破損する可能性があります。`,
      count: thinWallIndices.length,
    });
  }

  const minDim = Math.min(dimensions.x, dimensions.y, dimensions.z);
  if (minDim > 0 && minDim < 1.0) {
    issues.push({
      type: "small_feature", severity: "warning", label: "小さな形状",
      description: `モデルの最小寸法が${minDim.toFixed(2)}mmです。微細な部分が正確に再現されない場合があります。`,
      count: 1,
    });
  }

  return {
    issues,
    stats: {
      totalTriangles: triCount,
      boundingBox: dimensions,
      surfaceArea: 0,
      thinWallPercentage: triCount > 0 ? (thinWallFaces / triCount) * 100 : 0,
    },
    faceSeverity,
  };
}

// ─── Apply per-vertex colors to model faces ──────────
// This mutates the model's geometry attributes to add vertex colors
// that visually highlight problem areas. Call this to enable overlay,
// and call removeHighlightColors to reverse it.

const WARNING_COLOR = new THREE.Color(0xf59e0b);
const CRITICAL_COLOR = new THREE.Color(0xef4444);

export function applyHighlightColors(
  object: THREE.Object3D,
  faceSeverity: Float32Array
): void {
  let globalFaceOffset = 0;

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || !child.geometry) return;

    const geo = child.geometry;
    const index = geo.index;
    const position = geo.attributes.position;

    if (!index) return;

    const triCount = index.count / 3;
    const vertexCount = position.count;

    // Create vertex color attribute (per-vertex, not per-face, so we need
    // to non-index if we want per-face coloring — instead we blend)
    // We'll use a simpler approach: store severity per vertex as max of adjacent faces
    const vertexSeverity = new Float32Array(vertexCount);

    for (let i = 0; i < triCount; i++) {
      const globalIdx = globalFaceOffset + i;
      if (globalIdx >= faceSeverity.length) break;

      const sev = faceSeverity[globalIdx];
      if (sev === 0) continue;

      const i0 = index.getX(i * 3);
      const i1 = index.getX(i * 3 + 1);
      const i2 = index.getX(i * 3 + 2);

      vertexSeverity[i0] = Math.max(vertexSeverity[i0], sev);
      vertexSeverity[i1] = Math.max(vertexSeverity[i1], sev);
      vertexSeverity[i2] = Math.max(vertexSeverity[i2], sev);
    }

    // Build color array
    const colors = new Float32Array(vertexCount * 3);
    for (let v = 0; v < vertexCount; v++) {
      const sev = vertexSeverity[v];
      if (sev >= 2) {
        colors[v * 3] = CRITICAL_COLOR.r;
        colors[v * 3 + 1] = CRITICAL_COLOR.g;
        colors[v * 3 + 2] = CRITICAL_COLOR.b;
      } else if (sev >= 1) {
        colors[v * 3] = WARNING_COLOR.r;
        colors[v * 3 + 1] = WARNING_COLOR.g;
        colors[v * 3 + 2] = WARNING_COLOR.b;
      } else {
        // Neutral gray so the highlighted areas stand out
        colors[v * 3] = 0.85;
        colors[v * 3 + 1] = 0.85;
        colors[v * 3 + 2] = 0.85;
      }
    }

    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    // Enable vertex colors on the material
    if (child.material) {
      // Store original material for later restoration
      if (!child.userData._originalMaterial) {
        child.userData._originalMaterial = child.material.clone();
      }

      child.material.vertexColors = true;
      child.material.needsUpdate = true;

      // Reduce the base color impact so vertex colors are prominent
      if (child.material.color) {
        child.material.color.set(0xffffff);
      }
      // Make it more matte so colors read clearly
      if ('roughness' in child.material) {
        child.material.roughness = 0.7;
        child.material.metalness = 0.0;
        child.material.clearcoat = 0;
        child.material.transmission = 0;
        child.material.opacity = 1;
        child.material.transparent = false;
      }
    }

    globalFaceOffset += triCount;
  });
}

export function removeHighlightColors(object: THREE.Object3D): void {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || !child.geometry) return;

    // Remove vertex color attribute
    if (child.geometry.attributes.color) {
      child.geometry.deleteAttribute("color");
    }

    // Restore original material
    if (child.userData._originalMaterial && child.material) {
      const orig = child.userData._originalMaterial;
      child.material.vertexColors = false;
      child.material.needsUpdate = true;

      if (child.material.color && orig.color) {
        child.material.color.copy(orig.color);
      }
      if ('roughness' in child.material && 'roughness' in orig) {
        child.material.roughness = orig.roughness;
        child.material.metalness = orig.metalness;
        child.material.clearcoat = orig.clearcoat;
        child.material.transmission = orig.transmission;
        child.material.opacity = orig.opacity;
        child.material.transparent = orig.transparent;
      }
    }
  });
}

// ─── Helpers ─────────────────────────────────────────

function emptyResult(): AnalysisResult {
  return {
    issues: [],
    stats: {
      totalTriangles: 0, boundingBox: new THREE.Vector3(),
      surfaceArea: 0, thinWallPercentage: 0,
    },
    faceSeverity: new Float32Array(0),
  };
}

function mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  if (geometries.length === 1) return geometries[0];

  let totalVertices = 0;
  let totalIndices = 0;
  for (const geo of geometries) {
    totalVertices += geo.attributes.position.count;
    totalIndices += geo.index ? geo.index.count : geo.attributes.position.count;
  }

  const positions = new Float32Array(totalVertices * 3);
  const normals = new Float32Array(totalVertices * 3);
  const indices = new Uint32Array(totalIndices);
  let vertexOffset = 0, indexOffset = 0, baseVertex = 0;

  for (const geo of geometries) {
    const pos = geo.attributes.position;
    const norm = geo.attributes.normal;
    const idx = geo.index;

    for (let i = 0; i < pos.count; i++) {
      positions[(vertexOffset + i) * 3] = pos.getX(i);
      positions[(vertexOffset + i) * 3 + 1] = pos.getY(i);
      positions[(vertexOffset + i) * 3 + 2] = pos.getZ(i);
      if (norm) {
        normals[(vertexOffset + i) * 3] = norm.getX(i);
        normals[(vertexOffset + i) * 3 + 1] = norm.getY(i);
        normals[(vertexOffset + i) * 3 + 2] = norm.getZ(i);
      }
    }

    if (idx) {
      for (let i = 0; i < idx.count; i++) indices[indexOffset + i] = idx.getX(i) + baseVertex;
      indexOffset += idx.count;
    } else {
      for (let i = 0; i < pos.count; i++) indices[indexOffset + i] = i + baseVertex;
      indexOffset += pos.count;
    }
    baseVertex += pos.count;
    vertexOffset += pos.count;
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  merged.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  merged.setIndex(new THREE.BufferAttribute(indices, 1));
  merged.computeVertexNormals();
  return merged;
}
