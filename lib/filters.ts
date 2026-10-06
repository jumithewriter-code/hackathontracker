// Tab / search / category filtering and sorting for the table. Pure functions.
import { daysLeft, displayStatus } from "./deadlines";
import { STATUS_LABELS, RESULT_LABELS, type Hackathon, type Tab } from "./types";

export interface Filters {
  tab: Tab;
  category: string | null;
  q: string;
}

export function matchesTab(h: Hackathon, tab: Tab, now: Date): boolean {
  if (tab === "ARCHIVED") return h.archivedAt !== null;
  if (h.archivedAt !== null) return false;
  if (tab === "ALL") return true;
  return displayStatus(h, now) === tab;
}

export function applyFilters(list: Hackathon[], f: Filters, now: Date): Hackathon[] {
  const q = f.q.trim().toLowerCase();
  const cat = f.category?.toLowerCase() ?? null;
  return list.filter(
    (h) =>
      matchesTab(h, f.tab, now) &&
      (!cat || h.category?.toLowerCase() === cat) &&
      (!q || h.name.toLowerCase().includes(q)),
  );
}

/** Row counts for every tab (ignores the tab filter, respects search + category). */
export function tabCounts(list: Hackathon[], f: Omit<Filters, "tab">, now: Date): Record<Tab, number> {
  const base = applyFilters(list, { ...f, tab: "ALL" }, now);
  const archived = applyFilters(list, { ...f, tab: "ARCHIVED" }, now);
  const counts = {
    ALL: base.length,
    ARCHIVED: archived.length,
    CONSIDERING: 0,
    NOT_STARTED: 0,
    IN_PROGRESS: 0,
    OVERDUE: 0,
    MISSED: 0,
    COMPLETED: 0,
  } satisfies Record<Tab, number>;
  for (const h of base) counts[displayStatus(h, now)]++;
  return counts;
}

export type SortKey =
  | "name"
  | "organizer"
  | "category"
  | "status"
  | "startDate"
  | "deadline"
  | "daysLeft"
  | "prize"
  | "result";
export interface Sort {
  key: SortKey;
  dir: "asc" | "desc";
}

/** Sorts a copy. Empty values always go last, regardless of direction. */
export function sortHackathons(list: Hackathon[], sort: Sort, now: Date): Hackathon[] {
  const value = (h: Hackathon): string | number | null => {
    switch (sort.key) {
      case "status":
        return STATUS_LABELS[displayStatus(h, now)];
      case "result":
        return h.result ? RESULT_LABELS[h.result] : null;
      case "deadline":
        return h.deadline ? new Date(h.deadline).getTime() : null;
      case "daysLeft":
        return h.status === "COMPLETED" ? null : daysLeft(h, now);
      default:
        return h[sort.key] ?? null;
    }
  };
  const dir = sort.dir === "asc" ? 1 : -1;
  return [...list].sort((a, b) => {
    const va = value(a);
    const vb = value(b);
    if (va === null && vb === null) return 0;
    if (va === null) return 1;
    if (vb === null) return -1;
    if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
    return String(va).localeCompare(String(vb), undefined, { sensitivity: "base", numeric: true }) * dir;
  });
}
