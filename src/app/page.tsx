"use client";

import { useState, useCallback } from "react";
import * as THREE from "three";
import FileUpload from "@/components/FileUpload";
import CADViewer from "@/components/CADViewer";
import MaterialSelector from "@/components/MaterialSelector";
import AnalysisPanel from "@/components/AnalysisPanel";
import CheckoutForm from "@/components/CheckoutForm";
import { type Material, type MaterialColor } from "@/data/materials";
import { analyzeGeometry, type AnalysisResult } from "@/utils/printAnalysis";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedColor, setSelectedColor] = useState<MaterialColor | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Analysis state
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setAnalysisResult(null);
    setShowOverlay(false);
  };

  const clearFile = () => {
    setFile(null);
    setSelectedMaterial(null);
    setSelectedColor(null);
    setQuantity(1);
    setAnalysisResult(null);
    setShowOverlay(false);
  };

  const handleModelLoaded = useCallback((model: THREE.Object3D) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      try {
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

  const handleSubmit = () => {
    setShowCheckout(true);
  };

  const handleBackFromCheckout = () => {
    setShowCheckout(false);
  };

  const estimatedPrice = selectedMaterial
    ? selectedMaterial.pricePerCm3 * 10 * quantity
    : 0;

  // ─── Checkout Page ─────────────────────
  if (showCheckout && file && selectedMaterial && selectedColor) {
    return (
      <CheckoutForm
        fileName={file.name}
        material={selectedMaterial}
        color={selectedColor}
        quantity={quantity}
        estimatedPrice={estimatedPrice}
        onBack={handleBackFromCheckout}
      />
    );
  }

  return (
    <main className="h-screen w-screen flex flex-col overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <header
        className="shrink-0 h-[52px] px-6 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-5">
          <h1
            className="text-[15px] font-semibold tracking-[-0.01em]"
            style={{ color: 'var(--text-primary)' }}
          >
            日本立体造形
          </h1>
          {file && (
            <div className="h-4" style={{ borderLeft: '1px solid var(--border)' }} />
          )}
          {file && (
            <span
              className="text-[13px] truncate max-w-[240px]"
              style={{ color: 'var(--text-secondary)' }}
            >
              {file.name}
            </span>
          )}
        </div>
        {file && (
          <button
            onClick={clearFile}
            className="text-[13px] font-medium px-3 py-1 rounded-md transition-colors cursor-pointer"
            style={{ color: 'var(--accent)', background: 'transparent' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-light)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            新しいファイル
          </button>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {!file ? (
          <div className="flex-1 flex items-center justify-center">
            <FileUpload onUpload={handleFileUpload} />
          </div>
        ) : (
          <>
            {/* 3D Viewer */}
            <div className="flex-1 relative" style={{ background: 'var(--canvas-bg)' }}>
              <CADViewer
                file={file}
                colorHex={selectedColor?.hex}
                materialProps={selectedMaterial?.renderProps}
                onModelLoaded={handleModelLoaded}
                showAnalysisOverlay={showOverlay}
                analysisResult={analysisResult}
              />

              {/* Floating segmented toggle on the viewer */}
              {analysisResult && analysisResult.issues.length > 0 && (
                <div
                  className="absolute top-4 left-4 z-10 flex rounded-lg p-0.5"
                  style={{
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
                  }}
                >
                  <button
                    onClick={() => setShowOverlay(false)}
                    className="px-3.5 py-1.5 rounded-md text-[12px] font-medium transition-all duration-200 cursor-pointer"
                    style={{
                      background: !showOverlay ? '#FFFFFF' : 'transparent',
                      color: !showOverlay ? 'var(--text-primary)' : 'var(--text-tertiary)',
                      boxShadow: !showOverlay ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    プレビュー
                  </button>
                  <button
                    onClick={() => setShowOverlay(true)}
                    className="px-3.5 py-1.5 rounded-md text-[12px] font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                    style={{
                      background: showOverlay ? '#FFFFFF' : 'transparent',
                      color: showOverlay ? '#EF4444' : 'var(--text-tertiary)',
                      boxShadow: showOverlay ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: showOverlay ? '#EF4444' : 'var(--text-tertiary)' }}
                    />
                    問題箇所
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ width: '1px', background: 'var(--border)' }} />

            {/* Right Panel */}
            <div className="w-[360px] shrink-0 flex flex-col overflow-hidden" style={{ background: 'var(--surface)' }}>
              <MaterialSelector
                selectedMaterial={selectedMaterial}
                selectedColor={selectedColor}
                quantity={quantity}
                onMaterialChange={setSelectedMaterial}
                onColorChange={setSelectedColor}
                onQuantityChange={setQuantity}
                onSubmit={handleSubmit}
                fileName={file.name}
                analysisPanel={
                  <AnalysisPanel
                    result={analysisResult}
                    isAnalyzing={isAnalyzing}
                    showOverlay={showOverlay}
                    onToggleOverlay={handleToggleOverlay}
                  />
                }
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
