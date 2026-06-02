"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { materials, type Material, type MaterialColor } from "@/data/materials";
import { Check, ChevronRight, Minus, Plus, X } from "lucide-react";

interface MaterialSelectorProps {
  selectedMaterial: Material | null;
  selectedColor: MaterialColor | null;
  quantity: number;
  onMaterialChange: (material: Material) => void;
  onColorChange: (color: MaterialColor) => void;
  onQuantityChange: (quantity: number) => void;
  onSubmit: () => void;
  fileName: string;
  analysisPanel?: ReactNode;
}

export default function MaterialSelector({
  selectedMaterial,
  selectedColor,
  quantity,
  onMaterialChange,
  onColorChange,
  onQuantityChange,
  onSubmit,
  fileName,
  analysisPanel,
}: MaterialSelectorProps) {
  const [detailMaterial, setDetailMaterial] = useState<Material | null>(null);

  const handleMaterialClick = (material: Material) => {
    onMaterialChange(material);
    if (material.colors.length > 0) {
      onColorChange(material.colors[0]);
    }
  };

  const estimatedPrice = selectedMaterial
    ? selectedMaterial.pricePerCm3 * 10 * quantity
    : 0;

  const isLight = (hex: string) =>
    ["#F5F5F5", "#E0F2FE", "#FEF3C7", "#DBEAFE", "#C0C0C0"].includes(hex);

  // Detail view for a single material
  if (detailMaterial) {
    return (
      <div className="h-full flex flex-col">
        {/* Detail Header */}
        <div className="shrink-0 p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => setDetailMaterial(null)}
            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-secondary)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={16} />
          </button>
          <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
            {detailMaterial.nameJa}
          </span>
          <div className="w-7" />
        </div>

        {/* Detail Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero Image */}
          <div className="relative w-full aspect-square" style={{ background: 'var(--surface-secondary)' }}>
            <Image
              src={detailMaterial.image}
              alt={detailMaterial.nameJa}
              fill
              className="object-cover"
            />
          </div>

          <div className="p-5 space-y-4">
            {/* Title + Price */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{detailMaterial.icon}</span>
                <h3 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {detailMaterial.nameJa}
                </h3>
                <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                  {detailMaterial.name}
                </span>
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {detailMaterial.details}
              </p>
            </div>

            {/* Specs */}
            <div className="rounded-lg p-3" style={{ background: 'var(--surface-secondary)' }}>
              <div className="flex justify-between text-[12px]">
                <span style={{ color: 'var(--text-tertiary)' }}>価格目安</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>¥{detailMaterial.pricePerCm3}/cm³〜</span>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-1.5">
              {detailMaterial.features.map((f) => (
                <span
                  key={f}
                  className="text-[11px] px-2.5 py-1 rounded-full"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Select button */}
        <div className="shrink-0 p-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => {
              handleMaterialClick(detailMaterial);
              setDetailMaterial(null);
            }}
            className="w-full h-10 rounded-lg text-[13px] font-medium transition-all cursor-pointer active:scale-[0.98]"
            style={{ background: 'var(--accent)', color: '#FFFFFF' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent)')}
          >
            この素材を選択
          </button>
        </div>
      </div>
    );
  }

  // Main list view
  return (
    <div className="h-full flex flex-col">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Section: Material */}
        <div className="p-5">
          <h3
            className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-3"
            style={{ color: 'var(--text-tertiary)' }}
          >
            素材を選択
          </h3>
          <div className="space-y-2">
            {materials.map((material) => {
              const isSelected = selectedMaterial?.id === material.id;

              return (
                <div
                  key={material.id}
                  className="rounded-xl overflow-hidden transition-all duration-150"
                  style={{
                    border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    background: isSelected ? 'var(--accent-light)' : 'var(--surface)',
                  }}
                >
                  <button
                    onClick={() => handleMaterialClick(material)}
                    className="w-full text-left cursor-pointer"
                  >
                    {/* Thumbnail row */}
                    <div className="flex items-center gap-3 p-3">
                      {/* Thumbnail */}
                      <div
                        className="w-14 h-14 rounded-lg shrink-0 relative overflow-hidden"
                        style={{ background: 'var(--surface-secondary)' }}
                      >
                        <Image
                          src={material.image}
                          alt={material.nameJa}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className="text-[13px] font-medium"
                            style={{ color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}
                          >
                            {material.nameJa}
                          </span>
                          {isSelected && <Check size={13} style={{ color: 'var(--accent)' }} />}
                        </div>
                        <p
                          className="text-[12px] leading-snug truncate"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {material.description}
                        </p>
                        <span
                          className="text-[11px]"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          ¥{material.pricePerCm3}/cm³〜
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Expanded section when selected */}
                  {isSelected && (
                    <div className="px-3 pb-3">
                      {/* Detail link */}
                      <button
                        onClick={() => setDetailMaterial(material)}
                        className="text-[11px] font-medium mb-3 cursor-pointer transition-opacity hover:opacity-70"
                        style={{ color: 'var(--accent)' }}
                      >
                        詳細を見る →
                      </button>

                      {/* Colors */}
                      <p
                        className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-2"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        カラー
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {material.colors.map((color) => {
                          const isColorSelected = selectedColor?.hex === color.hex;
                          return (
                            <button
                              key={color.hex}
                              onClick={() => onColorChange(color)}
                              title={color.name}
                              className="w-7 h-7 rounded-full transition-all duration-150 cursor-pointer relative"
                              style={{
                                backgroundColor: color.hex,
                                boxShadow: isColorSelected
                                  ? `0 0 0 2px var(--surface), 0 0 0 3.5px var(--accent)`
                                  : isLight(color.hex)
                                    ? 'inset 0 0 0 1px rgba(0,0,0,0.1)'
                                    : 'none',
                                transform: isColorSelected ? 'scale(1.1)' : 'scale(1)',
                              }}
                            >
                              {isColorSelected && (
                                <Check
                                  size={12}
                                  strokeWidth={2.5}
                                  className="absolute inset-0 m-auto"
                                  style={{
                                    color: isLight(color.hex) ? 'var(--text-primary)' : '#FFFFFF',
                                  }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5" style={{ height: '1px', background: 'var(--border-light)' }} />

        {/* Analysis Panel */}
        {analysisPanel && (
          <>
            <div className="p-5">
              <h3
                className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-3"
                style={{ color: 'var(--text-tertiary)' }}
              >
                印刷チェック
              </h3>
              {analysisPanel}
            </div>
            <div className="mx-5" style={{ height: '1px', background: 'var(--border-light)' }} />
          </>
        )}

        {/* Section: Quantity */}
        <div className="p-5">
          <h3
            className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-3"
            style={{ color: 'var(--text-tertiary)' }}
          >
            数量
          </h3>
          <div
            className="flex items-center rounded-lg overflow-hidden"
            style={{ border: '1px solid var(--border)' }}
          >
            <button
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center transition-colors cursor-pointer"
              style={{ color: 'var(--text-secondary)', background: 'var(--surface-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--border)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-secondary)')}
            >
              <Minus size={14} />
            </button>
            <input
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={(e) =>
                onQuantityChange(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))
              }
              className="flex-1 text-center text-[15px] font-semibold outline-none bg-transparent"
              style={{ color: 'var(--text-primary)' }}
            />
            <button
              onClick={() => onQuantityChange(Math.min(100, quantity + 1))}
              className="w-10 h-10 flex items-center justify-center transition-colors cursor-pointer"
              style={{ color: 'var(--text-secondary)', background: 'var(--surface-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--border)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-secondary)')}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer: Summary + CTA */}
      <div className="shrink-0 p-5" style={{ borderTop: '1px solid var(--border)' }}>
        {selectedMaterial && selectedColor ? (
          <>
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-[13px]">
                <span style={{ color: 'var(--text-secondary)' }}>素材</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {selectedMaterial.nameJa}
                </span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span style={{ color: 'var(--text-secondary)' }}>カラー</span>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: selectedColor.hex,
                      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {selectedColor.name}
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-[13px]">
                <span style={{ color: 'var(--text-secondary)' }}>数量</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {quantity}個
                </span>
              </div>
              <div className="my-2" style={{ height: '1px', background: 'var(--border-light)' }} />
              <div className="flex justify-between items-baseline">
                <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                  参考価格
                </span>
                <span className="text-[20px] font-semibold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
                  ¥{estimatedPrice.toLocaleString()}
                  <span className="text-[12px] font-normal" style={{ color: 'var(--text-tertiary)' }}>〜</span>
                </span>
              </div>
            </div>
            <button
              onClick={onSubmit}
              className="w-full h-11 rounded-lg text-[14px] font-medium flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-[0.98]"
              style={{ background: 'var(--accent)', color: '#FFFFFF' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent)')}
            >
              注文へ進む
              <ChevronRight size={15} />
            </button>
          </>
        ) : (
          <p className="text-[13px] text-center py-2" style={{ color: 'var(--text-tertiary)' }}>
            素材を選択してください
          </p>
        )}
      </div>
    </div>
  );
}
