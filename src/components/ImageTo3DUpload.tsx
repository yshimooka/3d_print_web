"use client";

import { useState, useCallback, useRef } from "react";
import { ImageIcon, Loader2, CheckCircle, AlertCircle, Sparkles } from "lucide-react";

interface ImageTo3DUploadProps {
  onGenerated: (file: File) => void;
}

type Stage = "idle" | "ready" | "uploading" | "generating" | "success" | "error";

export default function ImageTo3DUpload({ onGenerated }: ImageTo3DUploadProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleImageSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("画像ファイル（PNG, JPG, WEBP）を選択してください");
      setStage("error");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setImageFile(file);
    setPreviewUrl(url);
    setStage("ready");
    setErrorMsg(null);
  }, [previewUrl]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleImageSelect(file);
    },
    [handleImageSelect]
  );

  const handleGenerate = useCallback(async () => {
    if (!imageFile) return;

    setStage("uploading");
    setProgress(0);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const taskRes = await fetch("/api/meshy", { method: "POST", body: formData });
      const taskData = await taskRes.json();

      if (!taskRes.ok) throw new Error(taskData.error || "生成タスクの作成に失敗しました");

      const { taskId } = taskData;
      setStage("generating");

      await new Promise<string>((resolve, reject) => {
        const poll = async () => {
          try {
            const res = await fetch(`/api/meshy/${taskId}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setProgress(data.progress ?? 0);

            if (data.status === "SUCCEEDED") {
              clearInterval(pollRef.current!);
              resolve(data.modelUrl);
            } else if (data.status === "FAILED") {
              clearInterval(pollRef.current!);
              reject(new Error("3D生成に失敗しました。別の画像で試してください。"));
            }
          } catch (err) {
            clearInterval(pollRef.current!);
            reject(err);
          }
        };

        pollRef.current = setInterval(poll, 5000);
        poll();
      }).then(async (modelUrl) => {
        const modelRes = await fetch(`/api/meshy/model?url=${encodeURIComponent(modelUrl)}`);
        if (!modelRes.ok) throw new Error("モデルのダウンロードに失敗しました");

        const blob = await modelRes.blob();
        const generatedFile = new File([blob], "generated_model.glb", {
          type: "model/gltf-binary",
        });

        setStage("success");
        setTimeout(() => onGenerated(generatedFile), 800);
      });
    } catch (err: unknown) {
      setStage("error");
      setErrorMsg(err instanceof Error ? err.message : "予期しないエラーが発生しました");
    }
  }, [imageFile, onGenerated]);

  const handleReset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (pollRef.current) clearInterval(pollRef.current);
    setStage("idle");
    setImageFile(null);
    setPreviewUrl(null);
    setProgress(0);
    setErrorMsg(null);
  }, [previewUrl]);

  // ── Idle / Error ──────────────────────────────────────────────────────────
  if (stage === "idle" || stage === "error") {
    return (
      <div className="w-full max-w-[520px] mx-auto flex flex-col items-center px-6">
        <div className="text-center mb-10">
          <h2
            className="text-[32px] font-semibold tracking-[-0.02em] leading-[1.15] mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            画像から3Dモデルを生成
          </h2>
          <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            写真を1枚アップロードすると、AIが自動で3Dデータを作成します。
          </p>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center py-16 px-8 text-center rounded-2xl transition-all duration-300 cursor-pointer"
          style={{
            background: isDragging ? "var(--accent-light)" : "var(--surface)",
            border: `1.5px solid ${
              isDragging ? "var(--accent)" : stage === "error" ? "#EF4444" : "var(--border)"
            }`,
            boxShadow: isDragging ? "0 0 0 4px rgba(41,151,255,0.1)" : "none",
            transform: isDragging ? "scale(1.01)" : "scale(1)",
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors duration-200"
            style={{
              background: isDragging ? "var(--accent)" : "var(--surface-secondary)",
              color: isDragging ? "#FFFFFF" : "var(--text-secondary)",
            }}
          >
            <ImageIcon size={22} strokeWidth={1.8} />
          </div>

          <p className="text-[15px] font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
            {isDragging ? "ドロップしてアップロード" : "画像をドラッグ＆ドロップ"}
          </p>
          <p className="text-[13px] mb-6" style={{ color: "var(--text-tertiary)" }}>
            PNG, JPG, WEBP に対応
          </p>

          <button
            className="text-[13px] font-medium px-5 py-2 rounded-lg transition-all duration-200 cursor-pointer"
            style={{ background: "var(--accent)", color: "#FFFFFF" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
          >
            画像を選択
          </button>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
          />
        </div>

        {stage === "error" && errorMsg && (
          <div className="mt-4 flex items-center gap-2 text-[13px]" style={{ color: "#EF4444" }}>
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        <p className="mt-4 text-[12px] text-center" style={{ color: "var(--text-tertiary)" }}>
          正面・斜め・背面など、複数角度の写真があると精度が上がります
        </p>
      </div>
    );
  }

  // ── Ready ─────────────────────────────────────────────────────────────────
  if (stage === "ready") {
    return (
      <div className="w-full max-w-[440px] mx-auto px-6 flex flex-col items-center">
        <h2
          className="text-[24px] font-semibold tracking-tight mb-6"
          style={{ color: "var(--text-primary)" }}
        >
          この画像で生成しますか？
        </h2>

        <div
          className="w-full rounded-2xl overflow-hidden mb-6"
          style={{ border: "1.5px solid var(--border)" }}
        >
          {previewUrl && (
            <img
              src={previewUrl}
              alt="preview"
              className="w-full object-cover max-h-[320px]"
            />
          )}
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={handleReset}
            className="flex-1 py-3 rounded-xl text-[14px] font-medium transition-colors cursor-pointer"
            style={{
              background: "var(--surface)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            やり直す
          </button>
          <button
            onClick={handleGenerate}
            className="flex-[2] py-3 rounded-xl text-[14px] font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
            style={{ background: "var(--accent)", color: "#FFFFFF" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
          >
            <Sparkles size={15} />
            3Dモデルを生成する
          </button>
        </div>

        <p className="mt-4 text-[12px] text-center" style={{ color: "var(--text-tertiary)" }}>
          生成には1〜3分かかります
        </p>
      </div>
    );
  }

  // ── Uploading / Generating ────────────────────────────────────────────────
  if (stage === "uploading" || stage === "generating") {
    const isUploading = stage === "uploading";
    const statusText = isUploading
      ? "画像を送信中..."
      : `AIが3Dモデルを生成中... ${progress}%`;

    return (
      <div className="w-full max-w-[440px] mx-auto px-6 flex flex-col items-center">
        <div className="relative mb-8">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="preview"
              className="w-48 h-48 object-cover rounded-2xl"
              style={{ opacity: 0.4 }}
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={40} className="animate-spin" style={{ color: "var(--accent)" }} />
          </div>
        </div>

        <h2
          className="text-[18px] font-semibold mb-2 text-center"
          style={{ color: "var(--text-primary)" }}
        >
          {statusText}
        </h2>
        <p className="text-[13px] text-center mb-6" style={{ color: "var(--text-secondary)" }}>
          そのままお待ちください
        </p>

        {stage === "generating" && (
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ background: "var(--surface-secondary)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress}%`, background: "var(--accent)" }}
            />
          </div>
        )}
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (stage === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <CheckCircle size={48} style={{ color: "var(--success)" }} />
        <p className="text-[18px] font-semibold" style={{ color: "var(--text-primary)" }}>
          3Dモデルの生成が完了しました
        </p>
      </div>
    );
  }

  return null;
}
