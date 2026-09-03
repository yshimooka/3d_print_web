import Link from "next/link";
import type { ReactNode } from "react";

// 静的ページ(料金・FAQ・法務)の共通レイアウト

export default function StaticPage({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <nav className="border-b" style={{ background: "rgba(247,246,242,0.9)", borderColor: "var(--border-light)", backdropFilter: "blur(16px)" }}>
        <div className="max-w-4xl mx-auto h-[68px] px-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-[15px] font-bold"
            style={{ color: "var(--text-primary)", textDecoration: "none" }}
          >
            大國造形
          </Link>
          <Link
            href="/order"
            className="text-[13px] font-bold px-4 py-2 rounded-lg transition-all hover:-translate-y-0.5"
            style={{ background: "var(--accent)", color: "#FFFFFF" }}
          >
            無料で見積もる
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-14 sm:py-18">
        <h1
          className="text-[34px] sm:text-[44px] font-bold mb-5 leading-[1.25]"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          {title}
        </h1>
        {lead && (
          <p className="text-[15px] leading-[1.9] mb-10 max-w-3xl" style={{ color: "var(--text-secondary)" }}>
            {lead}
          </p>
        )}
        <div className="static-content">
          {children}
        </div>
      </main>

      <footer className="py-8 px-6" style={{ borderTop: "1px solid var(--border-light)", background: "#fff" }}>
        <div className="max-w-4xl mx-auto flex flex-wrap gap-x-8 gap-y-2 items-center justify-between">
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            © 2026 大國造形
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { href: "/pricing", label: "料金の仕組み" },
              { href: "/faq", label: "よくある質問" },
              { href: "/legal/terms", label: "利用規約" },
              { href: "/legal/privacy", label: "プライバシー" },
              { href: "/legal/tokushoho", label: "特定商取引法" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-[12px] hover:opacity-70"
                style={{ color: "var(--text-tertiary)", textDecoration: "none" }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-10 last:mb-0">
      <h2 className="text-[18px] font-bold mb-3" style={{ color: "var(--text-primary)" }}>
        {title}
      </h2>
      <div className="text-[14px] leading-[1.9] space-y-3" style={{ color: "var(--text-secondary)" }}>
        {children}
      </div>
    </section>
  );
}
