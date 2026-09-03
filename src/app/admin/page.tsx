"use client";

// 受注管理(MVP最小限)。設計書 Phase 1: 一覧 + ステータス手動更新のみ。
// ADMIN_TOKEN を環境変数に設定した場合はトークン入力が必要。

import { useCallback, useEffect, useState } from "react";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderRecord,
  type OrderStatus,
} from "@/lib/orderTypes";
import { Download, RefreshCw } from "lucide-react";

export default function AdminPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [token, setToken] = useState("");
  const [needsToken, setNeedsToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (adminToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        headers: adminToken ? { "x-admin-token": adminToken } : {},
      });
      if (res.status === 401) {
        setNeedsToken(true);
        setOrders([]);
        return;
      }
      if (!res.ok) throw new Error("読み込みに失敗しました");
      const data = await res.json();
      setNeedsToken(false);
      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin-token") ?? "";
    setToken(saved);
    load(saved);
  }, [load]);

  const downloadFile = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/file`, {
        headers: token ? { "x-admin-token": token } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ダウンロードURLの取得に失敗しました");
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      alert(err instanceof Error ? err.message : "ダウンロードに失敗しました");
    }
  };

  const updateStatus = async (id: string, status: OrderStatus) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "x-admin-token": token } : {}),
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
    }
  };

  if (needsToken) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--background)" }}>
        <div className="w-full max-w-sm">
          <h1 className="text-[18px] font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            管理トークン
          </h1>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ADMIN_TOKEN"
            className="w-full h-10 px-3 rounded-lg text-[13px] outline-none mb-3"
            style={{ background: "var(--surface-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
          <button
            onClick={() => {
              sessionStorage.setItem("admin-token", token);
              load(token);
            }}
            className="w-full h-10 rounded-lg text-[13px] font-medium cursor-pointer"
            style={{ background: "var(--accent)", color: "#FFF" }}
          >
            ログイン
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-8" style={{ background: "var(--background)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[20px] font-semibold" style={{ color: "var(--text-primary)" }}>
            受注管理
          </h1>
          <button
            onClick={() => load(token)}
            className="flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-lg cursor-pointer"
            style={{ background: "var(--surface-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            更新
          </button>
        </div>

        {error && (
          <p className="text-[13px] mb-4" style={{ color: "#F87171" }}>{error}</p>
        )}

        {orders.length === 0 && !loading ? (
          <p className="text-[14px]" style={{ color: "var(--text-tertiary)" }}>
            注文はまだありません。
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border)" }}>
            <table className="w-full text-[13px]" style={{ color: "var(--text-primary)" }}>
              <thead>
                <tr style={{ background: "var(--surface-secondary)" }}>
                  {["注文番号", "日時", "お客様", "内容", "サイズ/体積", "合計", "お届け予定", "ステータス"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} style={{ borderTop: "1px solid var(--border-light)" }}>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{o.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                      {new Date(o.createdAt).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {o.customer.lastName} {o.customer.firstName}
                      <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{o.customer.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="max-w-[180px] truncate">{o.file.name}</div>
                        {o.file.s3Key && (
                          <button
                            onClick={() => downloadFile(o.id)}
                            title="3Dデータをダウンロード"
                            className="shrink-0 w-6 h-6 rounded flex items-center justify-center cursor-pointer"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            <Download size={13} />
                          </button>
                        )}
                      </div>
                      <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {o.item.materialName} / {o.item.colorName} × {o.item.quantity}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                      {o.item.bboxMm.x.toFixed(0)}×{o.item.bboxMm.y.toFixed(0)}×{o.item.bboxMm.z.toFixed(0)}mm
                      <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{o.item.volumeCm3.toFixed(1)} cm³</div>
                    </td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">¥{o.quote.total.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{o.deliveryEstimate}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                        className="rounded-lg px-2 py-1.5 text-[12px] cursor-pointer outline-none"
                        style={{ background: "var(--surface-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
