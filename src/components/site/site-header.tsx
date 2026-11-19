"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AppLogo } from "@/components/brand/app-logo";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const LINKS = [
  { id: "recursos", label: "Recursos" },
  { id: "painel", label: "O painel" },
  { id: "como-funciona", label: "Como funciona" },
  { id: "duvidas", label: "Dúvidas" },
] as const;

export function SiteHeader({ variant = "home" }: { variant?: "home" | "site" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!supabaseConfigured) return;
    void getSupabase()
      .auth.getSession()
      .then(({ data }) => setLoggedIn(Boolean(data.session)));
  }, []);

  const primaryHref = loggedIn ? "/dashboard" : "/cadastro";
  const primaryLabel = loggedIn ? "Abrir meu painel" : "Criar conta grátis";
  const sectionHref = (id: string) => (variant === "home" ? `#${id}` : `/#${id}`);

  const items = [
    ...LINKS.map((item) => ({ href: sectionHref(item.id), label: item.label })),
    { href: "/blog", label: "Blog" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-b from-background from-55% to-transparent px-3 pb-4 pt-3 sm:px-4 sm:pt-4">
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center gap-2 rounded-full border border-border/80 bg-card/85 px-2 py-1.5 shadow-sm shadow-teal-950/5 backdrop-blur-md transition-shadow duration-300 sm:gap-3 sm:px-3",
          scrolled && "shadow-lg shadow-teal-950/10"
        )}
      >
        <Link href="/" className="flex min-w-0 items-center gap-2 pl-1">
          <AppLogo
            size={34}
            className="rounded-xl bg-primary text-primary-foreground ring-0"
          />
          <span className="truncate font-[family-name:var(--font-fraunces)] text-base tracking-tight">
            {APP_NAME}
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-0.5 lg:flex" aria-label="Seções">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                item.href === "/blog" &&
                  variant === "site" &&
                  "bg-accent text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {!loggedIn && (
            <Link
              href="/login"
              className="hidden rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              Entrar
            </Link>
          )}
          <Button asChild size="sm" className="rounded-full px-3 sm:px-4">
            <Link href={primaryHref}>
              <span className="sm:hidden">{loggedIn ? "Painel" : "Começar"}</span>
              <span className="hidden sm:inline">{primaryLabel}</span>
            </Link>
          </Button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-accent lg:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="animate-fade-up mx-auto mt-2 max-w-6xl rounded-3xl border border-border bg-card p-3 shadow-lg lg:hidden">
          <nav className="flex flex-col" aria-label="Seções">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl px-3 py-2.5 text-sm hover:bg-accent"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {!loggedIn && (
              <Link
                href="/login"
                className="rounded-2xl px-3 py-2.5 text-sm hover:bg-accent"
                onClick={() => setMenuOpen(false)}
              >
                Entrar
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
