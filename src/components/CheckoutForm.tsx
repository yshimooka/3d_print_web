"use client";

import { useState } from "react";
import { type Material, type MaterialColor } from "@/data/materials";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Package,
  ShieldCheck,
  Lock,
} from "lucide-react";

interface CheckoutFormProps {
  fileName: string;
  material: Material;
  color: MaterialColor;
  quantity: number;
  estimatedPrice: number;
  onBack: () => void;
}

export default function CheckoutForm({
  fileName,
  material,
  color,
  quantity,
  estimatedPrice,
  onBack,
}: CheckoutFormProps) {
  const [submitted, setSubmitted] = useState(false);

  const isLight = (hex: string) =>
    ["#F5F5F5", "#E0F2FE", "#FEF3C7", "#DBEAFE", "#C0C0C0"].includes(hex);

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center max-w-md px-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(34, 197, 94, 0.1)' }}
          >
            <ShieldCheck size={28} style={{ color: '#22C55E' }} />
          </div>
          <h2
            className="text-[22px] font-semibold mb-2 tracking-[-0.02em]"
            style={{ color: 'var(--text-primary)' }}
          >
            ご注文ありがとうございます
          </h2>
          <p className="text-[14px] leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
            ご注文を受け付けました。確認メールをお送りしますので、しばらくお待ちください。
          </p>
          <p className="text-[12px] mb-8" style={{ color: 'var(--text-tertiary)' }}>
            注文番号: PS-{Date.now().toString(36).toUpperCase()}
          </p>
          <button
            onClick={onBack}
            className="text-[13px] font-medium px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
            style={{ background: 'var(--accent)', color: '#FFFFFF' }}
          >
            トップに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <header
        className="h-[52px] px-6 flex items-center gap-4 sticky top-0 z-10"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      >
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-secondary)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <ArrowLeft size={18} />
        </button>
        <h1
          className="text-[15px] font-semibold tracking-[-0.01em]"
          style={{ color: 'var(--text-primary)' }}
        >
          ご注文の確認
        </h1>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Forms */}
          <div className="lg:col-span-3 space-y-6">
            {/* Shipping Address */}
            <section
              className="rounded-xl p-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={16} style={{ color: 'var(--accent)' }} />
                <h2 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  お届け先
                </h2>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="姓" placeholder="山田" />
                  <InputField label="名" placeholder="太郎" />
                </div>
                <InputField label="メールアドレス" placeholder="example@mail.com" type="email" />
                <InputField label="電話番号" placeholder="090-1234-5678" type="tel" />
                <InputField label="郵便番号" placeholder="100-0001" />
                <InputField label="都道府県" placeholder="東京都" />
                <InputField label="市区町村" placeholder="千代田区" />
                <InputField label="番地・建物名" placeholder="丸の内1-1-1 ○○ビル 3F" />
              </div>
            </section>

            {/* Payment */}
            <section
              className="rounded-xl p-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={16} style={{ color: 'var(--accent)' }} />
                <h2 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  お支払い情報
                </h2>
              </div>

              <div className="space-y-3">
                <InputField label="カード番号" placeholder="4242 4242 4242 4242" />
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="有効期限" placeholder="MM / YY" />
                  <InputField label="セキュリティコード" placeholder="123" />
                </div>
                <InputField label="カード名義" placeholder="TARO YAMADA" />
              </div>

              <div
                className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg"
                style={{ background: 'var(--surface-secondary)' }}
              >
                <Lock size={12} style={{ color: 'var(--text-tertiary)' }} />
                <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                  お支払い情報はSSL暗号化により安全に保護されます
                </span>
              </div>
            </section>
          </div>

          {/* Right: Order Summary (sticky) */}
          <div className="lg:col-span-2">
            <div
              className="rounded-xl p-5 lg:sticky lg:top-[76px]"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Package size={16} style={{ color: 'var(--accent)' }} />
                <h2 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  注文内容
                </h2>
              </div>

              <div className="space-y-3">
                {/* File */}
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--text-secondary)' }}>ファイル</span>
                  <span
                    className="font-medium truncate max-w-[160px] text-right"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {fileName}
                  </span>
                </div>

                {/* Material */}
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--text-secondary)' }}>素材</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {material.nameJa}
                  </span>
                </div>

                {/* Color */}
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--text-secondary)' }}>カラー</span>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{
                        backgroundColor: color.hex,
                        boxShadow: isLight(color.hex) ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : 'none',
                      }}
                    />
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {color.name}
                    </span>
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--text-secondary)' }}>数量</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {quantity}個
                  </span>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'var(--border-light)' }} />

                {/* Price breakdown */}
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--text-secondary)' }}>小計</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    ¥{estimatedPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--text-secondary)' }}>送料</span>
                  <span style={{ color: 'var(--text-primary)' }}>¥800</span>
                </div>

                <div style={{ height: '1px', background: 'var(--border)' }} />

                {/* Total */}
                <div className="flex justify-between items-baseline">
                  <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    合計（税込）
                  </span>
                  <span
                    className="text-[22px] font-semibold tracking-[-0.02em]"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    ¥{(estimatedPrice + 800).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={() => setSubmitted(true)}
                className="w-full h-12 rounded-lg text-[14px] font-semibold flex items-center justify-center gap-1.5 mt-5 transition-all duration-200 cursor-pointer active:scale-[0.98]"
                style={{ background: 'var(--accent)', color: '#FFFFFF' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent)')}
              >
                <Lock size={14} />
                注文を確定する
              </button>

              <p className="text-[11px] text-center mt-3" style={{ color: 'var(--text-tertiary)' }}>
                「注文を確定する」を押すと、利用規約に同意したものとみなされます
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable input field ─────────────────────────────

function InputField({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label
        className="block text-[12px] font-medium mb-1"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full h-10 px-3 rounded-lg text-[13px] outline-none transition-all duration-150"
        style={{
          background: 'var(--surface-secondary)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-light)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}
