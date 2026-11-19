import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense>
        <RequestMarker />
      </Suspense>
      <AuthGuard>
        <AppShell>{children}</AppShell>
      </AuthGuard>
    </>
  );
}

async function RequestMarker() {
  await connection();
  return null;
}
