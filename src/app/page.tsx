import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import Reveal from "@/components/Reveal";
import StaggerReveal from "@/components/StaggerReveal";

// ─── Section divider: 3 stacked hairlines evoke FDM print layers ─────────────

function LayerDivider() {
  return (
    <div className="px-8 py-5 layer-lines" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────

const steps = [
  {
    number: "01",
    title: "3Dデータをアップロード",
    description:
      "3Dファイルをドラッグするだけで送れます。無料の3Dデータサイトで入手したファイルもそのまま使えます。",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "素材・カラーを選択",
    description:
      "プラスチックや樹脂、金属まで、わかりやすい説明つきで素材を選べます。色のカスタマイズも簡単です。",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="13.5" cy="6.5" r="2.5" />
        <circle cx="17.5" cy="10.5" r="2.5" />
        <circle cx="8.5" cy="7.5" r="2.5" />
        <circle cx="6.5" cy="12.5" r="2.5" />
        <path d="M12 22a7 7 0 1 1 0-14 7 7 0 0 1 0 14z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "最短3日でお届け",
    description:
      "注文確定後、最短3日でご自宅にお届けします。品質チェックを済ませたスタッフが丁寧に梱包してお送りします。",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
];

const materials = [
  {
    id: "pla",
    name: "PLA樹脂",
    tag: "初心者におすすめ",
    tagColor: "#5BA85A",
    desc: "扱いやすく発色のよいプラスチック素材。フィギュアや雑貨など、はじめての造形に最適です。",
    method: "スタンダード",
  },
  {
    id: "abs",
    name: "ABS樹脂",
    tag: "丈夫さ重視",
    tagColor: "#D4702A",
    desc: "衝撃や熱に強いプラスチック。日用品のパーツや工具の代替品として人気があります。",
    method: "プラスチック",
  },
  {
    id: "petg",
    name: "PETG",
    tag: "万能素材",
    tagColor: "#4A7FA8",
    desc: "やわらかさと強さを兼ね備えたプラスチック。ケースや外装パーツに向いています。",
    method: "プラスチック",
  },
  {
    id: "nylon",
    name: "ナイロン",
    tag: "高強度",
    tagColor: "#8B5CF6",
    desc: "しなやかで丈夫なナイロン素材。複雑な形も作れるため、機能部品に選ばれることが多いです。",
    method: "ナイロン系",
  },
  {
    id: "resin",
    name: "レジン",
    tag: "超精密",
    tagColor: "#2563EB",
    desc: "細かい部分まで忠実に再現できる樹脂素材。フィギュアや精密模型などに最適です。",
    method: "樹脂",
  },
  {
    id: "metal",
    name: "メタル",
    tag: "金属製",
    tagColor: "#9CA3AF",
    desc: "金属の質感と強度をそのまま再現。本格的なパーツ製作や高品位な仕上がりを求める方に。",
    method: "金属",
  },
];

const features = [
  {
    title: "自動データチェック",
    desc: "アップロードされたデータを自動で確認。問題がある場合はわかりやすく知らせるので、安心して注文できます。",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    title: "仕上がりプレビュー",
    desc: "注文前にブラウザ上で素材と色を選んで確認できます。完成品のイメージをつかんでから安心して発注できます。",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: "最短3日でお届け",
    desc: "注文確定から最短3営業日で発送。急ぎのご依頼にもできる限り対応します。",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: "豊富な素材ラインナップ",
    desc: "プラスチック・樹脂・金属など6種類の素材を用意。初心者の方には用途別のおすすめ素材をご案内します。",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TopPage() {
  return (
    <div
      className="min-h-screen text-[var(--foreground)]"
      style={{ background: "var(--background)" }}
    >
      {/* ── Navigation ── */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto h-[64px] px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: "var(--accent)" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <span className="text-[16px] font-bold tracking-wide" style={{ color: "var(--text-primary)" }}>
              大國造形
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {[
              { href: "#how-it-works", label: "ワークフロー" },
              { href: "#materials", label: "マテリアル" },
              { href: "#features", label: "テクノロジー" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-[13px] font-medium tracking-wide transition-colors hover:text-[var(--text-primary)]"
                style={{ color: "var(--text-secondary)", textDecoration: "none" }}
              >
                {label}
              </a>
            ))}
          </div>

          <Link
            href="/order"
            className="text-[13px] font-semibold px-5 py-2 rounded-full transition-all hover:opacity-90"
            style={{ background: "var(--accent)", color: "#FFFFFF" }}
          >
            注文を始める
          </Link>
        </div>
      </nav>

      {/* ── Hero (client component: Three.js + anime.js entrance) ── */}
      <HeroSection />

      <LayerDivider />

      {/* ── Workflow ── */}
      <section id="how-it-works" className="py-28 px-8 relative">
        <div className="max-w-7xl mx-auto">
          <Reveal className="mb-16 text-center">
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "var(--text-tertiary)" }}>
              Workflow
            </p>
            <h2
              className="text-[38px] font-bold"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              シームレスな3ステップ
            </h2>
          </Reveal>

          <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative p-8 rounded-2xl glass-panel card-lift"
              >
                <div className="flex items-center gap-3 mb-7">
                  <span
                    className="text-[10px] font-bold tracking-[0.18em] uppercase shrink-0"
                    style={{ color: "var(--accent)" }}
                  >
                    Step {step.number}
                  </span>
                  <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                </div>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: "var(--accent-light)", color: "var(--accent)" }}
                >
                  {step.icon}
                </div>
                <h3 className="text-[18px] font-bold mb-3" style={{ color: "var(--text-primary)" }}>
                  {step.title}
                </h3>
                <p className="text-[14px] leading-[1.8]" style={{ color: "var(--text-secondary)" }}>
                  {step.description}
                </p>
              </div>
            ))}
          </StaggerReveal>
        </div>
      </section>

      <LayerDivider />

      {/* ── Features & Image ── */}
      <section id="features" className="py-28 px-8 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <Reveal>
            <div
              className="relative rounded-2xl overflow-hidden glass-panel p-1.5 card-lift"
              style={{ transform: "rotate(-0.7deg)" }}
            >
              <img
                src="/precision_printing.png"
                alt="精密な3Dプリント"
                className="w-full h-auto object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none rounded-2xl" />
              <div className="absolute bottom-7 left-7 right-7">
                <p className="text-[10px] font-bold tracking-widest mb-2 uppercase" style={{ color: "var(--accent)" }}>
                  Advanced Tech
                </p>
                <p className="text-[20px] font-bold leading-snug text-white">
                  超微細なディテールを
                  <br />
                  完璧に再現するテクノロジー。
                </p>
              </div>
            </div>
          </Reveal>

          {/* Features Grid */}
          <div>
            <Reveal className="mb-12">
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "var(--text-tertiary)" }}>
                Features
              </p>
              <h2
                className="text-[38px] font-bold"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
              >
                初心者でも
                <br />
                安心して使える
              </h2>
            </Reveal>

            <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 gap-8" staggerMs={70}>
              {features.map((feat) => (
                <div key={feat.title}>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ background: "var(--accent-light)", color: "var(--accent)" }}
                  >
                    {feat.icon}
                  </div>
                  <h3 className="text-[16px] font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                    {feat.title}
                  </h3>
                  <p className="text-[13px] leading-[1.75]" style={{ color: "var(--text-secondary)" }}>
                    {feat.desc}
                  </p>
                </div>
              ))}
            </StaggerReveal>
          </div>
        </div>
      </section>

      <LayerDivider />

      {/* ── Materials ── */}
      <section id="materials" className="py-28 px-8 relative hero-bg">
        <div className="max-w-7xl mx-auto">
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "var(--text-tertiary)" }}>
                Materials
              </p>
              <h2
                className="text-[38px] font-bold"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
              >
                妥協なきマテリアル
              </h2>
            </div>
            <p className="text-[14px] max-w-[320px] leading-[1.8]" style={{ color: "var(--text-secondary)" }}>
              プロトタイピングから最終製品まで。あらゆる用途に応える厳選された産業グレード素材をラインナップ。
            </p>
          </Reveal>

          <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" staggerMs={65}>
            {materials.map((mat) => (
              <div
                key={mat.id}
                className="relative p-7 rounded-2xl overflow-hidden card-lift"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderLeft: `3px solid ${mat.tagColor}`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-[20px] font-bold" style={{ color: "var(--text-primary)" }}>
                    {mat.name}
                  </h3>
                  <span
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ml-2"
                    style={{
                      background: "var(--surface-secondary)",
                      color: "var(--text-tertiary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {mat.method}
                  </span>
                </div>
                <p className="text-[13px] leading-[1.75] mb-6" style={{ color: "var(--text-secondary)" }}>
                  {mat.desc}
                </p>
                <span className="text-[12px] font-bold" style={{ color: mat.tagColor }}>
                  {mat.tag}
                </span>
              </div>
            ))}
          </StaggerReveal>
        </div>
      </section>

      <LayerDivider />

      {/* ── CTA ── */}
      <Reveal className="py-36 px-8 relative text-center">
        <p
          className="text-[11px] font-bold tracking-[0.2em] uppercase mb-6"
          style={{ color: "var(--text-tertiary)" }}
        >
          Get Started
        </p>
        <h2
          className="text-[48px] lg:text-[60px] font-bold mb-7 leading-[1.1]"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          まずは、気軽に。
        </h2>
        <p className="text-[16px] mb-12 font-light leading-[1.8]" style={{ color: "var(--text-secondary)" }}>
          アカウント登録は不要です。
          <br />
          3Dファイルをアップロードして、最短3日でお届けします。
        </p>
        <Link
          href="/order"
          className="inline-flex items-center gap-3 px-10 py-5 rounded-xl text-[15px] font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0"
          style={{ background: "var(--accent)" }}
        >
          注文を始める
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </Reveal>

      {/* ── Footer ── */}
      <footer className="py-10 px-8" style={{ borderTop: "1px solid var(--border-light)", background: "#000" }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[14px] font-bold tracking-widest" style={{ color: "var(--text-primary)" }}>
            大國造形
          </span>
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            © 2026 大國造形. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
