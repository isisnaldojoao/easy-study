import { ImageResponse } from "next/og";
import { OgCard } from "@/lib/og-card";

export const alt = "Guias do Study Flow para organizar o semestre";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function BlogOpenGraphImage() {
  return new ImageResponse(
    (
      <OgCard
        title="Como o semestre entra no painel."
        subtitle="Disciplinas, prazos, revisão, materiais e onde os seus dados ficam."
      />
    ),
    { ...size }
  );
}
