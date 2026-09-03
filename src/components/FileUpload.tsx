"use client";

import { useCallback, useRef, useState } from "react";
import { ArrowRight, FileUp, Info } from "lucide-react";

interface FileUploadProps {
  onUpload: (file: File) => void;
}

const ACCEPTED_EXTENSIONS = ["stl", "obj", "gltf", "glb", "stp", "step"];

function isSupported(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return Boolean(extension && ACCEPTED_EXTENSIONS.includes(extension));
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitFile = useCallback(
    (file: File) => {
      if (!isSupported(file)) {
        setError("対応している形式は STL / OBJ / GLTF / GLB / STEP です。");
        return;
      }
      setError(null);
      onUpload(file);
    },
    [onUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files?.[0];
      if (droppedFile) submitFile(droppedFile);
    },
    [submitFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) submitFile(selectedFile);
    },
    [submitFile]
  );

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col items-center px-5">
      <div className="mb-8 text-center">
        <p className="mb-3 text-[13px] font-bold" style={{ color: "var(--accent)" }}>
          Step 1
        </p>
        <h1 className="mb-4 text-[34px] font-bold leading-[1.2] sm:text-[44px]" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
          3Dファイルをアップロード
        </h1>
        <p className="mx-auto max-w-[520px] text-[15px] leading-[1.85]" style={{ color: "var(--text-secondary)" }}>
          ファイルを置くと、サイズと体積を確認して見積もりを計算します。
          見積もりまでは無料、会員登録も不要です。
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="w-full cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all duration-200 sm:p-8"
        style={{
          background: isDragging ? "var(--accent-light)" : "rgba(255,255,255,0.86)",
          borderColor: isDragging ? "var(--accent)" : "var(--border)",
          boxShadow: isDragging ? "0 0 0 6px rgba(200, 107, 58, 0.1)" : "var(--shadow-card)",
          transform: isDragging ? "translateY(-2px)" : "translateY(0)",
        }}
      >
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg"
          style={{ background: isDragging ? "var(--accent)" : "var(--surface-secondary)", color: isDragging ? "#fff" : "var(--accent)" }}
        >
          <FileUp size={26} strokeWidth={1.8} />
        </div>
        <p className="mb-2 text-[17px] font-bold" style={{ color: "var(--text-primary)" }}>
          {isDragging ? "ここにドロップしてください" : "ファイルをドラッグ、または選択"}
        </p>
        <p className="mb-6 text-[13px]" style={{ color: "var(--text-secondary)" }}>
          STL / OBJ / GLTF / GLB / STEP に対応
        </p>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-[14px] font-bold text-white transition-all duration-200"
          style={{ background: "var(--accent)" }}
        >
          ファイルを選択
          <ArrowRight size={16} strokeWidth={2} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".stl,.obj,.gltf,.glb,.stp,.step"
          onChange={handleChange}
        />
      </div>

      {error && (
        <p className="mt-4 rounded-lg px-4 py-3 text-[13px] font-semibold" style={{ background: "var(--danger-light)", color: "var(--danger)" }}>
          {error}
        </p>
      )}

      <div className="mt-5 flex items-start gap-2 rounded-lg px-4 py-3" style={{ background: "var(--surface-secondary)", color: "var(--text-secondary)" }}>
        <Info size={16} strokeWidth={1.8} className="mt-0.5 shrink-0" />
        <p className="text-[12px] leading-[1.7]">
          ファイルは見積もりと注文確認にだけ使用します。注文前に決済は発生しません。
        </p>
      </div>
    </div>
  );
}
