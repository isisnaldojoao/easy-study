"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/utils";

type RevealTag = "div" | "li" | "article" | "section";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "up" | "scale" | "left";
  as?: RevealTag;
};

export function Reveal({
  children,
  className,
  delay = 0,
  variant = "up",
  as = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.dataset.shown = "true";
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        node.dataset.shown = "true";
        observer.disconnect();
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const shared = {
    className: cn("reveal", className),
    "data-variant": variant,
    style: { "--reveal-delay": `${delay}ms` } as CSSProperties,
    children,
  };

  if (as === "li") return <li ref={ref as Ref<HTMLLIElement>} {...shared} />;
  if (as === "article") return <article ref={ref as Ref<HTMLElement>} {...shared} />;
  if (as === "section") return <section ref={ref as Ref<HTMLElement>} {...shared} />;
  return <div ref={ref as Ref<HTMLDivElement>} {...shared} />;
}

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = ref.current;
    if (!bar) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? window.scrollY / height : 0;
      bar.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ref} aria-hidden className="scroll-progress" />;
}
