import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | 大國造形",
};

const rows: [string, string][] = [
  ["販売業者", "大國造形（※正式な事業者名を記載してください）"],
  ["運営責任者", "※責任者名を記載してください"],
  ["所在地", "※事業所の所在地を記載してください"],
  ["電話番号", "※電話番号を記載してください（受付時間: 平日10:00〜17:00）"],
  ["メールアドレス", "※お問い合わせ用メールアドレスを記載してください"],
  ["販売価格", "各注文画面に表示される金額(税込)。造形価格+基本手数料500円+送料。"],
  ["商品代金以外の必要料金", "なし（表示総額にすべて含まれます）"],
  ["支払方法", "クレジットカード決済（プレオープン期間中は検品完了後の請求となります）"],
  ["支払時期", "注文確定時"],
  ["引渡し時期", "注文確定から10〜16日を目安に発送します。遅延が見込まれる場合はメールでご連絡します。"],
  [
    "返品・交換",
    "受注生産品のため、お客様都合による返品・交換はお受けできません。造形品質に起因する不良は、商品到着後7日以内のご連絡で無償再製造または全額返金いたします。",
  ],
  ["キャンセル", "製造開始前に限りキャンセル可能です。製造開始後はキャンセルできません。"],
];

export default function TokushohoPage() {
  return (
    <StaticPage title="特定商取引法に基づく表記">
      <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full text-[13px]">
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label} style={{ borderTop: "1px solid var(--border-light)" }}>
                <th
                  className="text-left align-top px-4 py-3 font-medium w-[38%]"
                  style={{ background: "var(--surface-secondary)", color: "var(--text-primary)" }}
                >
                  {label}
                </th>
                <td className="px-4 py-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StaticPage>
  );
}
