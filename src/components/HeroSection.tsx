"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// SSR-safe: Three.js uses browser APIs
const PrintScene = dynamic(() => import("./PrintScene"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-full rounded-xl"
      style={{ background: "var(--surface)" }}
    />
  ),
});

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const items = containerRef.current?.querySelectorAll("[data-entrance]");
    if (!items || items.length === 0) return;

    // Initial state is set by CSS [data-entrance] selector; anime.js overrides inline
    (async () => {
      const anime = (await import("animejs")).default;
      anime({
        targets: Array.from(items),
        opacity: [0, 1],
        translateY: [28, 0],
        delay: anime.stagger(110, { start: 150 }),
        duration: 800,
        easing: "easeOutQuart",
      });
    })();
  }, []);

  return (
    <section className="relative pt-[104px] pb-28 px-8 min-h-[88vh] flex items-center overflow-hidden hero-bg">
      {/* Ghost 形 — core kanji from the service name, sub-perceptual texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none select-none flex items-center justify-end"
      >
        <span
          className="leading-none pr-[6%] translate-y-4"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(200px, 28vw, 420px)",
            fontWeight: 700,
            color: "rgba(242, 237, 232, 0.028)",
          }}
        >
          形
        </span>
      </div>

      <div
        ref={containerRef}
        className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center w-full"
      >
        {/* ── Text column ── */}
        <div className="order-2 lg:order-1">
          {/* Live badge */}
          <div
            data-entrance
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-widest mb-10 uppercase"
            style={{
              background: "var(--accent-light)",
              border: "1px solid rgba(212,112,42,0.25)",
              color: "var(--accent)",
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--accent)]" />
            </span>
            かんたん 3D プリント注文
          </div>

          {/* Headline in display serif */}
          <h1
            data-entrance
            className="text-[52px] lg:text-[68px] font-bold leading-[1.12] mb-8"
            style={{ fontFamily: "var(--font-display)" }}
          >
            あなたの
            <br />
            <span style={{ color: "var(--accent)" }}>アイデア</span>を、
            <br />
            かたちに。
          </h1>

          <p
            data-entrance
            className="text-[16px] leading-[1.9] font-light mb-12 max-w-[460px]"
            style={{ color: "var(--text-secondary)" }}
          >
            3Dのことを知らなくても大丈夫。データを送って素材を選ぶだけで、数日後にプリントされたものがお手元に届きます。
          </p>

          <div data-entrance className="flex items-center gap-4 flex-wrap">
            <Link
              href="/order"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-[15px] font-bold transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0"
              style={{
                background: "var(--text-primary)",
                color: "var(--background)",
              }}
            >
              今すぐ注文する
              <svg
                width="16"
                height="16"
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
            <a
              href="#how-it-works"
              className="text-[14px] font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--text-secondary)", textDecoration: "none" }}
            >
              仕組みを見る ↓
            </a>
          </div>
        </div>

        {/* ── Three.js scene column ── */}
        <div
          data-entrance
          className="order-1 lg:order-2 relative w-full aspect-square max-w-[520px] mx-auto"
        >
          {/* Copper ambient glow behind canvas */}
          <div
            className="absolute inset-0 rounded-2xl blur-3xl transform scale-90 opacity-12"
            style={{ background: "var(--accent)" }}
          />

          {/* Canvas wrapper */}
          <div className="relative w-full h-full rounded-2xl overflow-hidden glass-panel p-1.5">
            <PrintScene />
            {/* Caption */}
            <div
              className="absolute bottom-4 left-4 right-4 pointer-events-none"
            >
              <p
                className="text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: "rgba(242,237,232,0.35)" }}
              >
                積層シミュレーション
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
