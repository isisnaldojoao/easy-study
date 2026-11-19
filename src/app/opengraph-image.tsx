import { ImageResponse } from "next/og";
import { OgCard } from "@/lib/og-card";
import { HOME_DESCRIPTION } from "@/lib/seo";

export const alt = "Easy Study — organize provas e prazos de graça";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <OgCard
        title="Organize provas e prazos num painel só."
        subtitle={HOME_DESCRIPTION}
      />
    ),
    { ...size }
  );
}
