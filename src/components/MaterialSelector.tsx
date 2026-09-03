"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { materials, type Material, type MaterialColor } from "@/data/materials";
import { deliveryWindow, unitPriceFor, type MeshStats, type Quote } from "@/lib/quote";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronRight,
  Info,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
} from "lucide-react";

interface MaterialSelectorProps {
  selectedMaterial: Material | null;
  selectedColor: MaterialColor | null;
  quantity: number;
  stats: MeshStats | null;
  quote: Quote | null;
  onMaterialChange: (material: Material) => void;
  onColorChange: (color: MaterialColor) => void;
  onQuantityChange: (quantity: number) => void;
  onSubmit: () => void;
  analysisPanel?: ReactNode;
}

function isLight(hex: string) {
  return ["#F5F5F5", "#E0F2FE", "#FEF3C7", "#DBEAFE", "#C0C0C0"].includes(hex);
}

function presetLabelFor(index: number) {
  if (index === 0) return "迷ったらこれ";
  if (index === 1) return "細かい表現に";
  return "強度が必要な部品に";
}

export default function MaterialSelector({
  selectedMaterial,
  selectedColor,
  quantity,
  stats,
  quote,
  onMaterialChange,
  onColorChange,
  onQuantityChange,
  onSubmit,
  analysisPanel,
}: MaterialSelectorProps) {
  const [detailMaterial, setDetailMaterial] = useState<Material | null>(null);
  const delivery = deliveryWindow();

  const priceLabelFor = (material: Material) =>
    stats
      ? `このモデル: ¥${unitPriceFor(material, stats).toLocaleString()} / 個`
      : `¥${material.pricePerCm3.toLocaleString()}/cm³〜`;

  const handleMaterialClick = (material: Material) => {
    onMaterialChange(material);
    if (material.colors.length > 0) onColorChange(material.colors[0]);
  };

  if (detailMaterial) {
    return (
      <div className="flex h-full w-full flex-col">
        <div className="flex shrink-0 items-center justify-between border-b p-4" style={{ borderColor: "var(--border-light)" }}>
          <button
            onClick={() => setDetailMaterial(null)}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[var(--surface-secondary)]"
            style={{ color: "var(--text-secondary)" }}
            aria-label="素材詳細を閉じる"
          >
            <ArrowLeft size={18} strokeWidth={1.9} />
          </button>
          <span className="text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>
            素材の詳細
          </span>
          <div className="h-9 w-9" />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="relative aspect-[4/3]" style={{ background: "var(--surface-secondary)" }}>
            <Image src={detailMaterial.image} alt={detailMaterial.nameJa} fill className="object-cover" sizes="400px" />
          </div>
          <div className="space-y-5 p-5">
            <div>
              <p className="mb-2 text-[13px] font-bold" style={{ color: "var(--accent)" }}>
                {detailMaterial.method}
              </p>
              <h3 className="text-[22px] font-bold" style={{ color: "var(--text-primary)" }}>
                {detailMaterial.nameJa}
              </h3>
              <p className="mt-3 text-[14px] leading-[1.85]" style={{ color: "var(--text-secondary)" }}>
                {detailMaterial.details}
              </p>
            </div>

            <div className="rounded-lg p-4" style={{ background: "var(--surface-secondary)" }}>
              {[
                ["価格", priceLabelFor(detailMaterial)],
                ["精度", detailMaterial.tolerance],
                ["積層ピッチ", detailMaterial.layerHeight],
                ["最大サイズ", `${detailMaterial.maxSizeMm.join(" × ")} mm`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-2 text-[13px]">
                  <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                  <span className="text-right font-bold" style={{ color: "var(--text-primary)" }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {detailMaterial.features.map((feature) => (
                <span key={feature} className="rounded-lg px-3 py-1.5 text-[12px] font-bold" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t p-4" style={{ borderColor: "var(--border-light)" }}>
          <button
            onClick={() => {
              handleMaterialClick(detailMaterial);
              setDetailMaterial(null);
            }}
            className="h-11 w-full rounded-lg text-[14px] font-bold text-white transition-all active:scale-[0.98]"
            style={{ background: "var(--accent)" }}
          >
            この素材を選択
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="border-b p-5" style={{ borderColor: "var(--border-light)" }}>
          <p className="mb-2 text-[13px] font-bold" style={{ color: "var(--accent)" }}>
            Step 2
          </p>
          <h2 className="text-[22px] font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
            素材と数量を選ぶ
          </h2>
          <p className="mt-3 text-[13px] leading-[1.75]" style={{ color: "var(--text-secondary)" }}>
            用途に近い素材を選ぶと、下部の見積もりが更新されます。
          </p>
        </div>

        {analysisPanel && (
          <section className="border-b p-5" style={{ borderColor: "var(--border-light)" }}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>
                印刷チェック
              </h3>
              <span className="text-[12px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                自動解析
              </span>
            </div>
            {analysisPanel}
          </section>
        )}

        <section className="border-b p-5" style={{ borderColor: "var(--border-light)" }}>
          <h3 className="mb-3 text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>
            素材プリセット
          </h3>
          <div className="space-y-3">
            {materials.map((material, index) => {
              const isSelected = selectedMaterial?.id === material.id;
              return (
                <article
                  key={material.id}
                  className="overflow-hidden rounded-lg border transition-all"
                  style={{
                    background: isSelected ? "var(--accent-light)" : "var(--surface)",
                    borderColor: isSelected ? "rgba(200,107,58,0.55)" : "var(--border-light)",
                  }}
                >
                  <button onClick={() => handleMaterialClick(material)} className="w-full text-left">
                    <div className="flex gap-3 p-3">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg" style={{ background: "var(--surface-secondary)" }}>
                        <Image src={material.image} alt={material.nameJa} fill className="object-cover" sizes="80px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="rounded-lg px-2 py-1 text-[11px] font-bold" style={{ background: isSelected ? "rgba(255,255,255,0.58)" : "var(--surface-secondary)", color: "var(--accent)" }}>
                            {presetLabelFor(index)}
                          </span>
                          {isSelected && <Check size={15} strokeWidth={2.2} style={{ color: "var(--accent)" }} />}
                        </div>
                        <h4 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
                          {material.nameJa}
                        </h4>
                        <p className="mt-1 line-clamp-2 text-[12px] leading-[1.55]" style={{ color: "var(--text-secondary)" }}>
                          {material.description}
                        </p>
                        <p className="mt-2 text-[12px] font-bold" style={{ color: "var(--text-primary)" }}>
                          {priceLabelFor(material)}
                        </p>
                      </div>
                    </div>
                  </button>

                  {isSelected && (
                    <div className="px-3 pb-3">
                      <button
                        onClick={() => setDetailMaterial(material)}
                        className="mb-3 text-[12px] font-bold transition-opacity hover:opacity-75"
                        style={{ color: "var(--accent)" }}
                      >
                        素材の詳細を見る
                      </button>
                      <div className="flex flex-wrap gap-2">
                        {material.colors.map((color) => {
                          const isColorSelected = selectedColor?.hex === color.hex;
                          return (
                            <button
                              key={color.hex}
                              onClick={() => onColorChange(color)}
                              title={color.name}
                              className="relative h-8 w-8 rounded-lg transition-transform active:scale-95"
                              style={{
                                backgroundColor: color.hex,
                                boxShadow: isColorSelected
                                  ? "0 0 0 2px #fff, 0 0 0 4px var(--accent)"
                                  : isLight(color.hex)
                                    ? "inset 0 0 0 1px rgba(30,37,40,0.14)"
                                    : "none",
                              }}
                            >
                              {isColorSelected && (
                                <Check
                                  size={14}
                                  strokeWidth={2.5}
                                  className="absolute inset-0 m-auto"
                                  style={{ color: isLight(color.hex) ? "var(--text-primary)" : "#fff" }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="p-5">
          <h3 className="mb-3 text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>
            数量
          </h3>
          <div className="flex items-center overflow-hidden rounded-lg border" style={{ borderColor: "var(--border-light)" }}>
            <button
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="flex h-11 w-12 items-center justify-center transition-colors hover:bg-[var(--surface-muted)]"
              style={{ background: "var(--surface-secondary)", color: "var(--text-secondary)" }}
              aria-label="数量を減らす"
            >
              <Minus size={15} strokeWidth={2} />
            </button>
            <input
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={(e) => onQuantityChange(Math.max(1, Math.min(100, parseInt(e.target.value, 10) || 1)))}
              className="h-11 min-w-0 flex-1 bg-transparent text-center text-[16px] font-bold"
              style={{ color: "var(--text-primary)" }}
              aria-label="数量"
            />
            <button
              onClick={() => onQuantityChange(Math.min(100, quantity + 1))}
              className="flex h-11 w-12 items-center justify-center transition-colors hover:bg-[var(--surface-muted)]"
              style={{ background: "var(--surface-secondary)", color: "var(--text-secondary)" }}
              aria-label="数量を増やす"
            >
              <Plus size={15} strokeWidth={2} />
            </button>
          </div>
        </section>
      </div>

      <div className="shrink-0 border-t p-5" style={{ borderColor: "var(--border-light)", background: "#fff" }}>
        {selectedMaterial && selectedColor && quote ? (
          <>
            {quote.issues.filter((issue) => issue.blocking).map((issue) => (
              <div key={issue.type} className="mb-3 flex items-start gap-2 rounded-lg p-3 text-[12px] leading-relaxed" style={{ background: "var(--danger-light)", color: "var(--danger)" }}>
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                <span>{issue.message}</span>
              </div>
            ))}

            <div className="space-y-2">
              <div className="flex justify-between gap-4 text-[13px]">
                <span style={{ color: "var(--text-secondary)" }}>造形価格（¥{quote.unitPrice.toLocaleString()} × {quantity}個）</span>
                <span className="font-bold" style={{ color: "var(--text-primary)" }}>¥{quote.printSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between gap-4 text-[13px]">
                <span style={{ color: "var(--text-secondary)" }}>基本手数料（検品・梱包）</span>
                <span className="font-bold" style={{ color: "var(--text-primary)" }}>¥{quote.handlingFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between gap-4 text-[13px]">
                <span style={{ color: "var(--text-secondary)" }}>送料（全国一律）</span>
                <span className="font-bold" style={{ color: quote.shippingFee === 0 ? "var(--success)" : "var(--text-primary)" }}>
                  {quote.shippingFee === 0 ? "無料" : `¥${quote.shippingFee.toLocaleString()}`}
                </span>
              </div>
              <div className="my-3 border-t" style={{ borderColor: "var(--border-light)" }} />
              <div className="flex items-end justify-between gap-4">
                <span className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
                  合計（税込）
                </span>
                <span className="text-[28px] font-bold" style={{ color: "var(--accent)" }}>
                  ¥{quote.total.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-start gap-2 text-[12px] leading-[1.6]" style={{ color: "var(--text-secondary)" }}>
                <Truck size={15} className="mt-0.5 shrink-0" />
                <span>お届け予定: {delivery.label}（検品後に発送）</span>
              </div>
              <div className="flex items-start gap-2 text-[12px] leading-[1.6]" style={{ color: "var(--text-secondary)" }}>
                <ShieldCheck size={15} className="mt-0.5 shrink-0" style={{ color: "var(--success)" }} />
                <span>この金額から追加費用はかかりません。品質不良は無償で対応します。</span>
              </div>
            </div>

            <button
              onClick={onSubmit}
              disabled={!quote.orderable}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg text-[14px] font-bold text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
              style={{ background: "var(--accent)" }}
            >
              注文へ進む
              <ChevronRight size={16} strokeWidth={2.2} />
            </button>
          </>
        ) : (
          <div className="flex items-start gap-2 rounded-lg p-3" style={{ background: "var(--surface-secondary)", color: "var(--text-secondary)" }}>
            <Info size={16} className="mt-0.5 shrink-0" />
            <p className="text-[13px] leading-[1.7]">
              {selectedMaterial ? "価格を計算しています。" : "素材を選択すると、税込総額とお届け目安が表示されます。"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
