import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { SignupBanner } from "@/components/site/signup-banner";
import { BLOG_POSTS } from "@/lib/blog";
import { blogIndexJsonLd, BLOG_DESCRIPTION, BLOG_TITLE, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: BLOG_TITLE,
  description: BLOG_DESCRIPTION,
  path: "/blog",
});

export default function BlogIndexPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:pt-16">
      <JsonLd data={blogIndexJsonLd()} />
      <p className="hero-in text-sm font-medium text-primary">Blog</p>
      <h1
        className="hero-in mt-2 font-[family-name:var(--font-fraunces)] text-4xl tracking-tight sm:text-5xl"
        style={{ animationDelay: "80ms" }}
      >
        Como tudo funciona
      </h1>
      <p
        className="hero-in mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg"
        style={{ animationDelay: "160ms" }}
      >
        Seis textos, na ordem em que o semestre entra no painel. Sem atalho escondido:
        é o que o app faz de verdade.
      </p>

      <ol className="mt-10 space-y-4">
        {BLOG_POSTS.map((post, index) => (
          <Reveal key={post.slug} as="li" delay={Math.min(index, 4) * 70}>
            <article className="lift">
              <Link
                href={`/blog/${post.slug}`}
                className="group block rounded-3xl border border-border/80 bg-card p-5 shadow-sm shadow-teal-950/5 transition-colors hover:border-primary/40 sm:p-6"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {String(index + 1).padStart(2, "0")} ·{" "}
                  <time dateTime={post.published}>{post.dateLabel}</time> · {post.minutes} min
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-fraunces)] text-2xl tracking-tight group-hover:text-primary">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {post.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Ler o guia
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </article>
          </Reveal>
        ))}
      </ol>

      <Reveal className="mt-12">
        <SignupBanner />
      </Reveal>
    </main>
  );
}
