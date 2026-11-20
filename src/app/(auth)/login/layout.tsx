import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Entrar",
  description: "Entre na sua conta do Study Flow e continue de onde parou.",
  path: "/login",
  image: "/opengraph-image",
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
