"use client";
// Folder-divider tabs for status, plus the search + category bar.
import { TAB_LABELS, VISIBLE_TABS, type Tab } from "@/lib/types";
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
    <div role="tablist" aria-label="Filter by status" className="no-scrollbar -mx-4 flex items-end gap-0.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {VISIBLE_TABS.map((t) => {
        const active = t === tab;
        const alert = t === "OVERDUE" && counts[t] > 0;
        return (
          <button
            key={t}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t)}
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-t-lg border-2 border-b-0 px-3.5 text-[13px] font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-navy ${
              active
                ? "relative z-10 -mb-0.5 border-navy bg-card pb-2.5 pt-2.5 text-navy"
                : "border-navy/15 bg-paper-2 pb-1.5 pt-1.5 text-navy/60 hover:bg-card hover:text-navy"
            }`}
          >
            {TAB_LABELS[t]}
            <span
              className={`font-mono text-[11px] tabular-nums ${alert ? "rounded bg-rocket px-1 text-white" : active ? "text-rocket" : "text-muted"}`}
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
      <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border-2 border-navy/15 bg-card px-3 py-2 focus-within:border-navy sm:max-w-sm">
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
        className="cursor-pointer rounded-xl border-2 border-navy/15 bg-card px-3 py-2 text-[14px] outline-none focus-visible:border-navy"
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
          className="rounded-xl px-3 py-2 text-[13px] font-medium text-muted hover:bg-navy/5 hover:text-navy"
        >
          Clear
        </button>
      )}
    </div>
  );
}
