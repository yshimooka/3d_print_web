import type { Metadata } from "next";
import StaticPage, { Section } from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "プライバシーポリシー | 大國造形",
};

export default function PrivacyPage() {
  return (
    <StaticPage
      title="プライバシーポリシー"
      lead="大國造形（以下「当社」）は、本サービスにおけるお客様の個人情報を、以下の方針に基づき取り扱います。"
    >
      <Section title="1. 取得する情報">
        <ul className="list-disc pl-5 space-y-1">
          <li>氏名、メールアドレス、電話番号、住所（注文・配送のため）</li>
          <li>アップロードされた3Dデータ（造形のため）</li>
          <li>注文履歴、お問い合わせ内容</li>
          <li>アクセスログ等の利用状況（サービス改善のため）</li>
        </ul>
      </Section>

      <Section title="2. 利用目的">
        <ul className="list-disc pl-5 space-y-1">
          <li>ご注文の受付、製造、検品、配送、進捗のご連絡</li>
          <li>お問い合わせへの対応</li>
          <li>サービスの改善および新機能のご案内</li>
        </ul>
      </Section>

      <Section title="3. 第三者提供">
        <p>
          以下の場合を除き、個人情報を第三者に提供しません。
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>配送のために配送業者へ氏名・住所・電話番号を提供する場合</li>
          <li>製造委託のために提携工場へ3Dデータを提供する場合（個人を特定する情報は含みません）</li>
          <li>法令に基づく場合</li>
        </ul>
      </Section>

      <Section title="4. 決済情報">
        <p>
          クレジットカード情報は決済代行事業者が直接取り扱い、当社のサーバーには保存されません。
        </p>
      </Section>

      <Section title="5. 3Dデータの保管">
        <p>
          アップロードされた3Dデータは、再製造対応のためお届け完了から90日間保管した後、削除します。
          お客様のご依頼によりただちに削除することも可能です。
        </p>
      </Section>

      <Section title="6. 開示・訂正・削除">
        <p>
          お客様ご本人からの個人情報の開示・訂正・削除のご請求には、本人確認のうえ速やかに対応します。
        </p>
      </Section>

      <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
        制定日: 2026年7月4日
      </p>
    </StaticPage>
  );
}
