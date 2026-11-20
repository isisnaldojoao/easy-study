"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  FolderOpen,
  Sparkles,
} from "lucide-react";
import { AppLogo } from "@/components/brand/app-logo";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Button } from "@/components/ui/button";
import { Reveal, ScrollProgress } from "@/components/motion/reveal";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { FAQS } from "@/lib/seo";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Disciplinas",
    description:
      "Cada matéria com cor, descrição e o que ainda está pendente nela. Sem aba perdida.",
    href: "/blog/disciplinas-provas-e-prazos",
  },
  {
    icon: CalendarDays,
    title: "Calendário",
    description:
      "Provas, trabalhos e sessões na mesma grade. O que é hoje não se mistura com o mês que vem.",
    href: "/blog/calendario-e-planejamento",
  },
  {
    icon: Clock3,
    title: "Planejamento",
    description:
      "Blocos de estudo com início, fim e status. Você marca o que já fez e segue o resto.",
    href: "/blog/calendario-e-planejamento",
  },
  {
    icon: Sparkles,
    title: "Central de revisão",
    description:
      "Anotação com título, checklist e texto, ligada na disciplina. A revisão para de morar no caderno aleatório.",
    href: "/blog/revisao-e-flashcards",
  },
  {
    icon: FolderOpen,
    title: "Materiais",
    description:
      "PDF, slide, imagem e texto guardados junto da matéria. Na hora de estudar, está ali.",
    href: "/blog/materiais-relatorios-e-lembretes",
  },
  {
    icon: BarChart3,
    title: "Relatórios",
    description:
      "Horas estudadas, pendências e o que você já concluiu. Abre e vê se a semana rendeu.",
    href: "/blog/materiais-relatorios-e-lembretes",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Cria a conta",
    description: "Nome, e-mail e senha. Leva um minuto e a conta te acompanha.",
  },
  {
    n: "02",
    title: "Cadastra o semestre",
    description: "Disciplinas, provas, trabalhos e os dias em que você vai sentar para estudar.",
  },
  {
    n: "03",
    title: "Abre e estuda",
    description: "O início mostra o que vence agora. O resto espera a vez, sem planilha.",
  },
];

const AUDIENCES = [
  {
    title: "Graduação",
    description: "Várias matérias, prova acumulada e trabalho com data que muda no meio do caminho.",
  },
  {
    title: "Curso técnico",
    description: "Aula, entrega e estágio no mesmo semestre. Um lugar para não perder o prazo.",
  },
  {
    title: "Concurso e vestibular",
    description: "Rotina de revisão com hora marcada, em vez de uma lista que você nunca abre.",
  },
  {
    title: "Quem estuda sozinho",
    description: "Sem turma, sem grupo. O painel é o lembrete que não depende de mais ninguém.",
  },
];

const UPCOMING = [
  { name: "Cálculo II", meta: "Prova · sexta", when: "3 dias", color: "#0D9488" },
  { name: "Algoritmos", meta: "Trabalho", when: "6 dias", color: "#2563EB" },
  { name: "História", meta: "Leitura", when: "hoje", color: "#D97706" },
];

export function LandingPage() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) return;
    void getSupabase()
      .auth.getSession()
      .then(({ data }) => setLoggedIn(Boolean(data.session)));
  }, []);

  const primaryHref = loggedIn ? "/dashboard" : "/cadastro";
  const primaryLabel = loggedIn ? "Abrir meu painel" : "Criar conta grátis";

  return (
    <div className="relative isolate min-h-full">
      <ScrollProgress />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[46rem] overflow-hidden">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
      </div>
      <SiteHeader />

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-8 pt-14 sm:pt-20">
          <p
            className="hero-in inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
            style={{ animationDelay: "40ms" }}
          >
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-primary" />
            Feito para a rotina de quem estuda
          </p>

          <h1 className="hero-in mt-5 max-w-4xl font-[family-name:var(--font-fraunces)] text-[2rem] leading-[1.18] tracking-tight sm:text-5xl sm:leading-[1.12] lg:text-[3.35rem]" style={{ animationDelay: "120ms" }}>
            Você tem{" "}
            <span
              className="hero-pill inline-block rounded-full bg-warning/15 px-2.5 py-0.5 align-baseline text-[0.86em] text-warning"
              style={{ animationDelay: "280ms" }}
            >
              prova na sexta
            </span>{" "}
            e{" "}
            <span
              className="hero-pill inline-block rounded-full bg-accent px-2.5 py-0.5 align-baseline text-[0.86em] text-accent-foreground"
              style={{ animationDelay: "400ms" }}
            >
              trabalho na segunda
            </span>
            . O Study Flow te mostra{" "}
            <span
              className="hero-pill inline-block rounded-full bg-primary px-2.5 py-0.5 align-baseline text-[0.86em] text-primary-foreground"
              style={{ animationDelay: "520ms" }}
            >
              o que estudar hoje
            </span>
            .
          </h1>

          <p
            className="hero-in mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            style={{ animationDelay: "240ms" }}
          >
            Disciplinas, prazos, materiais e horas de estudo no mesmo painel. De graça.
            A conta abre de novo em outro aparelho.
          </p>

          <div
            className="hero-in mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "360ms" }}
          >
            <Button asChild size="lg" className="rounded-full">
              <Link href={primaryHref}>
                {primaryLabel}
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full bg-card">
              <a href="#painel">Ver o painel</a>
            </Button>
          </div>

          <ul className="mt-6 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-5">
            {["Sem mensalidade", "Sem cartão", "A mesma conta em outro aparelho"].map((item, index) => (
              <li
                key={item}
                className="hero-in flex items-center gap-2"
                style={{ animationDelay: `${460 + index * 80}ms` }}
              >
                <Check className="h-4 w-4 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section id="painel" className="scroll-mt-28 mx-auto max-w-6xl px-4 pb-20 pt-6" aria-labelledby="painel-titulo">
          <h2 id="painel-titulo" className="sr-only">
            Prévia do painel de estudos
          </h2>
          <Reveal variant="scale">
            <ProductPreview />
          </Reveal>
        </section>

        <section id="recursos" className="scroll-mt-28 mx-auto max-w-6xl px-4 py-16">
          <Reveal className="max-w-2xl">
            <p className="text-sm font-medium text-primary">Recursos</p>
            <h2 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl tracking-tight sm:text-4xl">
              Tudo que você já anota em cinco lugares. Aqui cabe num painel.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Grupo da turma, bloco de notas, calendário do celular e uma planilha que ninguém
              atualiza. O Study Flow junta a rotina acadêmica num fluxo só.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <Reveal key={feature.title} delay={(index % 3) * 90} className="h-full">
              <article
                className="lift h-full rounded-3xl border border-border/80 bg-card p-5 shadow-sm shadow-teal-950/5"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary">
                  <feature.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
                <Link href={feature.href} className="mt-3 inline-flex text-sm font-medium text-primary">
                  Ver como funciona
                </Link>
              </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-8">
          <Reveal>
          <div className="grid items-center gap-10 rounded-[2rem] border border-border/80 bg-card p-6 shadow-sm sm:p-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm font-medium text-primary">No dia a dia</p>
              <h2 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl tracking-tight sm:text-4xl">
                Um painel que fala a língua de quem estuda.
              </h2>
              <p className="mt-3 text-muted-foreground">
                Você não precisa exportar nada para saber se a semana está em dia. Abre o início,
                vê a prova que chega, a sessão de hoje e o que ainda está pendente.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "O que vence nos próximos dias, com a disciplina do lado.",
                  "Sessão de estudo com horário, para a intenção virar bloco na agenda.",
                  "Revisão e material juntos, para não caçar arquivo na véspera.",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-border bg-background p-4">
              <p className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Hoje
              </p>
              <div className="mt-3 space-y-2">
                {[
                  { title: "Sessão · Cálculo II", meta: "19:00–20:30 · limites", tag: "Agora" },
                  { title: "Leitura · História", meta: "capítulo 4", tag: "Hoje" },
                  { title: "Revisão · Algoritmos", meta: "árvores binárias", tag: "Amanhã" },
                ].map((item, index) => (
                  <div
                    key={item.title}
                    className="stagger-item flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-3 py-3"
                    style={{ ["--stagger" as string]: `${index * 90}ms` }}
                  >
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.meta}</p>
                    </div>
                    <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </Reveal>
        </section>

        <section id="como-funciona" className="scroll-mt-28 mx-auto max-w-6xl px-4 py-16">
          <Reveal className="max-w-2xl">
            <p className="text-sm font-medium text-primary">Como funciona</p>
            <h2 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl tracking-tight sm:text-4xl">
              Três passos. Aí é sentar e estudar.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              O passo a passo de cada parte está no{" "}
              <Link href="/blog" className="font-medium text-primary hover:underline">
                blog
              </Link>
              .
            </p>
            <Button asChild className="mt-5 rounded-full">
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
          </Reveal>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <Reveal key={step.n} as="li" delay={index * 110} className="lift rounded-3xl border border-border/80 bg-card p-6">
                <span className="font-[family-name:var(--font-fraunces)] text-3xl text-primary/70">
                  {step.n}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </Reveal>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-8">
          <Reveal className="max-w-2xl">
            <p className="text-sm font-medium text-primary">Para quem é</p>
            <h2 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl tracking-tight sm:text-4xl">
              Se o prazo mora na sua cabeça, é para você.
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {AUDIENCES.map((item, index) => (
              <Reveal key={item.title} as="article" delay={(index % 2) * 100} className="lift rounded-3xl border border-border/80 bg-card p-5">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="duvidas" className="scroll-mt-28 mx-auto max-w-3xl px-4 py-16">
          <Reveal className="text-center">
            <h2 className="font-[family-name:var(--font-fraunces)] text-3xl tracking-tight sm:text-4xl">
              Tem dúvida? Relaxa.
            </h2>
            <p className="mt-3 text-muted-foreground">
              O que a galera costuma perguntar antes de criar a conta.
            </p>
          </Reveal>
          <Reveal className="mt-8 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
            {FAQS.map((faq, index) => (
              <details key={faq.q} className="group" {...(index === 0 ? { open: true } : {})}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium sm:text-base [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="faq-panel">
                  <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                </div>
              </details>
            ))}
          </Reveal>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20">
          <Reveal variant="scale">
          <div className="overflow-hidden rounded-[2rem] bg-sidebar px-6 py-12 text-sidebar-foreground sm:px-12 sm:py-16">
            <p className="text-sm text-sidebar-muted">Sem mensalidade. A conta fica com você.</p>
            <h2 className="mt-3 max-w-xl font-[family-name:var(--font-fraunces)] text-3xl tracking-tight sm:text-5xl">
              Você leu até aqui. Bora tirar esse semestre da cabeça?
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-sidebar-muted sm:text-base">
              A conta leva um minuto. A primeira disciplina você cadastra hoje e encontra de novo amanhã.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-teal-300 text-teal-950 hover:bg-teal-200"
              >
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRight />
                </Link>
              </Button>
              {!loggedIn && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/15 bg-transparent text-sidebar-foreground hover:bg-white/10 hover:text-sidebar-foreground"
                >
                  <Link href="/login">Já tenho conta</Link>
                </Button>
              )}
            </div>
          </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function ProductPreview() {
  const cardRef = useRef<HTMLDivElement>(null);

  function tilt(event: PointerEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card || event.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
  }

  function resetTilt() {
    if (cardRef.current) cardRef.current.style.transform = "";
  }

  return (
    <figure className="relative [perspective:1400px]">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-2 -top-6 bottom-8 -z-10 rounded-[2rem] bg-primary/10 blur-2xl"
      />
      <div
        aria-hidden
        className="float-card pointer-events-none absolute -right-3 top-10 hidden h-[78%] w-[68%] rounded-[1.75rem] border border-border bg-card shadow-xl lg:block"
      />

      <div
        ref={cardRef}
        onPointerMove={tilt}
        onPointerLeave={resetTilt}
        className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-sidebar text-sidebar-foreground shadow-2xl shadow-teal-950/25 transition-transform duration-200 ease-out"
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <AppLogo size={28} />
            <span className="truncate text-sm font-medium">Study Flow</span>
          </div>
          <div className="hidden items-center gap-4 text-xs text-sidebar-muted md:flex">
            <span className="text-sidebar-foreground">Início</span>
            <span>Disciplinas</span>
            <span>Calendário</span>
            <span>Revisão</span>
          </div>
          <span className="rounded-full bg-teal-300 px-3 py-1 text-xs font-medium text-teal-950">
            Semana 8
          </span>
        </div>

        <div className="px-4 py-6 sm:px-6 sm:py-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-sidebar-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
            Prévia com dados de exemplo
          </p>
          <p className="mt-4 max-w-xl font-[family-name:var(--font-fraunces)] text-2xl leading-tight tracking-tight sm:text-4xl">
            Prazos, revisão e hora de estudo no mesmo lugar.
          </p>
          <p className="mt-3 max-w-lg text-sm text-sidebar-muted">
            Abre o painel e já sabe o que vence, o que revisar e onde encaixar a próxima sessão.
          </p>

          <div className="mt-6 grid gap-3 lg:grid-cols-6">
            <div className="rounded-2xl border border-white/10 bg-sidebar-accent p-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-sidebar-muted">Revisão de hoje</p>
                <Sparkles className="h-4 w-4 text-teal-300" />
              </div>
              <p className="mt-3 text-sm font-medium">Cálculo II · limites</p>
              <p className="mt-1 text-xs leading-relaxed text-sidebar-muted">
                Checklist da aula de terça, com o material da disciplina do lado.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-sidebar-accent p-4 lg:col-span-2">
              <p className="text-xs text-sidebar-muted">Últimos 30 dias</p>
              <p className="mt-1 text-sm font-medium">Horas de estudo</p>
              <svg viewBox="0 0 200 72" className="mt-3 h-16 w-full text-teal-300" aria-hidden>
                <path
                  className="chart-draw"
                  pathLength={1}
                  d="M0 52 C20 50 28 58 42 46 C58 32 70 40 86 34 C104 26 112 38 128 22 C146 6 160 24 176 16 C186 12 194 18 200 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  className="chart-fill"
                  d="M0 52 C20 50 28 58 42 46 C58 32 70 40 86 34 C104 26 112 38 128 22 C146 6 160 24 176 16 C186 12 194 18 200 10 V72 H0 Z"
                  fill="currentColor"
                  opacity="0.15"
                />
              </svg>
            </div>

            <div className="rounded-2xl border border-white/10 bg-sidebar-accent p-4 lg:col-span-2 lg:row-span-2">
              <p className="text-xs text-sidebar-muted">Próximos prazos</p>
              <ul className="mt-3 space-y-3">
                {UPCOMING.map((item, index) => (
                  <li
                    key={item.name}
                    className="stagger-item flex items-center justify-between gap-3"
                    style={{ ["--stagger" as string]: `${180 + index * 90}ms` }}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-sidebar-muted">{item.meta}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-sidebar-muted">{item.when}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-sidebar-accent p-4 lg:col-span-2">
              <p className="text-xs text-sidebar-muted">Pendentes</p>
              <p className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl tracking-tight">
                7
              </p>
              <p className="mt-1 text-xs text-sidebar-muted">2 vencem nesta semana</p>
            </div>

            <div className="flex items-end rounded-2xl border border-white/10 bg-sidebar-accent p-4 lg:col-span-2">
              <p className="text-sm leading-relaxed text-sidebar-muted">
                Acompanhe a carga da semana e decida a próxima sessão com o prazo na frente.
              </p>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="sr-only">
        Prévia ilustrada do painel do Study Flow, com dados de exemplo.
      </figcaption>
    </figure>
  );
}
