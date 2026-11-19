import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Criar conta grátis",
  description:
    "Crie sua conta no Easy Study e organize disciplinas, provas e sessões. Leva um minuto, sem cartão.",
  path: "/cadastro",
  image: "/opengraph-image",
});

export default function CadastroLayout({ children }: { children: React.ReactNode }) {
  return children;
}
