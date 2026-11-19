import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { SignupBanner } from "@/components/site/signup-banner";
import { BLOG_POSTS, getPost } from "@/lib/blog";
import { pageMetadata, postJsonLd } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Texto não encontrado" };
  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    type: "article",
    published: post.published,
    image: `/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(post.description)}`,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const index = BLOG_POSTS.findIndex((item) => item.slug === post.slug);
  const previous = index > 0 ? BLOG_POSTS[index - 1] : undefined;
  const next = index < BLOG_POSTS.length - 1 ? BLOG_POSTS[index + 1] : undefined;

  return (
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:pt-12">
      <JsonLd data={postJsonLd(post)} />
      <nav aria-label="Trilha" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link href="/" className="hover:text-foreground">
              Início
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/blog" className="hover:text-foreground">
              Blog
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground">{post.title}</li>
        </ol>
      </nav>

      <article>
        <header className="hero-in mt-8">
          <p className="text-sm text-muted-foreground">
            <time dateTime={post.published}>{post.dateLabel}</time>
            {" · "}
            {post.minutes} min de leitura
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-fraunces)] text-4xl tracking-tight sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{post.description}</p>
        </header>

        <div className="mt-10 space-y-5">
          {post.blocks.map((block, blockIndex) => {
            if (block.type === "h2") {
              return (
                <h2
                  key={blockIndex}
                  className="pt-4 font-[family-name:var(--font-fraunces)] text-2xl tracking-tight"
                >
                  {block.text}
                </h2>
              );
            }
            if (block.type === "ul") {
              return (
                <ul
                  key={blockIndex}
                  className="list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground/90"
                >
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={blockIndex} className="text-base leading-relaxed text-foreground/90">
                {block.text}
              </p>
            );
          })}
        </div>
      </article>

      <nav aria-label="Outros textos" className="mt-12 grid gap-3 sm:grid-cols-2">
        {previous ? (
          <Link
            href={`/blog/${previous.slug}`}
            rel="prev"
            className="rounded-3xl border border-border/80 bg-card p-4 hover:border-primary/40"
          >
            <p className="text-xs text-muted-foreground">Anterior</p>
            <p className="mt-1 font-medium">{previous.title}</p>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/blog/${next.slug}`}
            rel="next"
            className="rounded-3xl border border-border/80 bg-card p-4 text-right hover:border-primary/40 sm:col-start-2"
          >
            <p className="text-xs text-muted-foreground">Próximo</p>
            <p className="mt-1 font-medium">{next.title}</p>
          </Link>
        )}
      </nav>

      <Reveal className="mt-10">
        <SignupBanner />
      </Reveal>
    </main>
  );
}
