"use client";

import { useState } from "react";
import Link from "next/link";
import { type Material, type MaterialColor } from "@/data/materials";
import { deliveryWindow, type MeshStats, type Quote } from "@/lib/quote";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
  Lock,
} from "lucide-react";

interface CheckoutFormProps {
  file: File;
  material: Material;
  color: MaterialColor;
  quantity: number;
  stats: MeshStats;
  quote: Quote;
  onBack: () => void;
}

interface CustomerForm {
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  zip: string;
  prefecture: string;
  city: string;
  address: string;
}

const EMPTY_FORM: CustomerForm = {
  lastName: "",
  firstName: "",
  email: "",
  phone: "",
  zip: "",
  prefecture: "",
  city: "",
  address: "",
};

const FIELD_LABELS: Record<keyof CustomerForm, string> = {
  lastName: "姓",
  firstName: "名",
  email: "メールアドレス",
  phone: "電話番号",
  zip: "郵便番号",
  prefecture: "都道府県",
  city: "市区町村",
  address: "番地・建物名",
};

function validate(form: CustomerForm): Partial<Record<keyof CustomerForm, string>> {
  const errors: Partial<Record<keyof CustomerForm, string>> = {};
  (Object.keys(FIELD_LABELS) as (keyof CustomerForm)[]).forEach((key) => {
    if (!form[key].trim()) errors[key] = `${FIELD_LABELS[key]}を入力してください`;
  });
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "メールアドレスの形式が正しくありません";
  }
  if (form.zip && !/^\d{3}-?\d{4}$/.test(form.zip.trim())) {
    errors.zip = "郵便番号は 123-4567 の形式で入力してください";
  }
  if (form.phone && !/^[\d\-+() ]{10,15}$/.test(form.phone.trim())) {
    errors.phone = "電話番号の形式が正しくありません";
  }
  return errors;
}

export default function CheckoutForm({
  file,
  material,
  color,
  quantity,
  stats,
  quote,
  onBack,
}: CheckoutFormProps) {
  const [form, setForm] = useState<CustomerForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; deliveryEstimate: string } | null>(null);

  const delivery = deliveryWindow();

  const isLight = (hex: string) =>
    ["#F5F5F5", "#E0F2FE", "#FEF3C7", "#DBEAFE", "#C0C0C0"].includes(hex);

  const setField = (key: keyof CustomerForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async () => {
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSubmitError("入力内容をご確認ください");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append(
        "payload",
        JSON.stringify({
          materialId: material.id,
          colorName: color.name,
          quantity,
          stats,
          customer: form,
        })
      );
      const res = await fetch("/api/orders", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "注文の送信に失敗しました");
      }
      setResult({ id: data.id, deliveryEstimate: data.deliveryEstimate });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "注文の送信に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── 完了画面 ─────────────────────────────
  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ background: 'var(--background)' }}>
        <div className="text-center max-w-md px-6">
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-5"
            style={{ background: 'var(--success-light)' }}
          >
            <ShieldCheck size={28} style={{ color: 'var(--success)' }} />
          </div>
          <h2
            className="text-[22px] font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            ご注文ありがとうございます
          </h2>
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            ご注文を受け付けました。データチェック完了後、製造を開始します。
            進捗は各ステップごとにメールでお知らせします。
          </p>
          <div
            className="rounded-lg p-4 mb-8 text-left space-y-2"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}
          >
            <div className="flex justify-between text-[13px]">
              <span style={{ color: 'var(--text-secondary)' }}>注文番号</span>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{result.id}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span style={{ color: 'var(--text-secondary)' }}>お届け予定</span>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{result.deliveryEstimate}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span style={{ color: 'var(--text-secondary)' }}>お支払い金額（税込）</span>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>¥{quote.total.toLocaleString()}</span>
            </div>
          </div>
          <Link
            href="/"
            className="inline-block text-[13px] font-bold px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
            style={{ background: 'var(--accent)', color: '#FFFFFF', textDecoration: 'none' }}
          >
            トップに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <header
        className="h-[52px] px-6 flex items-center gap-4 sticky top-0 z-10"
        style={{ background: 'rgba(247,246,242,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-light)' }}
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
          className="text-[15px] font-semibold"
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
              className="rounded-lg p-5"
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
                  <InputField label="姓" placeholder="山田" value={form.lastName} onChange={setField("lastName")} error={errors.lastName} />
                  <InputField label="名" placeholder="太郎" value={form.firstName} onChange={setField("firstName")} error={errors.firstName} />
                </div>
                <InputField label="メールアドレス" placeholder="example@mail.com" type="email" value={form.email} onChange={setField("email")} error={errors.email} />
                <InputField label="電話番号" placeholder="090-1234-5678" type="tel" value={form.phone} onChange={setField("phone")} error={errors.phone} />
                <InputField label="郵便番号" placeholder="100-0001" value={form.zip} onChange={setField("zip")} error={errors.zip} />
                <InputField label="都道府県" placeholder="東京都" value={form.prefecture} onChange={setField("prefecture")} error={errors.prefecture} />
                <InputField label="市区町村" placeholder="千代田区" value={form.city} onChange={setField("city")} error={errors.city} />
                <InputField label="番地・建物名" placeholder="丸の内1-1-1 ○○ビル 3F" value={form.address} onChange={setField("address")} error={errors.address} />
              </div>
            </section>

            {/* Payment */}
            <section
              className="rounded-lg p-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={16} style={{ color: 'var(--accent)' }} />
                <h2 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  お支払い
                </h2>
              </div>

              <p className="text-[13px] leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                クレジットカード決済（Visa / Mastercard / JCB / AMEX）に対応予定です。
              </p>
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                style={{ background: 'var(--surface-secondary)' }}
              >
                <Lock size={12} style={{ color: 'var(--text-tertiary)' }} />
                <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                  現在はプレオープン期間のため、注文確定時のお支払いは発生しません。
                  検品完了後にお支払い方法をメールでご案内します。
                </span>
              </div>
            </section>
          </div>

          {/* Right: Order Summary (sticky) */}
          <div className="lg:col-span-2">
            <div
              className="rounded-lg p-5 lg:sticky lg:top-[76px]"
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
                    {file.name}
                  </span>
                </div>

                {/* Size */}
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--text-secondary)' }}>サイズ</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {stats.bboxMm.x.toFixed(0)}×{stats.bboxMm.y.toFixed(0)}×{stats.bboxMm.z.toFixed(0)}mm
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
                  <span style={{ color: 'var(--text-secondary)' }}>造形価格</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    ¥{quote.printSubtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--text-secondary)' }}>基本手数料（検品・梱包）</span>
                  <span style={{ color: 'var(--text-primary)' }}>¥{quote.handlingFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--text-secondary)' }}>送料</span>
                  <span style={{ color: quote.shippingFee === 0 ? 'var(--success)' : 'var(--text-primary)' }}>
                    {quote.shippingFee === 0 ? '無料' : `¥${quote.shippingFee.toLocaleString()}`}
                  </span>
                </div>

                <div style={{ height: '1px', background: 'var(--border)' }} />

                {/* Total */}
                <div className="flex justify-between items-baseline">
                  <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    合計（税込）
                  </span>
                  <span
                    className="text-[22px] font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    ¥{quote.total.toLocaleString()}
                  </span>
                </div>

                {/* Delivery */}
                <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                  <Truck size={13} />
                  <span>お届け予定: {delivery.label}</span>
                </div>
              </div>

              {submitError && (
                <p className="text-[12px] mt-4 text-center" style={{ color: 'var(--danger)' }}>
                  {submitError}
                </p>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full h-12 rounded-lg text-[14px] font-semibold flex items-center justify-center gap-1.5 mt-5 transition-all duration-200 cursor-pointer active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'var(--accent)', color: '#FFFFFF' }}
                onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = 'var(--accent-hover)'; }}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent)')}
              >
                {submitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    送信中…
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    注文を確定する
                  </>
                )}
              </button>

              <p className="text-[11px] text-center mt-3" style={{ color: 'var(--text-tertiary)' }}>
                「注文を確定する」を押すと、
                <a href="/legal/terms" target="_blank" style={{ color: 'var(--accent)' }}>利用規約</a>
                と
                <a href="/legal/privacy" target="_blank" style={{ color: 'var(--accent)' }}>プライバシーポリシー</a>
                に同意したものとみなされます
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
  value,
  onChange,
  error,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-lg text-[13px] outline-none transition-all duration-150"
        style={{
          background: 'var(--surface-secondary)',
          border: `1px solid ${error ? '#EF4444' : 'var(--border)'}`,
          color: 'var(--text-primary)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-light)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? '#EF4444' : 'var(--border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {error && (
        <p className="text-[11px] mt-1" style={{ color: 'var(--danger)' }}>{error}</p>
      )}
    </div>
  );
}
