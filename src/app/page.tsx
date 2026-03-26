import Link from "next/link";

// ─── Data ────────────────────────────────────────────────────────────────────

const steps = [
  {
    number: "01",
    title: "3Dデータをアップロード",
    description:
      "STL・OBJ・GLTF・STEPなど主要フォーマットに対応。ドラッグ&ドロップで即座に高精細なプレビューが起動します。",
    icon: (
      <svg
        width="24"
        height="24"
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
      "高機能ナイロンからレジン、メタルまで。用途に合わせた最適な造形材料とシームレスなカラー指定が可能です。",
    icon: (
      <svg
        width="24"
        height="24"
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
      "産業グレードの最新プリンターで出力し、熟練スタッフが検品。最高品質の造形物を迅速にお手元へお届けします。",
    icon: (
      <svg
        width="24"
        height="24"
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
    tag: "高精度",
    tagColor: "#34C759",
    desc: "バイオ素材。滑らかな表面と精密な形状再現性。プロトタイピングに最適です。",
    method: "FDM",
  },
  {
    id: "abs",
    name: "ABS樹脂",
    tag: "高強度",
    tagColor: "#FF9F0A",
    desc: "耐衝撃・耐熱性を誇るエンジニアリング向けの標準素材。機能部品の製作に。",
    method: "FDM",
  },
  {
    id: "petg",
    name: "PETG",
    tag: "万能",
    tagColor: "#32ADE6",
    desc: "PLAの造形性とABSの強度を両立。透明感のあるパーツやケース類に。",
    method: "FDM",
  },
  {
    id: "nylon",
    name: "ナイロン",
    tag: "産業グレード",
    tagColor: "#BF5AF2",
    desc: "強靭な柔軟性を持つ。サポート材を使わず、複雑な幾何学形状を出力可能。",
    method: "SLS",
  },
  {
    id: "resin",
    name: "レジン",
    tag: "超高精細",
    tagColor: "#0A84FF",
    desc: "0.05mmの驚異的な積層ピッチで、フィギュア・微細部品の超精密造形を実現。",
    method: "SLA/DLP",
  },
  {
    id: "metal",
    name: "メタル",
    tag: "最高品位",
    tagColor: "#8E8E93",
    desc: "金属粉末を焼結し、高い強度と本物の金属の質感を備えるハイエンド出力。",
    method: "DMLS",
  },
];

const features = [
  {
    title: "AI品質チェック",
    desc: "アップロードされた3Dモデルを自動解析。印刷リスクのある薄壁やオーバーハングを即座にハイライトします。",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: "リアルタイムプレビュー",
    desc: "ブラウザ上でインタラクティブに素材と色をシミュレーション。完成品のイメージを正確に確認できます。",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: "スピード納品",
    desc: "受注から最短3営業日で出荷。プロジェクトのボトルネックを解消し、迅速な開発サイクルをサポートします。",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: "産業水準の素材",
    desc: "4つの先進的な造形方式と6種のプログレード素材で、あらゆる強度・品質要件にマッチするソリューションを提供します。",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 17 22 12" />
      </svg>
    ),
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TopPage() {
  return (
    <div
      className="min-h-screen text-[var(--foreground)] selection:bg-[var(--accent)] selection:text-white"
      style={{ background: "var(--background)" }}
    >
      {/* ── Navigation ── */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 glass-panel border-x-0 border-t-0 border-b-[var(--border)]">
        <div className="max-w-7xl mx-auto h-[72px] px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[#47A9FF] flex items-center justify-center shadow-[0_0_20px_rgba(41,151,255,0.4)]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <span
              className="text-[17px] font-bold tracking-wider"
              style={{ color: "var(--text-primary)" }}
            >
              日本立体造形
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
                style={{
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                }}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center">
            <Link
              href="/order"
              className="group text-[13px] font-bold px-6 py-2.5 rounded-full transition-all relative overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "var(--text-primary)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)] to-[#47A9FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">注文を始める</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-[120px] pb-32 px-8 min-h-[90vh] flex items-center overflow-hidden hero-bg">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[var(--accent)] rounded-full mix-blend-screen filter blur-[120px] opacity-10 pointer-events-none transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#BF5AF2] rounded-full mix-blend-screen filter blur-[120px] opacity-10 pointer-events-none transform translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Text Content */}
          <div className="order-2 lg:order-1 relative z-20">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-[12px] font-bold tracking-widest mb-10 border border-[rgba(255,255,255,0.1)] glass-panel">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-400">
                NEXT GEN 3D PRINTING
              </span>
            </div>

            <h1 className="text-[54px] lg:text-[72px] font-black leading-[1.05] tracking-tight mb-8">
              想像を、
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] via-[#47A9FF] to-[#BF5AF2]">
                究極の精度
              </span>
              で<br />
              現実に。
            </h1>

            <p className="text-[17px] leading-[1.8] font-light mb-12 max-w-[500px] text-[var(--text-secondary)]">
              最先端のプリント技術と洗練されたUI。3Dデータをアップロードして素材を選ぶだけで、プロフェッショナルな造形物を最短3日でお届けします。
            </p>

            <div className="flex items-center gap-5 flex-wrap">
              <Link
                href="/order"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-[15px] font-bold transition-all relative overflow-hidden card-lift"
                style={{
                  background: "var(--text-primary)",
                  color: "var(--background)",
                  boxShadow: "0 0 30px rgba(255,255,255,0.15)",
                }}
              >
                システムへアクセス
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="order-1 lg:order-2 relative w-full aspect-square max-w-[600px] mx-auto">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[var(--accent)] to-[#BF5AF2] opacity-20 blur-3xl transform scale-90" />
            <div className="relative w-full h-full rounded-3xl overflow-hidden glass-panel p-2 shadow-2xl">
              <img
                src="/hero_3d_abstract.png"
                alt="Sophisticated 3D Printed Object"
                className="w-full h-full object-cover rounded-2xl brightness-110 contrast-125"
              />
              <div className="absolute inset-2 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow ── */}
      <section
        id="how-it-works"
        className="py-32 px-8 border-t border-[var(--border)] relative"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(41,151,255,0.03),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-20 text-center">
            <p className="text-[12px] font-bold tracking-[0.2em] uppercase mb-4 text-[var(--text-secondary)]">
              Workflow
            </p>
            <h2 className="text-[42px] font-bold tracking-tight text-[var(--text-primary)]">
              シームレスな3ステップ
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative p-10 rounded-3xl glass-panel card-lift group"
              >
                <div className="absolute top-6 right-8 text-[100px] font-black leading-none pointer-events-none select-none transition-all duration-500 group-hover:scale-110 group-hover:opacity-10 text-white/5">
                  {step.number}
                </div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-gradient-to-br from-[var(--accent)] to-[#47A9FF] shadow-[0_0_20px_rgba(41,151,255,0.3)] text-white">
                  {step.icon}
                </div>
                <div className="text-[11px] font-bold tracking-[0.1em] text-[var(--text-tertiary)] mb-3 uppercase">
                  Step {step.number}
                </div>
                <h3 className="text-[20px] font-bold mb-4 text-[var(--text-primary)]">
                  {step.title}
                </h3>
                <p className="text-[14px] leading-[1.8] text-[var(--text-secondary)]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features & Image Dual Layout ── */}
      <section
        id="features"
        className="py-32 px-8 bg-[#020203] border-t border-[var(--border)] relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Image */}
          <div className="relative rounded-3xl overflow-hidden glass-panel p-2 transform -rotate-1 hover:rotate-0 transition-transform duration-700 ease-out card-lift">
            <img
              src="/precision_printing.png"
              alt="Precision 3D Printing Macro"
              className="w-full h-auto object-cover rounded-2xl brightness-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none rounded-3xl" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <p className="text-[12px] font-bold tracking-widest text-[#47A9FF] mb-2 uppercase">
                Advanced Tech
              </p>
              <p className="text-[24px] font-bold leading-tight">
                超微細なディテールを
                <br />
                完璧に再現するテクノロジー。
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div>
            <div className="mb-14">
              <p className="text-[12px] font-bold tracking-[0.2em] uppercase mb-4 text-[var(--text-secondary)]">
                Features
              </p>
              <h2 className="text-[42px] font-bold tracking-tight text-[var(--text-primary)]">
                スマートツールで
                <br />
                完璧なプリントを
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10">
              {features.map((feat) => (
                <div key={feat.title} className="group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[var(--accent)] group-hover:scale-110 transition-transform duration-300">
                    {feat.icon}
                  </div>
                  <h3 className="text-[17px] font-bold mb-3 text-[var(--text-primary)]">
                    {feat.title}
                  </h3>
                  <p className="text-[14px] leading-[1.7] text-[var(--text-secondary)]">
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Materials ── */}
      <section
        id="materials"
        className="py-32 px-8 border-t border-[var(--border)] relative hero-bg"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div>
              <p className="text-[12px] font-bold tracking-[0.2em] uppercase mb-4 text-[var(--text-secondary)]">
                Materials
              </p>
              <h2 className="text-[42px] font-bold tracking-tight text-[var(--text-primary)]">
                妥協なきマテリアル
              </h2>
            </div>
            <p className="text-[15px] max-w-[340px] leading-[1.8] text-[var(--text-secondary)]">
              プロトタイピングから最終製品まで。あらゆる用途に応える厳選された産業グレード素材をラインナップ。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((mat) => (
              <div
                key={mat.id}
                className="glass-panel p-8 rounded-3xl card-lift relative overflow-hidden group"
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 opacity-20 filter blur-3xl rounded-full transition-opacity duration-500 group-hover:opacity-40"
                  style={{ background: mat.tagColor }}
                />

                <div className="flex items-center justify-between mb-6 relative z-10">
                  <h3 className="text-[22px] font-bold text-[var(--text-primary)]">
                    {mat.name}
                  </h3>
                  <span
                    className="text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/10"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {mat.method}
                  </span>
                </div>

                <p className="text-[14px] leading-[1.7] text-[var(--text-secondary)] mb-8 relative z-10 h-[4.5em]">
                  {mat.desc}
                </p>

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-[#101016] shadow-md relative overflow-hidden bg-gradient-to-br from-white/20 to-white/5"
                      />
                    ))}
                  </div>
                  <span className="text-[12px] font-bold text-[var(--accent)]">
                    {mat.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-40 px-8 relative overflow-hidden bg-[#0A0A0F] border-t border-[rgba(255,255,255,0.04)] text-center">
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[var(--accent-light)] text-[var(--accent)] mb-10 shadow-[0_0_50px_rgba(41,151,255,0.2)] border border-[rgba(41,151,255,0.2)]">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <h2 className="text-[48px] lg:text-[56px] font-black mb-8 leading-[1.1] tracking-tight">
            体験を、形に。
          </h2>
          <p className="text-[18px] text-[var(--text-secondary)] mb-12 font-light">
            アカウントの登録は不要です。
            <br />
            3Dデータをアップロードして、未来のモノづくりを今すぐ体験しましょう。
          </p>
          <Link
            href="/order"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-[16px] font-bold text-white transition-all hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, var(--accent) 0%, #BF5AF2 100%)",
              boxShadow: "0 20px 40px -10px rgba(191,90,242,0.4)",
            }}
          >
            システムへ進む
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 px-8 bg-[#000] border-t border-[rgba(255,255,255,0.06)] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-white tracking-widest">
              日本立体造形
            </span>
          </div>
          <p className="text-[13px] text-[var(--text-tertiary)]">
            © 2026 日本立体造形. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
