"use client";

import { type AnalysisResult } from "@/utils/printAnalysis";
import {
  AlertTriangle,
  XCircle,
  CheckCircle,
  Loader2,
  Ruler,
  Box,
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
      <div
        className="p-4 rounded-xl flex items-center gap-3"
        style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-light)' }}
      >
        <Loader2 size={16} className="animate-spin" style={{ color: 'var(--accent)' }} />
        <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          モデルを解析中...
        </span>
      </div>
    );
  }

  if (!result) return null;

  const hasIssues = result.issues.length > 0;
  const criticalCount = result.issues.filter((i) => i.severity === "critical").length;
  const warningCount = result.issues.filter((i) => i.severity === "warning").length;

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div
        className="p-3.5 rounded-xl"
        style={{
          background: hasIssues
            ? criticalCount > 0
              ? 'rgba(239, 68, 68, 0.06)'
              : 'rgba(245, 158, 11, 0.06)'
            : 'rgba(34, 197, 94, 0.06)',
          border: `1px solid ${
            hasIssues
              ? criticalCount > 0
                ? 'rgba(239, 68, 68, 0.15)'
                : 'rgba(245, 158, 11, 0.15)'
              : 'rgba(34, 197, 94, 0.15)'
          }`,
        }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          {criticalCount > 0 ? (
            <XCircle size={15} style={{ color: '#EF4444' }} />
          ) : warningCount > 0 ? (
            <AlertTriangle size={15} style={{ color: '#F59E0B' }} />
          ) : (
            <CheckCircle size={15} style={{ color: '#22C55E' }} />
          )}
          <span
            className="text-[13px] font-semibold"
            style={{
              color: criticalCount > 0
                ? '#EF4444'
                : warningCount > 0
                  ? '#D97706'
                  : '#16A34A',
            }}
          >
            {criticalCount > 0
              ? `${criticalCount}件の重大な問題`
              : warningCount > 0
                ? `${warningCount}件の注意点`
                : "問題は検出されませんでした"}
          </span>
        </div>
        <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {criticalCount > 0
            ? "印刷に失敗する可能性のある箇所が見つかりました。修正を推奨します。"
            : warningCount > 0
              ? "注意が必要な箇所がありますが、印刷は可能です。"
              : "このモデルは印刷に適した形状です。"}
        </p>
      </div>

      {/* Toggle overlay */}
      {hasIssues && (
        <button
          onClick={onToggleOverlay}
          className="w-full px-3 py-2 rounded-lg text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          style={{
            background: showOverlay ? 'var(--accent)' : 'var(--surface-secondary)',
            color: showOverlay ? '#FFFFFF' : 'var(--text-secondary)',
            border: showOverlay ? 'none' : '1px solid var(--border)',
          }}
        >
          <Box size={13} />
          {showOverlay ? "ハイライト表示中" : "問題箇所をハイライト"}
        </button>
      )}

      {/* Issues list */}
      {result.issues.map((issue, idx) => (
        <div
          key={idx}
          className="p-3 rounded-lg"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-light)',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            {issue.severity === "critical" ? (
              <XCircle size={13} style={{ color: '#EF4444' }} />
            ) : (
              <AlertTriangle size={13} style={{ color: '#F59E0B' }} />
            )}
            <span
              className="text-[12px] font-semibold"
              style={{
                color: issue.severity === "critical" ? '#EF4444' : '#D97706',
              }}
            >
              {issue.label}
            </span>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {issue.description}
          </p>
        </div>
      ))}

      {/* Model Stats */}
      <div
        className="p-3 rounded-lg"
        style={{ background: 'var(--surface-secondary)' }}
      >
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-2"
          style={{ color: 'var(--text-tertiary)' }}
        >
          モデル情報
        </p>
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
            <Ruler size={11} /> サイズ（mm）
          </span>
          <span style={{ color: 'var(--text-primary)' }}>
            {result.stats.boundingBox.x.toFixed(1)} × {result.stats.boundingBox.y.toFixed(1)} × {result.stats.boundingBox.z.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
