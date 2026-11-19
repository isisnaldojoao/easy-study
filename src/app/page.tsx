import { LandingPage } from "@/components/landing/landing-page";
import { JsonLd } from "@/components/seo/json-ld";
import { homeJsonLd, HOME_DESCRIPTION, HOME_TITLE, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <LandingPage />
    </>
  );
}
