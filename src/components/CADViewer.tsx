"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stage, OrbitControls, Center, useProgress, Html } from "@react-three/drei";
import * as THREE from "three";
import { OBJLoader, GLTFLoader } from "three-stdlib";
import { AlertCircle } from "lucide-react";
import { type MaterialRenderProps } from "@/data/materials";
import { type AnalysisResult, applyHighlightColors, removeHighlightColors } from "@/utils/printAnalysis";

// ─── Inner scene components ──────────────────────────────────────────────────

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center bg-slate-800/80 p-6 rounded-2xl backdrop-blur-md shadow-2xl border border-slate-700 min-w-[200px]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-slate-800 rounded-full animate-spin mb-4" />
        <p className="text-blue-400 font-semibold">{progress.toFixed(0)}% loaded</p>
      </div>
    </Html>
  );
}

function ErrorFallback({ error }: { error: string }) {
  return (
    <div className="h-full w-full flex flex-col justify-center items-center bg-slate-900 absolute inset-0 z-10 p-4">
      <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl flex flex-col items-center max-w-md text-center">
        <AlertCircle className="text-red-500 w-16 h-16 mb-6 animate-pulse" />
        <h2 className="text-2xl font-bold text-slate-100 mb-3">Error Loading Model</h2>
        <p className="text-slate-400">{error}</p>
      </div>
    </div>
  );
}

const DEFAULT_RENDER: MaterialRenderProps = {
  roughness: 0.4, metalness: 0.1, clearcoat: 0, clearcoatRoughness: 0.5,
  transmission: 0, opacity: 1, envMapIntensity: 0.6, ior: 1.45,
};

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// ─── Model ───────────────────────────────────────────────────────────────────

function Model({
  url, fileType, colorHex, materialProps, onModelLoaded,
  showAnalysisOverlay, analysisResult,
  onParseProgress, onDecimated,
}: {
  url: string;
  fileType: string;
  colorHex?: string;
  materialProps?: MaterialRenderProps;
  onModelLoaded?: (model: THREE.Object3D) => void;
  showAnalysisOverlay?: boolean;
  analysisResult?: AnalysisResult | null;
  onParseProgress?: (progress: number | null) => void;
  onDecimated?: (info: { displayTriCount: number; originalTriCount: number }) => void;
}) {
  const [model, setModel] = useState<THREE.Object3D | null>(null);
  const [error, setError] = useState<string | null>(null);
  const targetColor = useRef(new THREE.Color(colorHex || "#999999"));
  const targetProps = useRef<MaterialRenderProps>({ ...DEFAULT_RENDER });
  const modelRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => { if (colorHex) targetColor.current.set(colorHex); }, [colorHex]);
  useEffect(() => { if (materialProps) targetProps.current = { ...materialProps }; }, [materialProps]);

  useFrame(() => {
    if (!modelRef.current || showAnalysisOverlay) return;
    const t = 0.06;
    const tp = targetProps.current;
    modelRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhysicalMaterial) {
        const mat = child.material;
        mat.color.lerp(targetColor.current, 0.08);
        mat.roughness = lerp(mat.roughness, tp.roughness, t);
        mat.metalness = lerp(mat.metalness, tp.metalness, t);
        mat.clearcoat = lerp(mat.clearcoat, tp.clearcoat, t);
        mat.clearcoatRoughness = lerp(mat.clearcoatRoughness, tp.clearcoatRoughness, t);
        mat.transmission = lerp(mat.transmission, tp.transmission, t);
        mat.opacity = lerp(mat.opacity, tp.opacity, t);
        mat.envMapIntensity = lerp(mat.envMapIntensity, tp.envMapIntensity, t);
        mat.ior = lerp(mat.ior, tp.ior, t);
        mat.transparent = mat.opacity < 1 || mat.transmission > 0;
        mat.needsUpdate = true;
      }
    });
  });

  useEffect(() => { modelRef.current = model; }, [model]);

  useEffect(() => {
    if (!modelRef.current || !analysisResult) return;
    if (showAnalysisOverlay) {
      applyHighlightColors(modelRef.current, analysisResult.faceSeverity);
    } else {
      removeHighlightColors(modelRef.current);
    }
  }, [showAnalysisOverlay, analysisResult]);

  // Model loading
  useEffect(() => {
    let active = true;
    let worker: Worker | null = null;

    // ── STL: parse in Web Worker to avoid freezing the main thread ──
    if (fileType === "stl") {
      const loadSTL = async () => {
        try {
          onParseProgress?.(0);
          const response = await fetch(url);
          if (!active) return;
          const buffer = await response.arrayBuffer();
          if (!active) return;

          worker = new Worker(
            new URL("../workers/stl-parser.worker.ts", import.meta.url)
          );

          worker.onmessage = (e: MessageEvent) => {
            const msg = e.data;
            if (msg.type === "progress") {
              if (active) onParseProgress?.(msg.value);
            } else if (msg.type === "done") {
              if (!active) return;
              const geometry = new THREE.BufferGeometry();
              geometry.setAttribute("position", new THREE.BufferAttribute(msg.positions, 3));
              geometry.setAttribute("normal",   new THREE.BufferAttribute(msg.normals,   3));
              const rp = materialProps || DEFAULT_RENDER;
              const material = new THREE.MeshPhysicalMaterial({
                color: colorHex || "#999999",
                roughness: rp.roughness, metalness: rp.metalness,
                clearcoat: rp.clearcoat, clearcoatRoughness: rp.clearcoatRoughness,
                transmission: rp.transmission, opacity: rp.opacity,
                transparent: rp.opacity < 1 || rp.transmission > 0,
                envMapIntensity: rp.envMapIntensity, ior: rp.ior,
                side: THREE.DoubleSide,
              });
              const mesh = new THREE.Mesh(geometry, material);
              setModel(mesh);
              onParseProgress?.(null);
              if (msg.wasDecimated) {
                onDecimated?.({
                  displayTriCount:  msg.displayTriCount,
                  originalTriCount: msg.originalTriCount,
                });
              }
              if (onModelLoaded) onModelLoaded(mesh);
            } else if (msg.type === "error") {
              if (active) setError(msg.message);
              onParseProgress?.(null);
            }
          };

          worker.postMessage(buffer, [buffer]);
        } catch (err: any) {
          if (active) setError(err.message || "STLの読み込みに失敗しました");
          onParseProgress?.(null);
        }
      };

      loadSTL();
      return () => {
        active = false;
        worker?.terminate();
        onParseProgress?.(null);
      };
    }

    // ── OBJ / GLTF / STEP ──
    let loader: any;

    if (fileType === "obj") {
      loader = new OBJLoader();
    } else if (fileType === "gltf" || fileType === "glb") {
      loader = new GLTFLoader();
    } else if (fileType === "stp" || fileType === "step") {
      const loadStepFile = async () => {
        try {
          // @ts-ignore
          const occtimportjs = (await import("occt-import-js")).default;
          const occt = await occtimportjs({
            locateFile: (path: string) => (path.endsWith(".wasm") ? "/occt-import-js.wasm" : path),
          });
          const response = await fetch(url);
          const buffer = await response.arrayBuffer();
          const fileBuffer = new Uint8Array(buffer);
          const result = occt.ReadStepFile(fileBuffer, null);
          if (!active) return;
          if (!result || !result.success) throw new Error("Failed to parse STEP file geometry.");
          const group = new THREE.Group();
          for (const rawMesh of result.meshes) {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute("position", new THREE.Float32BufferAttribute(rawMesh.attributes.position.array, 3));
            if (rawMesh.attributes.normal) {
              geometry.setAttribute("normal", new THREE.Float32BufferAttribute(rawMesh.attributes.normal.array, 3));
            } else {
              geometry.computeVertexNormals();
            }
            geometry.setIndex(new THREE.Uint32BufferAttribute(rawMesh.index.array, 1));
            let color = new THREE.Color(colorHex || "#999999");
            if (!colorHex && rawMesh.color) color.setRGB(rawMesh.color[0], rawMesh.color[1], rawMesh.color[2]);
            const rp = materialProps || DEFAULT_RENDER;
            const material = new THREE.MeshPhysicalMaterial({
              color, roughness: rp.roughness, metalness: rp.metalness,
              clearcoat: rp.clearcoat, clearcoatRoughness: rp.clearcoatRoughness,
              transmission: rp.transmission, opacity: rp.opacity,
              transparent: rp.opacity < 1 || rp.transmission > 0,
              envMapIntensity: rp.envMapIntensity, ior: rp.ior, side: THREE.DoubleSide,
            });
            group.add(new THREE.Mesh(geometry, material));
          }
          setModel(group);
          if (onModelLoaded) onModelLoaded(group);
        } catch (err: any) {
          if (!active) return;
          setError(err.message || "Failed to parse the STEP file.");
        }
      };
      loadStepFile();
      return;
    } else {
      setError("Unsupported file format.");
      return;
    }

    loader.load(
      url,
      (data: any) => {
        if (!active) return;
        if (fileType === "gltf" || fileType === "glb") {
          setModel(data.scene);
          if (onModelLoaded) onModelLoaded(data.scene);
        } else if (fileType === "obj") {
          setModel(data);
          if (onModelLoaded) onModelLoaded(data);
        }
      },
      undefined,
      (err: any) => {
        if (!active) return;
        setError(err.message || "Failed to parse the file.");
      }
    );

    return () => { active = false; };
  }, [url, fileType]);

  if (error) {
    return (
      <Html center>
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-2xl min-w-[250px] text-center backdrop-blur-xl shadow-2xl">
          <AlertCircle className="w-10 h-10 mx-auto mb-3" />
          <p className="font-bold text-lg">Failed to load model</p>
          <p className="text-sm mt-2 max-w-xs opacity-80">{error}</p>
        </div>
      </Html>
    );
  }

  return <>{model && <primitive object={model} />}</>;
}

// ─── CADViewer (exported) ─────────────────────────────────────────────────────

export default function CADViewer({
  file, colorHex, materialProps, onModelLoaded,
  showAnalysisOverlay, analysisResult,
}: {
  file: File;
  colorHex?: string;
  materialProps?: MaterialRenderProps;
  onModelLoaded?: (model: THREE.Object3D) => void;
  showAnalysisOverlay?: boolean;
  analysisResult?: AnalysisResult | null;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parseProgress, setParseProgress] = useState<number | null>(null);
  const [decimated, setDecimated] = useState(false);

  const fileType = useMemo(() => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    return extension || "";
  }, [file]);

  useEffect(() => {
    setParseProgress(null);
    setDecimated(false);
  }, [file]);

  useEffect(() => {
    try {
      const objectUrl = URL.createObjectURL(file);
      setUrl(objectUrl);
      setError(null);
      return () => URL.revokeObjectURL(objectUrl);
    } catch (err: any) {
      setError("Failed to create object URL for file.");
    }
  }, [file]);

  if (error) return <ErrorFallback error={error} />;

  return (
    <div className="w-full h-full relative group">
      {url && (
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 150], fov: 50 }}>
          <color attach="background" args={["#F0F0F2"]} />
          <ambientLight intensity={0.5} />

          <Suspense fallback={<Loader />}>
            <Stage environment="city" intensity={0.5} adjustCamera={1.4}>
              <Center>
                <Model
                  url={url}
                  fileType={fileType}
                  colorHex={colorHex}
                  materialProps={materialProps}
                  onModelLoaded={onModelLoaded}
                  showAnalysisOverlay={showAnalysisOverlay}
                  analysisResult={analysisResult}
                  onParseProgress={setParseProgress}
                  onDecimated={() => setDecimated(true)}
                />
              </Center>
            </Stage>
          </Suspense>

          <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} enableDamping dampingFactor={0.05} />
        </Canvas>
      )}

      {/* STL parse progress overlay */}
      {parseProgress !== null && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4"
          style={{ background: "rgba(3,3,5,0.7)", backdropFilter: "blur(4px)" }}
        >
          <p className="text-[15px] font-medium" style={{ color: "var(--text-primary)" }}>
            データを読み込んでいます... {parseProgress}%
          </p>
          <div className="w-64 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-secondary)" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${parseProgress}%`, background: "var(--accent)" }}
            />
          </div>
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            大きいファイルは少し時間がかかります
          </p>
        </div>
      )}

      {/* Decimation notice */}
      {decimated && (
        <div className="absolute bottom-12 left-0 right-0 flex justify-center pointer-events-none">
          <div
            className="px-3 py-1.5 rounded-full text-[11px]"
            style={{
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(8px)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            プレビュー表示用に最適化しています（元データは印刷時にそのまま使用されます）
          </div>
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-4 left-0 right-0 pointer-events-none flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div
          className="px-4 py-1.5 rounded-full flex gap-4 text-[11px]"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(8px)",
            color: "var(--text-secondary)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <span><strong style={{ color: "var(--text-primary)" }}>左クリック</strong> 回転</span>
          <span><strong style={{ color: "var(--text-primary)" }}>右クリック</strong> 移動</span>
          <span><strong style={{ color: "var(--text-primary)" }}>スクロール</strong> ズーム</span>
        </div>
      </div>
    </div>
  );
}
