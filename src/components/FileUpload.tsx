"use client";

import { useState, useCallback, useRef } from "react";
import { ArrowUpFromLine } from "lucide-react";

interface FileUploadProps {
  onUpload: (file: File) => void;
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onUpload(e.dataTransfer.files[0]);
      }
    },
    [onUpload]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onUpload(e.target.files[0]);
      }
    },
    [onUpload]
  );

  return (
    <div className="w-full max-w-[520px] mx-auto flex flex-col items-center px-6">
      {/* Heading */}
      <div className="text-center mb-10">
        <h2
          className="text-[32px] font-semibold tracking-[-0.02em] leading-[1.15] mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          3Dファイルをアップロード
        </h2>
        <p
          className="text-[15px] leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          AIで作った3Dファイルをそのまま使えます。
          <br />
          アップロードするだけで注文できます。
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="w-full flex flex-col items-center justify-center py-16 px-8 text-center rounded-2xl transition-all duration-300 cursor-pointer"
        style={{
          background: isDragging ? 'var(--accent-light)' : 'var(--surface)',
          border: `1.5px solid ${isDragging ? 'var(--accent)' : 'var(--border)'}`,
          boxShadow: isDragging
            ? '0 0 0 4px rgba(212, 112, 42, 0.12)'
            : 'none',
          transform: isDragging ? 'scale(1.01)' : 'scale(1)',
        }}
      >
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors duration-200"
          style={{
            background: isDragging ? 'var(--accent)' : 'var(--surface-secondary)',
            color: isDragging ? '#FFFFFF' : 'var(--text-secondary)',
          }}
        >
          <ArrowUpFromLine size={22} strokeWidth={1.8} />
        </div>

        <p
          className="text-[15px] font-medium mb-1.5"
          style={{ color: 'var(--text-primary)' }}
        >
          {isDragging ? "ドロップしてアップロード" : "ファイルをドラッグ＆ドロップ"}
        </p>
        <p
          className="text-[13px] mb-6"
          style={{ color: 'var(--text-tertiary)' }}
        >
          STL, OBJ, GLTF, STEP に対応
        </p>

        {/* CTA */}
        <button
          className="text-[13px] font-semibold px-5 py-2 rounded-lg transition-all duration-200 cursor-pointer hover:opacity-90"
          style={{
            background: 'var(--accent)',
            color: '#FFFFFF',
          }}
        >
          ファイルを選択
        </button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".stl,.obj,.gltf,.glb,.stp,.step"
          onChange={handleChange}
        />
      </div>

      {/* Footer note */}
      <p
        className="mt-4 text-[12px] text-center"
        style={{ color: 'var(--text-tertiary)' }}
      >
        STL / OBJ / GLTF / STEP 形式に対応しています
      </p>
    </div>
  );
}
