"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  staggerMs?: number;
}

export default function StaggerReveal({
  children,
  className,
  staggerMs = 80,
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const items = Array.from(container.children) as HTMLElement[];

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const anime = (await import("animejs")).default;
        anime({
          targets: items,
          opacity: [0, 1],
          translateY: [24, 0],
          delay: anime.stagger(staggerMs),
          duration: 580,
          easing: "easeOutQuart",
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [staggerMs]);

  return (
    <div ref={ref} data-stagger className={className}>
      {children}
    </div>
  );
}
