import Image from "next/image";
import Link from "next/link";
import Hero3DBackground from "@/components/Hero3DBackground";
import { materials } from "@/data/materials";
import {
  DELIVERY_DAYS_MAX,
  DELIVERY_DAYS_MIN,
  FREE_SHIPPING_THRESHOLD,
  HANDLING_FEE,
  SHIPPING_FEE,
} from "@/lib/quote";

const steps = [
  {
    no: "01",
    title: "ファイルをアップロード",
    text: "STL、OBJ、STEPなどの3Dデータを置くだけ。見積もりまでは会員登録なしで進められます。",
  },
  {
    no: "02",
    title: "素材と数量を選ぶ",
    text: "素材は3つのプリセットから。用途に合わせて選ぶと、価格と仕上がりがその場で変わります。",
  },
  {
    no: "03",
    title: "検品後に国内発送",
    text: `提携工場で製造後、スタッフが1点ずつ確認してから発送します。お届け目安は${DELIVERY_DAYS_MIN}〜${DELIVERY_DAYS_MAX}日です。`,
  },
];

const priceExamples = [
  {
    name: "小さなフィギュア",
    size: "高さ60mm・体積15cm³",
    material: "高精細レジン",
    image: "/renewal/material-resin.png",
    print: 4200,
  },
  {
    name: "スマホスタンド",
    size: "120×80×90mm・体積28cm³",
    material: "スタンダード樹脂",
    image: "/renewal/material-pla.png",
    print: 5040,
  },
  {
    name: "交換用の部品",
    size: "40×30×20mm・体積6cm³",
    material: "タフナイロン",
    image: "/renewal/material-nylon.png",
    print: 2100,
  },
];

const materialMeta: Record<string, { useCase: string; image: string; description: string }> = {
  standard: {
    useCase: "迷ったらこれ",
    image: "/renewal/material-pla.png",
    description:
      "光造形(SLA)の標準レジン。表面がなめらかで、細かい形もきれいに再現できます。小物・試作品・日用品のパーツに。",
  },
  fine: {
    useCase: "細かい表現に",
    image: "/renewal/material-resin.png",
    description:
      "髪の毛や布のしわのような微細なディテールまで忠実に再現。フィギュア、ミニチュア、アクセサリーの原型に。",
  },
  tough: {
    useCase: "強度が必要な部品に",
    image: "/renewal/material-nylon.png",
    description:
      "粉末焼結(MJF/SLS)のナイロン。薄くても割れにくく、ヒンジなど動く構造も作れます。実際に使う部品や屋外用に。",
  },
};

const qaList = [
  {
    q: "このデータで印刷できるか、わからない。",
    a: "アップロード直後に、サイズ・体積・薄すぎる壁を自動で確認します。問題があれば、専門用語を使わず日本語でお知らせします。",
  },
  {
    q: "素材を選べる自信がない。",
    a: "選択肢は最初から3つだけです。「迷ったらこれ」「細かい表現に」「強度が必要な部品に」——使い道に近いものを選ぶだけです。",
  },
  {
    q: "あとから高くならないか心配。",
    a: "造形価格・基本手数料・送料を含めた税込総額を先に表示します。この金額から追加費用はかかりません。",
  },
  {
    q: "品質が悪かったら、どうなるのか。",
    a: "全品を発送前に検品します。造形品質の不良は、無償で再製造または返金します。",
  },
  {
    q: "届くまでが長くて不安。",
    a: `お届け目安は${DELIVERY_DAYS_MIN}〜${DELIVERY_DAYS_MAX}日です。注文確定からお届けまでの6段階を、その都度メールでお知らせします。`,
  },
];

const progressSteps = [
  { no: "01", label: "注文確定", active: true },
  { no: "02", label: "データチェック", active: true },
  { no: "03", label: "製造中", active: false },
  { no: "04", label: "輸送中", active: false },
  { no: "05", label: "検品完了・発送", active: false },
  { no: "06", label: "お届け完了", active: false },
];

const navLinks = [
  ["#flow", "使い方"],
  ["#pricing", "料金の目安"],
  ["#materials", "素材"],
  ["#delivery", "お届けまで"],
];

export default function TopPage() {
  return (
    <div
      id="top"
      className="min-h-screen text-[15px] leading-[1.9]"
      style={{
        background: "#F7F6F2",
        color: "#1E2528",
        fontFamily: "var(--font-noto-sans), 'Hiragino Kaku Gothic ProN', sans-serif",
      }}
    >
      {/* ===== ナビゲーション ===== */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(247,246,242,0.9)",
          backdropFilter: "blur(12px)",
          borderColor: "#E3DFD7",
        }}
      >
        <div className="mx-auto flex h-16 max-w-[1160px] items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/" className="flex items-baseline gap-2.5" style={{ textDecoration: "none", color: "#1E2528" }}>
            <span className="text-[17px] font-bold tracking-[0.02em]">大國造形</span>
            <span className="hidden text-[11px] tracking-[0.04em] sm:inline" style={{ color: "#66706D" }}>
              かんたん3Dプリント
            </span>
          </Link>
          <nav className="flex items-center gap-7">
            {navLinks.map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="hidden text-[13px] font-medium transition-colors hover:text-[#1E2528] md:inline"
                style={{ color: "#66706D", textDecoration: "none" }}
              >
                {label}
              </a>
            ))}
            <Link
              href="/order"
              className="rounded-md px-[18px] py-[9px] text-[13px] font-bold text-white transition-colors hover:bg-[#A9562F]"
              style={{ background: "#C86B3A", textDecoration: "none" }}
            >
              無料で見積もる
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* ===== ファーストビュー ===== */}
        <section className="relative overflow-hidden">
          <Hero3DBackground offsetX={2.2} />
          <div className="relative z-10 mx-auto grid max-w-[1160px] grid-cols-1 items-center gap-12 px-5 pb-[84px] pt-[76px] sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-[72px]">
            <div>
              <p className="mb-[22px] text-[13px] font-medium" style={{ color: "#66706D" }}>
                見積もりまで無料。会員登録は不要です。
              </p>
              <h1
                className="mb-6 text-[34px] font-bold leading-[1.4] tracking-[0.01em] sm:text-[44px]"
                style={{ color: "#1E2528" }}
              >
                3Dデータをアップロード
                <br />
                するだけ。総額が
                <br />
                その場でわかります。
              </h1>
              <p className="mb-9 max-w-[30em] text-[15px] leading-[2.0]" style={{ color: "#66706D" }}>
                素材選び、海外発注、検品、国内発送までまとめて代行します。1個から、送料・手数料込みの税込金額を先に確認できます。
              </p>
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <Link
                  href="/order"
                  className="rounded-lg px-8 py-[15px] text-[15px] font-bold text-white transition-colors hover:bg-[#A9562F]"
                  style={{
                    background: "#C86B3A",
                    boxShadow: "0 8px 20px rgba(200,107,58,0.22)",
                    textDecoration: "none",
                  }}
                >
                  ファイルを置いて総額を見る
                </Link>
                <a
                  href="#pricing"
                  className="text-[14px] font-medium transition-colors hover:text-[#C86B3A]"
                  style={{ color: "#1E2528", textDecoration: "none" }}
                >
                  料金例を見る →
                </a>
              </div>

              <div
                className="mt-12 flex flex-wrap items-center gap-3.5 text-[13px]"
                style={{ color: "#66706D" }}
              >
                <span>登録なしで見積もり</span>
                <span className="h-3 w-px" style={{ background: "#D5D0C6" }} />
                <span>追加費用なし・税込総額</span>
                <span className="h-3 w-px" style={{ background: "#D5D0C6" }} />
                <span>全品検品・造形保証</span>
                <span className="h-3 w-px" style={{ background: "#D5D0C6" }} />
                <span>
                  お届け目安 {DELIVERY_DAYS_MIN}〜{DELIVERY_DAYS_MAX}日
                </span>
              </div>
            </div>

            <div
              className="overflow-hidden rounded-[14px] border"
              style={{
                background: "#FFFFFF",
                borderColor: "#E3DFD7",
                boxShadow: "0 18px 50px rgba(74,61,47,0.1)",
              }}
            >
              <div className="px-[26px] pt-6">
                <p className="mb-1 text-[16px] font-bold">見積もりをはじめる</p>
                <p className="mb-[18px] text-[13px]" style={{ color: "#66706D" }}>
                  3Dファイルをここに置くと、総額を計算します。
                </p>
                <Link
                  href="/order"
                  className="block rounded-[10px] px-6 py-11 text-center transition-colors hover:bg-[#F2EFE8]"
                  style={{ background: "#F7F6F2", textDecoration: "none" }}
                >
                  <span
                    className="inline-block rounded-[7px] px-[26px] py-[11px] text-[13.5px] font-bold text-white"
                    style={{ background: "#1E2528" }}
                  >
                    ファイルを選ぶ
                  </span>
                  <p className="mt-4 text-[12.5px]" style={{ color: "#66706D" }}>
                    またはドラッグ＆ドロップ
                  </p>
                  <p className="mt-1.5 text-[12px]" style={{ color: "#8B928E" }}>
                    STL / OBJ / STEP / GLTF / GLB
                  </p>
                </Link>
              </div>
              <div
                className="mt-[22px] border-t px-[26px] pb-5 pt-4"
                style={{ borderColor: "#EEEAE1", background: "#FCFBF8" }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[12px]" style={{ color: "#8B928E" }}>
                      見積もり例 — sample_part.stl / 高精細レジン
                    </p>
                    <p className="mt-0.5 text-[13px]" style={{ color: "#66706D" }}>
                      税込・送料手数料込み ／ お届け目安 {DELIVERY_DAYS_MIN}〜{DELIVERY_DAYS_MAX}日
                    </p>
                  </div>
                  <span className="text-[22px] font-bold" style={{ color: "#1E2528" }}>
                    ¥4,980
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 使い方 ===== */}
        <section
          id="flow"
          className="border-y"
          style={{ background: "#FFFFFF", borderColor: "#E3DFD7" }}
        >
          <div className="mx-auto max-w-[1160px] px-5 py-[84px] sm:px-8">
            <div className="mb-[52px] max-w-[40em]">
              <h2 className="mb-4 text-[24px] font-bold leading-[1.5] tracking-[0.01em] sm:text-[30px]">
                アップロードから、お届けまで3ステップ。
              </h2>
              <p className="text-[14.5px]" style={{ color: "#66706D" }}>
                専門的な設定は最初から見せません。まずはファイルを置いて、素材を選び、総額とお届け目安を確認します。
              </p>
            </div>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
              {steps.map((s) => (
                <div key={s.no} className="border-t-2 pt-5" style={{ borderColor: "#1E2528" }}>
                  <p className="mb-3 text-[13px] font-bold" style={{ color: "#C86B3A" }}>
                    {s.no}
                  </p>
                  <h3 className="mb-2.5 text-[17px] font-bold">{s.title}</h3>
                  <p className="text-[13.5px]" style={{ color: "#66706D" }}>
                    {s.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 料金の目安 ===== */}
        <section id="pricing">
          <div className="mx-auto max-w-[1160px] px-5 py-[84px] sm:px-8">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-8">
              <div className="max-w-[32em]">
                <h2 className="mb-4 text-[24px] font-bold leading-[1.5] sm:text-[30px]">
                  手数料・送料込みの総額で確認できます。
                </h2>
                <p className="text-[14.5px]" style={{ color: "#66706D" }}>
                  料金はモデルの体積と素材で決まります。以下は同等条件での目安です。正確な金額はアップロード後に表示します。
                </p>
              </div>
              <Link
                href="/order"
                className="whitespace-nowrap text-[14px] font-medium transition-colors hover:text-[#C86B3A]"
                style={{ color: "#1E2528", textDecoration: "none" }}
              >
                自分のデータで見積もる →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {priceExamples.map((row) => {
                const shipping =
                  row.print + HANDLING_FEE >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
                const total = row.print + HANDLING_FEE + shipping;
                return (
                  <div
                    key={row.name}
                    className="overflow-hidden rounded-xl border"
                    style={{ background: "#FFFFFF", borderColor: "#E3DFD7" }}
                  >
                    <div className="relative h-[200px]" style={{ background: "#F0EDE5" }}>
                      <Image
                        src={row.image}
                        alt={row.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="px-6 pb-6 pt-[22px]">
                      <h3 className="text-[17px] font-bold">{row.name}</h3>
                      <p className="mt-1 text-[12.5px]" style={{ color: "#8B928E" }}>
                        {row.size} ／ {row.material}
                      </p>
                      <div className="mt-[18px] grid gap-1.5 text-[13px]">
                        <div className="flex justify-between">
                          <span style={{ color: "#66706D" }}>造形価格</span>
                          <span>¥{row.print.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: "#66706D" }}>基本手数料</span>
                          <span>¥{HANDLING_FEE.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: "#66706D" }}>送料</span>
                          <span style={{ color: shipping === 0 ? "#2F7D5C" : "#1E2528" }}>
                            {shipping === 0 ? "無料" : `¥${shipping.toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                      <div
                        className="mt-3.5 flex items-baseline justify-between border-t pt-3.5"
                        style={{ borderColor: "#EEEAE1" }}
                      >
                        <span className="text-[13px] font-medium" style={{ color: "#66706D" }}>
                          合計（税込）
                        </span>
                        <span className="text-[22px] font-bold" style={{ color: "#1E2528" }}>
                          ¥{total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-[12px]" style={{ color: "#8B928E" }}>
              ※ 金額は条件により異なります。合計{FREE_SHIPPING_THRESHOLD.toLocaleString()}
              円以上のご注文は送料無料になります。
            </p>
          </div>
        </section>

        {/* ===== 素材 ===== */}
        <section
          id="materials"
          className="border-y"
          style={{ background: "#FFFFFF", borderColor: "#E3DFD7" }}
        >
          <div className="mx-auto max-w-[1160px] px-5 py-[84px] sm:px-8">
            <div className="mb-[52px] max-w-[40em]">
              <h2 className="mb-4 text-[24px] font-bold leading-[1.5] sm:text-[30px]">
                選ぶのは、最初は3つだけ。
              </h2>
              <p className="text-[14.5px]" style={{ color: "#66706D" }}>
                70種類の素材から探す必要はありません。使い道に近いものを選ぶだけで、見積もりが更新されます。
              </p>
            </div>

            <div className="grid gap-10">
              {materials.map((m) => {
                const meta = materialMeta[m.id];
                return (
                  <div
                    key={m.id}
                    className="grid grid-cols-1 items-center gap-6 border-t pt-10 md:grid-cols-[300px_1fr] lg:grid-cols-[300px_1fr_auto] lg:gap-10"
                    style={{ borderColor: "#E3DFD7" }}
                  >
                    <div className="relative h-[180px] overflow-hidden rounded-[10px]" style={{ background: "#F0EDE5" }}>
                      <Image
                        src={meta.image}
                        alt={`${m.nameJa}の作例`}
                        fill
                        sizes="(max-width: 768px) 100vw, 300px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="mb-1 text-[13px] font-bold" style={{ color: "#C86B3A" }}>
                        {meta.useCase}
                      </p>
                      <h3 className="mb-2.5 text-[20px] font-bold">{m.nameJa}</h3>
                      <p className="max-w-[36em] text-[13.5px]" style={{ color: "#66706D" }}>
                        {meta.description}
                      </p>
                    </div>
                    <div className="grid min-w-[220px] gap-2 text-[13px]">
                      <div className="flex justify-between gap-5">
                        <span style={{ color: "#8B928E" }}>工法</span>
                        <span>{m.method}</span>
                      </div>
                      <div className="flex justify-between gap-5">
                        <span style={{ color: "#8B928E" }}>最大サイズ</span>
                        <span>{m.maxSizeMm.join("×")}mm</span>
                      </div>
                      <div className="flex justify-between gap-5">
                        <span style={{ color: "#8B928E" }}>価格</span>
                        <span className="font-bold">¥{m.minPrice.toLocaleString()}〜</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== 不安解消 ===== */}
        <section>
          <div className="mx-auto grid max-w-[1160px] grid-cols-1 items-start gap-12 px-5 py-[84px] sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-[72px]">
            <div>
              <h2 className="mb-4 text-[24px] font-bold leading-[1.5] sm:text-[30px]">
                注文前の不安には、画面の中で先に答えます。
              </h2>
              <p className="mb-8 text-[14.5px]" style={{ color: "#66706D" }}>
                価格、印刷可否、品質、納期。初めての方が気になることは、注文の前に確認できるようにしています。
              </p>
              <Image
                src="/renewal/inspection.png"
                alt="検品済みの3Dプリント作例と検査道具"
                width={1717}
                height={916}
                className="h-[240px] w-full rounded-xl object-cover"
              />
              <p className="mt-2.5 text-[12px]" style={{ color: "#8B928E" }}>
                発送前の検品風景。寸法を確認してから発送します。
              </p>
            </div>
            <div>
              {qaList.map((qa) => (
                <div key={qa.q} className="border-b py-[22px]" style={{ borderColor: "#E3DFD7" }}>
                  <h3 className="mb-2 text-[15.5px] font-bold">{qa.q}</h3>
                  <p className="text-[13.5px]" style={{ color: "#66706D" }}>
                    {qa.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== お届けまで ===== */}
        <section id="delivery" className="border-t" style={{ background: "#FFFFFF", borderColor: "#E3DFD7" }}>
          <div className="mx-auto max-w-[1160px] px-5 py-[84px] sm:px-8">
            <div className="mb-14 max-w-[42em]">
              <h2 className="mb-4 text-[24px] font-bold leading-[1.5] sm:text-[30px]">
                お届けまで{DELIVERY_DAYS_MIN}〜{DELIVERY_DAYS_MAX}
                日。急ぎではない注文に向いています。
              </h2>
              <p className="text-[14.5px]" style={{ color: "#66706D" }}>
                国内即納ではありません。そのかわり価格を抑え、進捗を6段階でお知らせし、検品してから発送します。
              </p>
            </div>

            <div className="relative px-1.5">
              <div
                className="absolute left-1.5 right-1.5 top-[5px] hidden h-0.5 md:block"
                style={{ background: "#E3DFD7" }}
              />
              <div className="relative grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-6">
                {progressSteps.map((step) => (
                  <div key={step.no}>
                    <span
                      className="mb-4 block h-3 w-3 rounded-full"
                      style={{ background: step.active ? "#C86B3A" : "#E3DFD7" }}
                    />
                    <p className="mb-0.5 text-[11.5px]" style={{ color: "#8B928E" }}>
                      {step.no}
                    </p>
                    <p className="text-[13.5px] font-bold">{step.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-11 max-w-[46em] text-[13px]" style={{ color: "#66706D" }}>
              各段階の進み具合はメールでお知らせします。遅延が発生した場合も、そのままにせずご連絡します。
            </p>
          </div>
        </section>

        {/* ===== 最終CTA ===== */}
        <section style={{ background: "#1E2528", color: "#F7F6F2" }}>
          <div className="mx-auto max-w-[1160px] px-5 py-[92px] text-center sm:px-8">
            <p className="mb-4 text-[13.5px]" style={{ color: "#A9B1AD" }}>
              見積もりだけでも、大丈夫です。
            </p>
            <h2 className="mb-8 text-[24px] font-bold leading-[1.55] sm:text-[32px]">
              まずは、あなたのデータで総額を確認してください。
            </h2>
            <Link
              href="/order"
              className="inline-block rounded-lg px-10 py-4 text-[15px] font-bold text-white transition-colors hover:bg-[#A9562F]"
              style={{ background: "#C86B3A", textDecoration: "none" }}
            >
              ファイルをアップロードする
            </Link>
            <p className="mt-[22px] text-[12.5px]" style={{ color: "#A9B1AD" }}>
              会員登録なしで、送料・手数料込みの税込総額とお届け目安を確認できます。
            </p>
          </div>
        </section>
      </main>

      {/* ===== フッター ===== */}
      <footer className="border-t" style={{ background: "#1E2528", color: "#F7F6F2", borderColor: "#343C3F" }}>
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-start justify-between gap-8 px-5 py-11 sm:px-8">
          <div>
            <p className="mb-2 text-[16px] font-bold">大國造形</p>
            <p className="max-w-[26em] text-[12.5px]" style={{ color: "#A9B1AD" }}>
              3Dデータをアップロードするだけで、検品済みの造形物が届く初心者向けサービスです。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-x-10 gap-y-2.5">
            {[
              ["/order", "見積もり"],
              ["/pricing", "料金"],
              ["/faq", "FAQ"],
              ["/legal/terms", "利用規約"],
              ["/legal/privacy", "プライバシー"],
              ["/legal/tokushoho", "特定商取引法"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="text-[12.5px] transition-colors hover:text-white"
                style={{ color: "#C4CBC7", textDecoration: "none" }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="border-t" style={{ borderColor: "#343C3F" }}>
          <p className="mx-auto max-w-[1160px] px-5 py-4 text-[11.5px] sm:px-8" style={{ color: "#7E8683" }}>
            © 2026 大國造形. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
