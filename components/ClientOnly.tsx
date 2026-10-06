"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Renders children only in the browser (avoids server/client clock and timezone mismatches). */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return mounted ? children : <div className="p-8 text-[13px] text-muted">Loading…</div>;
}
