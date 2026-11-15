"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "easystudy.sidebarCollapsed";

interface SidebarPreferenceValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  ready: boolean;
}

const SidebarPreferenceContext = createContext<SidebarPreferenceValue | null>(
  null
);

export function SidebarPreferenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsedState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "0") setCollapsedState(false);
    if (stored === "1") setCollapsedState(true);
    setReady(true);
  }, []);

  const setCollapsed = useCallback((next: boolean) => {
    setCollapsedState(next);
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ collapsed, setCollapsed, toggleCollapsed, ready }),
    [collapsed, setCollapsed, toggleCollapsed, ready]
  );

  return (
    <SidebarPreferenceContext.Provider value={value}>
      {children}
    </SidebarPreferenceContext.Provider>
  );
}

export function useSidebarPreference() {
  const ctx = useContext(SidebarPreferenceContext);
  if (!ctx) {
    throw new Error(
      "useSidebarPreference must be used within SidebarPreferenceProvider"
    );
  }
  return ctx;
}
