"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const SESSION_KEY = "studyflow.session";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const hasSession = Boolean(localStorage.getItem(SESSION_KEY));
    router.replace(hasSession ? "/dashboard" : "/login");
  }, [router]);

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Carregando...</p>
    </div>
  );
}
