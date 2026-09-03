"use client";

import { type AnalysisResult } from "@/utils/printAnalysis";
import {
  AlertTriangle,
  Box,
  CheckCircle2,
  Loader2,
  Ruler,
  XCircle,
} from "lucide-react";

interface AnalysisPanelProps {
  result: AnalysisResult | null;
  isAnalyzing: boolean;
  showOverlay: boolean;
  onToggleOverlay: () => void;
}

export default function AnalysisPanel({
  result,
  isAnalyzing,
  showOverlay,
  onToggleOverlay,
}: AnalysisPanelProps) {
  if (isAnalyzing) {
    return (
      <div className="rounded-lg border p-4" style={{ background: "var(--surface-secondary)", borderColor: "var(--border-light)" }}>
        <div className="flex items-center gap-3">
          <Loader2 size={17} className="animate-spin" style={{ color: "var(--accent)" }} />
          <div>
            <p className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
              サイズと体積を確認しています
            </p>
            <p className="mt-1 text-[12px]" style={{ color: "var(--text-secondary)" }}>
              大きいファイルは少し時間がかかります。
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const criticalCount = result.issues.filter((issue) => issue.severity === "critical").length;
  const warningCount = result.issues.filter((issue) => issue.severity === "warning").length;
  const hasIssues = result.issues.length > 0;
  const tone = criticalCount > 0 ? "danger" : warningCount > 0 ? "warning" : "success";

  const toneStyles = {
    success: {
      bg: "var(--success-light)",
      color: "var(--success)",
      icon: CheckCircle2,
      title: "このモデルは印刷に適しています",
      message: "大きな問題は見つかりませんでした。素材と数量を選んで見積もりを確認できます。",
    },
    warning: {
      bg: "var(--warning-light)",
      color: "var(--warning)",
      icon: AlertTriangle,
      title: `${warningCount}件の注意点があります`,
      message: "印刷は可能ですが、薄い箇所などがあります。必要に応じて問題箇所を確認してください。",
    },
    danger: {
      bg: "var(--danger-light)",
      color: "var(--danger)",
      icon: XCircle,
      title: `${criticalCount}件の重大な問題があります`,
      message: "印刷に失敗する可能性があります。修正後にもう一度アップロードしてください。",
    },
  }[tone];

  const StatusIcon = toneStyles.icon;

  return (
    <div className="space-y-3">
      <div className="rounded-lg p-4" style={{ background: toneStyles.bg }}>
        <div className="mb-2 flex items-center gap-2">
          <StatusIcon size={17} strokeWidth={2} style={{ color: toneStyles.color }} />
          <span className="text-[13px] font-bold" style={{ color: toneStyles.color }}>
            {toneStyles.title}
          </span>
        </div>
        <p className="text-[12px] leading-[1.75]" style={{ color: "var(--text-secondary)" }}>
          {toneStyles.message}
        </p>
      </div>

      {hasIssues && (
        <button
          onClick={onToggleOverlay}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[12px] font-bold transition-all active:scale-[0.98]"
          style={{
            background: showOverlay ? "var(--accent)" : "var(--surface-secondary)",
            color: showOverlay ? "#fff" : "var(--text-secondary)",
          }}
        >
          <Box size={14} strokeWidth={2} />
          {showOverlay ? "問題箇所を表示中" : "問題箇所をハイライト"}
        </button>
      )}

      {result.issues.map((issue, index) => (
        <div key={`${issue.label}-${index}`} className="rounded-lg border p-3" style={{ background: "var(--surface)", borderColor: "var(--border-light)" }}>
          <div className="mb-1 flex items-center gap-2">
            {issue.severity === "critical" ? (
              <XCircle size={14} strokeWidth={2} style={{ color: "var(--danger)" }} />
            ) : (
              <AlertTriangle size={14} strokeWidth={2} style={{ color: "var(--warning)" }} />
            )}
            <span className="text-[12px] font-bold" style={{ color: issue.severity === "critical" ? "var(--danger)" : "var(--warning)" }}>
              {issue.label}
            </span>
          </div>
          <p className="text-[12px] leading-[1.65]" style={{ color: "var(--text-secondary)" }}>
            {issue.description}
          </p>
        </div>
      ))}

      <div className="rounded-lg p-3" style={{ background: "var(--surface-secondary)" }}>
        <p className="mb-2 text-[12px] font-bold" style={{ color: "var(--text-tertiary)" }}>
          モデル情報
        </p>
        <div className="flex items-center justify-between gap-3 text-[12px]">
          <span className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
            <Ruler size={12} /> サイズ（mm）
          </span>
          <span className="font-bold" style={{ color: "var(--text-primary)" }}>
            {result.stats.boundingBox.x.toFixed(1)} × {result.stats.boundingBox.y.toFixed(1)} × {result.stats.boundingBox.z.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
