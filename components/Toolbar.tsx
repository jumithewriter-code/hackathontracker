"use client";

import { TAB_LABELS, TABS, type Tab } from "@/lib/types";
import { SearchIcon } from "./icons";

export function StatusTabs({
  tab,
  counts,
  onChange,
}: {
  tab: Tab;
  counts: Record<Tab, number>;
  onChange: (t: Tab) => void;
}) {
  return (
    <div role="tablist" aria-label="Filter by status" className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {TABS.map((t) => {
        const active = t === tab;
        const alert = t === "OVERDUE" && counts[t] > 0;
        return (
          <button
            key={t}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t)}
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf ${
              active ? "bg-ink text-cream" : "bg-cream-2 text-ink/75 hover:bg-cream-3"
            }`}
          >
            {TAB_LABELS[t]}
            <span
              className={`min-w-5 rounded-full px-1.5 text-center text-[11px] tabular-nums ${
                alert ? "bg-coral text-white" : active ? "bg-cream/15 text-cream" : "bg-cream-3 text-muted"
              }`}
            >
              {counts[t]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function FilterBar({
  q,
  onQ,
  category,
  onCategory,
  categories,
}: {
  q: string;
  onQ: (q: string) => void;
  category: string | null;
  onCategory: (c: string | null) => void;
  categories: string[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-cream-2 px-4 py-2.5 focus-within:ring-2 focus-within:ring-leaf sm:max-w-sm">
        <SearchIcon size={16} className="shrink-0 text-muted" />
        <input
          type="search"
          value={q}
          onChange={(e) => onQ(e.target.value)}
          placeholder="Search hackathons…"
          aria-label="Search by name"
          className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted"
        />
      </label>
      <select
        aria-label="Filter by category"
        value={category ?? ""}
        onChange={(e) => onCategory(e.target.value || null)}
        className="cursor-pointer rounded-full bg-cream-2 px-4 py-2.5 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-leaf"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {(q || category) && (
        <button
          onClick={() => {
            onQ("");
            onCategory(null);
          }}
          className="rounded-full px-3 py-2 text-[13px] text-muted hover:bg-ink/5 hover:text-ink"
        >
          Clear
        </button>
      )}
    </div>
  );
}
