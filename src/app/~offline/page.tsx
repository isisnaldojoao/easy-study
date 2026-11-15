import Link from "next/link";
import { AppLogo } from "@/components/brand/app-logo";
import { APP_NAME } from "@/lib/constants";

export default function OfflinePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <AppLogo size={64} className="rounded-2xl" />
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl tracking-tight">
        Você está offline
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        O {APP_NAME} continua com os dados salvos neste dispositivo. Reconecte
        para carregar páginas novas.
      </p>
      <Link
        href="/dashboard"
        className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Voltar ao dashboard
      </Link>
    </main>
  );
}
