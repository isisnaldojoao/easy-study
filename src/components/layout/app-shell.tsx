"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SearchProvider, useSearch } from "@/components/layout/search-context";
import { SidebarPreferenceProvider } from "@/components/layout/sidebar-preference";

function ShellInner({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { search, setSearch } = useSearch();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onMenuClick={() => setMobileOpen(true)}
          search={search}
          onSearchChange={setSearch}
        />
        <main className="flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider>
      <SidebarPreferenceProvider>
        <ShellInner>{children}</ShellInner>
      </SidebarPreferenceProvider>
    </SearchProvider>
  );
}
