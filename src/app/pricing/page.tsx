import type { Metadata } from "next";
import StaticPage, { Section } from "@/components/StaticPage";
import { materials } from "@/data/materials";
import {
  HANDLING_FEE,
  SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
  DELIVERY_DAYS_MIN,
  DELIVERY_DAYS_MAX,
} from "@/lib/quote";

export const metadata: Metadata = {
  title: "料金の仕組み | 大國造形",
  description:
    "3Dプリントの料金はモデルの体積で決まります。造形価格+基本手数料+送料のみ、すべて税込のシンプルな料金体系です。",
};

export default function PricingPage() {
  return (
    <StaticPage
      title="料金の仕組み"
      lead="お支払いいただくのは「造形価格 + 基本手数料 + 送料」の3つだけ。すべて税込で、注文後に追加費用が発生することはありません。"
    >
      <Section title="1. 造形価格">
        <p>
          造形価格はモデルの体積（cm³）と素材で決まります。3Dデータをアップロードすると、
          自動で体積を計測してその場で正確な価格を表示します。
        </p>
        <div
          className="rounded-lg overflow-hidden mt-4"
          style={{ border: "1px solid var(--border)" }}
        >
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ background: "var(--surface-secondary)" }}>
                <th className="text-left px-4 py-3 font-medium">素材</th>
                <th className="text-right px-4 py-3 font-medium">1cm³あたり</th>
                <th className="text-right px-4 py-3 font-medium">最低価格/個</th>
                <th className="text-right px-4 py-3 font-medium">最大サイズ</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m.id} style={{ borderTop: "1px solid var(--border-light)" }}>
                  <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{m.nameJa}</td>
                  <td className="px-4 py-3 text-right">¥{m.pricePerCm3.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">¥{m.minPrice.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{m.maxSizeMm.join("×")}mm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title={`2. 基本手数料 ${HANDLING_FEE}円/注文`}>
        <p>
          発送前の検品（寸法・表面の確認）と梱包の費用です。何個注文しても1回の注文につき{HANDLING_FEE}円だけです。
        </p>
      </Section>

      <Section title={`3. 送料 全国一律${SHIPPING_FEE}円`}>
        <p>
          注文金額（造形価格+基本手数料）が{FREE_SHIPPING_THRESHOLD.toLocaleString()}円以上の場合は送料無料です。
        </p>
      </Section>

      <Section title="お届けについて">
        <p>
          お届けまでの目安は注文確定から{DELIVERY_DAYS_MIN}〜{DELIVERY_DAYS_MAX}日です。
          提携工場での製造・国際輸送・検品の工程を含むため、国内即納サービスより時間がかかりますが、
          そのぶん手頃な価格と検品済みの品質でお届けします。お急ぎの場合は対応できないことを正直にお伝えします。
        </p>
      </Section>

      <Section title="品質保証">
        <p>
          造形品質に起因する不良（破損・大きな歪み・造形失敗）は、無償で再製造または全額返金します。
          全品を検品してから発送しているため、こうしたケースは事前にほぼ取り除かれます。
        </p>
      </Section>
    </StaticPage>
  );
}
