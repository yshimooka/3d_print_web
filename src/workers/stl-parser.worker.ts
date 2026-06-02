// Binary STL parser running in a Web Worker to avoid blocking the main thread.
//
// Protocol:
//   main → worker : ArrayBuffer  (the raw STL file bytes, transferred)
//   worker → main : { type: 'progress', value: number }                  (0–100)
//                   { type: 'done', positions, normals,
//                     wasDecimated, displayTriCount, originalTriCount }   (Float32Arrays, transferred)
//                   { type: 'error', message: string }

// Max triangles to send to the main thread.
// GPU upload of Float32Arrays is synchronous WebGL and freezes the UI
// when the data is too large (~93 MB for 1.3M tris). 200 k keeps it under 15 MB.
const MAX_DISPLAY_TRIS = 200_000;

self.onmessage = (e: MessageEvent<ArrayBuffer>) => {
  const buffer = e.data;

  try {
    const view = new DataView(buffer);
    const numTriangles = view.getUint32(80, true);

    // Validate binary STL: 80-byte header + 4-byte count + 50 bytes/tri
    const expectedSize = 80 + 4 + numTriangles * 50;
    if (buffer.byteLength !== expectedSize) {
      throw new Error(
        "ASCII形式のSTLは現在非対応です。バイナリSTLをご利用ください。"
      );
    }

    const positions = new Float32Array(numTriangles * 9);
    const normals   = new Float32Array(numTriangles * 9);

    const REPORT_EVERY = Math.max(1, Math.floor(numTriangles / 20)); // ~5% steps
    let offset = 84; // skip header (80) + tri count (4)

    for (let i = 0; i < numTriangles; i++) {
      const nx = view.getFloat32(offset,      true);
      const ny = view.getFloat32(offset +  4, true);
      const nz = view.getFloat32(offset +  8, true);
      offset += 12;

      const base = i * 9;

      positions[base]     = view.getFloat32(offset,      true);
      positions[base + 1] = view.getFloat32(offset +  4, true);
      positions[base + 2] = view.getFloat32(offset +  8, true);
      offset += 12;

      positions[base + 3] = view.getFloat32(offset,      true);
      positions[base + 4] = view.getFloat32(offset +  4, true);
      positions[base + 5] = view.getFloat32(offset +  8, true);
      offset += 12;

      positions[base + 6] = view.getFloat32(offset,      true);
      positions[base + 7] = view.getFloat32(offset +  4, true);
      positions[base + 8] = view.getFloat32(offset +  8, true);
      offset += 12;

      normals[base]     = nx; normals[base + 1] = ny; normals[base + 2] = nz;
      normals[base + 3] = nx; normals[base + 4] = ny; normals[base + 5] = nz;
      normals[base + 6] = nx; normals[base + 7] = ny; normals[base + 8] = nz;

      offset += 2; // attribute byte count

      if (i % REPORT_EVERY === 0) {
        (self as unknown as Worker).postMessage({
          type: "progress",
          value: Math.round((i / numTriangles) * 100),
        });
      }
    }

    // ── Decimation ─────────────────────────────────────────────────────────
    // If the mesh is too large, reduce triangle count via grid clustering
    // so the GPU upload stays under ~15 MB and doesn't freeze the UI.
    const needsDecimation = numTriangles > MAX_DISPLAY_TRIS;

    let outPositions: Float32Array;
    let outNormals:   Float32Array;
    let displayTriCount: number;

    if (needsDecimation) {
      (self as unknown as Worker).postMessage({ type: "progress", value: 95 });

      const result = gridDecimate(positions, normals, MAX_DISPLAY_TRIS);
      outPositions   = result.positions;
      outNormals     = result.normals;
      displayTriCount = result.positions.length / 9;
    } else {
      outPositions   = positions;
      outNormals     = normals;
      displayTriCount = numTriangles;
    }

    (self as unknown as Worker).postMessage(
      {
        type:             "done",
        positions:        outPositions,
        normals:          outNormals,
        wasDecimated:     needsDecimation,
        displayTriCount,
        originalTriCount: numTriangles,
      },
      [outPositions.buffer, outNormals.buffer]
    );
  } catch (err) {
    (self as unknown as Worker).postMessage({
      type:    "error",
      message: err instanceof Error ? err.message : "STLの解析に失敗しました",
    });
  }
};

// ── Grid Clustering Decimation ────────────────────────────────────────────────
// Divides 3D space into a grid; merges vertices in the same cell.
// Triangles where all 3 vertices land in different cells are kept as-is.
// Result is a continuous surface with no holes (unlike stride sampling).

function gridDecimate(
  positions: Float32Array,
  normals:   Float32Array,
  targetTris: number
): { positions: Float32Array; normals: Float32Array } {
  const numTris = positions.length / 9;

  // Find bounding box
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], y = positions[i + 1], z = positions[i + 2];
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
  }

  // Grid resolution that should yield roughly targetTris output triangles.
  // Empirically, grid cells ≈ sqrt(targetTris / numTris) * some factor.
  const ratio = numTris / targetTris;
  const gridSize = Math.max(16, Math.min(256, Math.ceil(Math.cbrt(ratio) * 60)));
  const gs2 = gridSize * gridSize;

  const dx = (maxX - minX) || 1;
  const dy = (maxY - minY) || 1;
  const dz = (maxZ - minZ) || 1;

  // For each grid cell, store the representative vertex index in outP/outN.
  const cellMap = new Int32Array(gridSize * gridSize * gridSize).fill(-1);

  const outP: number[] = []; // representative vertex positions
  const outN: number[] = []; // representative vertex normals

  const triP: number[] = []; // output triangle positions (flat)
  const triN: number[] = []; // output triangle normals   (flat)

  const getOrCreate = (fi: number): number => {
    const px = positions[fi], py = positions[fi + 1], pz = positions[fi + 2];
    const cx = Math.min(Math.floor(((px - minX) / dx) * gridSize), gridSize - 1);
    const cy = Math.min(Math.floor(((py - minY) / dy) * gridSize), gridSize - 1);
    const cz = Math.min(Math.floor(((pz - minZ) / dz) * gridSize), gridSize - 1);
    const cell = cx + cy * gridSize + cz * gs2;
    if (cellMap[cell] !== -1) return cellMap[cell];
    const idx = outP.length / 3;
    cellMap[cell] = idx;
    outP.push(px, py, pz);
    outN.push(normals[fi], normals[fi + 1], normals[fi + 2]);
    return idx;
  };

  for (let t = 0; t < numTris; t++) {
    const b = t * 9;
    const i0 = getOrCreate(b);
    const i1 = getOrCreate(b + 3);
    const i2 = getOrCreate(b + 6);

    // Skip triangles that collapsed to a degenerate after merging
    if (i0 === i1 || i1 === i2 || i0 === i2) continue;

    const p0 = i0 * 3, p1 = i1 * 3, p2 = i2 * 3;
    triP.push(outP[p0], outP[p0 + 1], outP[p0 + 2]);
    triP.push(outP[p1], outP[p1 + 1], outP[p1 + 2]);
    triP.push(outP[p2], outP[p2 + 1], outP[p2 + 2]);
    triN.push(outN[p0], outN[p0 + 1], outN[p0 + 2]);
    triN.push(outN[p1], outN[p1 + 1], outN[p1 + 2]);
    triN.push(outN[p2], outN[p2 + 1], outN[p2 + 2]);
  }

  return {
    positions: new Float32Array(triP),
    normals:   new Float32Array(triN),
  };
}
