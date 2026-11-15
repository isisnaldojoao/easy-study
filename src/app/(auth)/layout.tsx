import Link from "next/link";
import { AppLogo } from "@/components/brand/app-logo";
import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-teal-500/15 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <AppLogo
              size={56}
              className="rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-teal-900/10 ring-0"
            />
            <div>
              <h1 className="font-[family-name:var(--font-fraunces)] text-3xl tracking-tight">
                {APP_NAME}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Sua rotina acadêmica, organizada.
              </p>
            </div>
          </Link>
        </div>
        <div className="rounded-3xl border border-border/80 bg-card/90 p-6 shadow-xl shadow-teal-950/5 backdrop-blur sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
