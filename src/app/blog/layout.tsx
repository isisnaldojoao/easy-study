import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-full">
      <SiteHeader variant="site" />
      {children}
      <SiteFooter variant="site" />
    </div>
  );
}
