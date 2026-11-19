import { ImageResponse } from "next/og";
import { OgCard } from "@/lib/og-card";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title")?.slice(0, 90) || "Organize provas e prazos num painel só.";
  const subtitle =
    searchParams.get("subtitle")?.slice(0, 160) ||
    "De graça, no seu navegador.";

  return new ImageResponse(<OgCard title={title} subtitle={subtitle} />, {
    width: 1200,
    height: 630,
  });
}
