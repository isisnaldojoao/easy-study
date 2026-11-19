import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SignupBanner({ className = "" }: { className?: string }) {
  return (
    <aside className={`rounded-[2rem] bg-sidebar px-6 py-8 text-sidebar-foreground sm:px-8 ${className}`}>
      <h2 className="font-[family-name:var(--font-fraunces)] text-2xl tracking-tight">
        Agora é cadastrar a primeira disciplina.
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-sidebar-muted">
        A conta é grátis, leva um minuto e abre o mesmo semestre em outro aparelho.
      </p>
      <Link
        href="/cadastro"
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-teal-300 px-6 text-sm font-medium text-teal-950 hover:bg-teal-200"
      >
        Criar conta grátis
        <ArrowRight className="h-4 w-4" />
      </Link>
    </aside>
  );
}
