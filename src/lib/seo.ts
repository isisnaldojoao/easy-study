import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
import { BLOG_POSTS, type BlogPost } from "@/lib/blog";

export const HOME_TITLE = "Easy Study — organize provas e prazos de graça";

export const HOME_DESCRIPTION =
  "Organize disciplinas, provas, revisões e horas de estudo num painel só. De graça, com a conta na nuvem, sem mensalidade. Crie a conta e veja o que estudar hoje.";

export const BLOG_TITLE = "Guias para organizar o semestre";

export const BLOG_DESCRIPTION =
  "Como o Easy Study funciona de verdade: disciplinas, prazos, calendário, revisão, materiais e onde os dados ficam. Leia e crie a conta grátis.";

export const FAQS = [
  {
    q: "É de graça?",
    a: "Sim. Sem plano, sem cartão e sem aquela conversa de “fale com vendas”. Cria a conta e usa.",
  },
  {
    q: "Meus dados vão para algum servidor?",
    a: "Sim. A conta, as disciplinas, os prazos e os arquivos ficam no seu projeto Supabase, com acesso só para você. Entrar em outro aparelho mostra o mesmo semestre.",
  },
  {
    q: "Funciona sem internet?",
    a: "O painel precisa de conexão para entrar e para salvar. O que você já carregou nesta aba continua na tela, mas uma alteração nova espera a rede voltar.",
  },
  {
    q: "Funciona no celular?",
    a: "Funciona. O layout acompanha a tela e dá para instalar na tela inicial, como um app.",
  },
  {
    q: "E se eu trocar de computador?",
    a: "Entra com o mesmo e-mail e senha. O semestre aparece lá. Se esquecer a senha, a recuperação manda um link para o e-mail.",
  },
] as const;

export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

export function absoluteUrl(path: string) {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  published,
  image,
}: {
  title: string | { absolute: string };
  description: string;
  path: string;
  type?: "website" | "article";
  published?: string;
  image?: string;
}): Metadata {
  const socialTitle = typeof title === "string" ? title : title.absolute;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      locale: "pt_BR",
      siteName: APP_NAME,
      url: path,
      title: socialTitle,
      description,
      ...(published ? { publishedTime: published } : {}),
      ...(image ? { images: [{ url: image, alt: socialTitle }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
    },
  };
}

export function homeJsonLd() {
  const url = absoluteUrl("/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${url}#website`,
        name: APP_NAME,
        url,
        inLanguage: "pt-BR",
        description: HOME_DESCRIPTION,
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${url}#app`,
        name: APP_NAME,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        url,
        inLanguage: "pt-BR",
        description: HOME_DESCRIPTION,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "BRL",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        url: `${url}#duvidas`,
        mainEntity: FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      },
    ],
  };
}

export function blogIndexJsonLd() {
  const url = absoluteUrl("/blog");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${url}#blog`,
        name: `${BLOG_TITLE} · ${APP_NAME}`,
        description: BLOG_DESCRIPTION,
        url,
        inLanguage: "pt-BR",
        publisher: { "@id": `${absoluteUrl("/")}#app` },
        blogPost: BLOG_POSTS.map((post) => ({
          "@id": `${absoluteUrl(`/blog/${post.slug}`)}#post`,
        })),
      },
      {
        "@type": "ItemList",
        itemListElement: BLOG_POSTS.map((post, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: post.title,
          url: absoluteUrl(`/blog/${post.slug}`),
        })),
      },
    ],
  };
}

export function postJsonLd(post: BlogPost) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#post`,
        headline: post.title,
        description: post.description,
        datePublished: post.published,
        dateModified: post.published,
        inLanguage: "pt-BR",
        mainEntityOfPage: url,
        url,
        author: { "@type": "Organization", name: APP_NAME, url: absoluteUrl("/") },
        publisher: { "@type": "Organization", name: APP_NAME, url: absoluteUrl("/") },
        isPartOf: { "@id": `${absoluteUrl("/blog")}#blog` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  };
}
