"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import * as THREE from "three";
import { CheckCircle2, PackageCheck, RotateCcw } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import CADViewer from "@/components/CADViewer";
import MaterialSelector from "@/components/MaterialSelector";
import AnalysisPanel from "@/components/AnalysisPanel";
import CheckoutForm from "@/components/CheckoutForm";
import { type Material, type MaterialColor } from "@/data/materials";
import { analyzeGeometry, type AnalysisResult } from "@/utils/printAnalysis";
import { computeMeshStats, computeQuote, type MeshStats } from "@/lib/quote";

export default function OrderPage() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedColor, setSelectedColor] = useState<MaterialColor | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Analysis state
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [meshStats, setMeshStats] = useState<MeshStats | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setAnalysisResult(null);
    setMeshStats(null);
    setShowOverlay(false);
  };

  const clearFile = () => {
    setFile(null);
    setSelectedMaterial(null);
    setSelectedColor(null);
    setQuantity(1);
    setAnalysisResult(null);
    setMeshStats(null);
    setShowOverlay(false);
  };

  const handleModelLoaded = useCallback((model: THREE.Object3D) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      try {
        setMeshStats(computeMeshStats(model));
        const result = analyzeGeometry(model);
        setAnalysisResult(result);
        // Auto-show overlay if issues found
        if (result.issues.length > 0) {
          setShowOverlay(true);
        }
      } catch (err) {
        console.error("Analysis failed:", err);
      }
      setIsAnalyzing(false);
    }, 100);
  }, []);

  const handleToggleOverlay = useCallback(() => {
    setShowOverlay((prev) => !prev);
  }, []);

  const quote = useMemo(() => {
    if (!selectedMaterial || !meshStats) return null;
    return computeQuote(selectedMaterial.id, meshStats, quantity);
  }, [selectedMaterial, meshStats, quantity]);

  const handleSubmit = () => {
    setShowCheckout(true);
  };

  const handleBackFromCheckout = () => {
    setShowCheckout(false);
  };

  // ─── Checkout Page ─────────────────────
  if (showCheckout && file && selectedMaterial && selectedColor && meshStats && quote) {
    return (
      <CheckoutForm
        file={file}
        material={selectedMaterial}
        color={selectedColor}
        quantity={quantity}
        stats={meshStats}
        quote={quote}
        onBack={handleBackFromCheckout}
      />
    );
  }

  return (
    <main className="flex min-h-screen flex-col" style={{ background: "var(--background)" }}>
      <header className="shrink-0 border-b" style={{ background: "rgba(247,246,242,0.9)", borderColor: "var(--border-light)", backdropFilter: "blur(16px)" }}>
        <div className="mx-auto flex h-[68px] w-full max-w-[1500px] items-center justify-between px-5">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-75" style={{ textDecoration: "none" }}>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--accent)", color: "#fff" }}>
                <PackageCheck size={18} strokeWidth={2} />
              </span>
              <span className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
                大國造形
              </span>
            </Link>
            {file && (
              <>
                <span className="hidden h-5 w-px sm:block" style={{ background: "var(--border)" }} />
                <span className="truncate text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>
                  {file.name}
                </span>
              </>
            )}
          </div>

          {file ? (
            <button
              onClick={clearFile}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-bold transition-colors hover:bg-[var(--accent-light)]"
              style={{ color: "var(--accent)" }}
            >
              <RotateCcw size={15} strokeWidth={2} />
              新しいファイル
            </button>
          ) : (
            <div className="hidden items-center gap-2 text-[12px] font-semibold sm:flex" style={{ color: "var(--text-secondary)" }}>
              <CheckCircle2 size={16} strokeWidth={1.8} style={{ color: "var(--success)" }} />
              見積もりまでは無料
            </div>
          )}
        </div>
      </header>

      {!file ? (
        <section className="flex flex-1 items-center justify-center px-4 py-14">
          <FileUpload onUpload={handleFileUpload} />
        </section>
      ) : (
        <section className="mx-auto grid w-full max-w-[1500px] flex-1 grid-cols-1 gap-4 p-4 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="flex min-h-[520px] flex-col overflow-hidden rounded-lg border lg:min-h-0" style={{ background: "var(--surface)", borderColor: "var(--border-light)", boxShadow: "var(--shadow-card)" }}>
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-3" style={{ borderColor: "var(--border-light)" }}>
              <div>
                <p className="text-[12px] font-bold" style={{ color: "var(--accent)" }}>
                  3Dプレビュー
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                  回転・拡大しながら形状を確認できます。
                </p>
              </div>
              {meshStats && (
                <div className="rounded-lg px-3 py-2 text-[12px] font-semibold" style={{ background: "var(--surface-secondary)", color: "var(--text-primary)" }}>
                  {meshStats.bboxMm.x.toFixed(0)} × {meshStats.bboxMm.y.toFixed(0)} × {meshStats.bboxMm.z.toFixed(0)} mm / {meshStats.volumeCm3.toFixed(1)} cm³
                </div>
              )}
            </div>

            <div className="relative flex-1 overflow-hidden" style={{ background: "var(--canvas-bg)" }}>
              <CADViewer
                file={file}
                colorHex={selectedColor?.hex}
                materialProps={selectedMaterial?.renderProps}
                onModelLoaded={handleModelLoaded}
                showAnalysisOverlay={showOverlay}
                analysisResult={analysisResult}
              />

              {analysisResult && analysisResult.issues.length > 0 && (
                <div className="absolute left-4 top-4 z-10 flex rounded-lg border p-1" style={{ background: "rgba(255,255,255,0.9)", borderColor: "var(--border-light)", backdropFilter: "blur(12px)" }}>
                  <button
                    onClick={() => setShowOverlay(false)}
                    className="rounded-lg px-3 py-2 text-[12px] font-bold transition-all"
                    style={{ background: !showOverlay ? "var(--text-primary)" : "transparent", color: !showOverlay ? "#fff" : "var(--text-secondary)" }}
                  >
                    プレビュー
                  </button>
                  <button
                    onClick={() => setShowOverlay(true)}
                    className="rounded-lg px-3 py-2 text-[12px] font-bold transition-all"
                    style={{ background: showOverlay ? "var(--danger)" : "transparent", color: showOverlay ? "#fff" : "var(--text-secondary)" }}
                  >
                    問題箇所
                  </button>
                </div>
              )}
            </div>
          </div>

          <aside className="flex min-h-[620px] overflow-hidden rounded-lg border lg:min-h-0" style={{ background: "var(--surface)", borderColor: "var(--border-light)", boxShadow: "var(--shadow-card)" }}>
            <MaterialSelector
              selectedMaterial={selectedMaterial}
              selectedColor={selectedColor}
              quantity={quantity}
              stats={meshStats}
              quote={quote}
              onMaterialChange={setSelectedMaterial}
              onColorChange={setSelectedColor}
              onQuantityChange={setQuantity}
              onSubmit={handleSubmit}
              analysisPanel={
                <AnalysisPanel
                  result={analysisResult}
                  isAnalyzing={isAnalyzing}
                  showOverlay={showOverlay}
                  onToggleOverlay={handleToggleOverlay}
                />
              }
            />
          </aside>
        </section>
      )}
    </main>
  );
}
