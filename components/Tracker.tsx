"use client";
// The main screen: hero, tabs, filters, the table/cards, detail sheet and bottom bar.
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useHackathonMutations, useHackathons } from "@/lib/client";
import { applyFilters, sortHackathons, tabCounts, type Sort, type SortKey } from "@/lib/filters";
import { STATUSES, type Hackathon, type Status, type Tab } from "@/lib/types";
import { DetailSheet } from "./DetailSheet";
import { HackathonCards } from "./HackathonCards";
import { HackathonGrid, type RowActions } from "./HackathonGrid";
import { Hero } from "./Hero";
import { Duck } from "./art";
import { ListIcon, LogoutIcon, PlusIcon, TableIcon } from "./icons";
import { ConfirmDelete, Liftoff } from "./Overlays";
import { FilterBar, StatusTabs } from "./Toolbar";

const DEFAULT_CATEGORIES = ["AI", "Fintech", "Web3", "General"];

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function useIsDesktop() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(min-width: 768px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 768px)").matches,
    () => true,
  );
}

type View = "table" | "cards";
function loadView(): View {
  try {
    return localStorage.getItem("ht:view") === "cards" ? "cards" : "table";
  } catch {
    return "table";
  }
}

type Toast = { message: string; tone: "info" | "error"; undo?: () => void };

export function Tracker({ initialData }: { initialData: Hackathon[] }) {
  const now = useNow();
  const isDesktop = useIsDesktop();
  const [view, setView] = useState<View>(loadView);
  const [tab, setTab] = useState<Tab>("ALL");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>({ key: "daysLeft", dir: "asc" });
  const [openId, setOpenId] = useState<string | null>(null);
  const [newId, setNewId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<Hackathon | null>(null);
  const [celebrate, setCelebrate] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const { data: list = [], isFetching, error } = useHackathons(initialData);
  const showError = useCallback((message: string) => setToast({ message: `Couldn't save: ${message}`, tone: "error" }), []);
  const { update, remove, create } = useHackathonMutations(showError);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), toast.undo ? 6000 : 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const changeView = (v: View) => {
    setView(v);
    try {
      localStorage.setItem("ht:view", v);
    } catch {}
  };

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const c of [...list.map((h) => h.category), ...DEFAULT_CATEGORIES]) {
      if (c && !seen.has(c.toLowerCase())) seen.set(c.toLowerCase(), c);
    }
    return [...seen.values()].sort((a, b) => a.localeCompare(b));
  }, [list]);
  const usedCategories = useMemo(
    () => categories.filter((c) => list.some((h) => h.category?.toLowerCase() === c.toLowerCase())),
    [categories, list],
  );

  const counts = useMemo(() => tabCounts(list, { q, category }, now), [list, q, category, now]);
  const rows = useMemo(
    () => sortHackathons(applyFilters(list, { tab, q, category }, now), sort, now),
    [list, tab, q, category, sort, now],
  );
  const active = useMemo(() => list.filter((h) => !h.archivedAt), [list]);
  const opened = openId ? list.find((h) => h.id === openId) ?? null : null;

  const onSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  const actions: RowActions = {
    save: (id, patch) => {
      const before = list.find((h) => h.id === id);
      if (patch.status === "COMPLETED" && before && before.status !== "COMPLETED") setCelebrate(before.name);
      update.mutate({ id, patch });
    },
    toggleArchive: (h) => {
      const archived = !h.archivedAt;
      update.mutate({ id: h.id, patch: { archived } });
      setToast({
        message: archived ? `Archived “${h.name}”` : `Restored “${h.name}”`,
        tone: "info",
        undo: () => update.mutate({ id: h.id, patch: { archived: !archived } }),
      });
    },
    remove: (h) => setConfirming(h),
  };

  const addHackathon = () => {
    const isStatusTab = (STATUSES as readonly string[]).includes(tab);
    const status: Status = isStatusTab ? (tab as Status) : "CONSIDERING";
    if (!isStatusTab) setTab("ALL");
    setQ("");
    setCategory(null);
    create.mutate(
      { name: "Untitled hackathon", status },
      {
        onSuccess: (h) => {
          setNewId(h.id);
          setOpenId(h.id);
        },
      },
    );
  };

  const showTable = isDesktop && view === "table";
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b-2 border-navy bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-2.5 sm:px-8">
          <Duck size={34} />
          <span className="font-display text-[17px] font-extrabold tracking-tight">Hackathon Tracker</span>
          {isFetching && <span className="font-mono text-[10px] uppercase tracking-widest text-muted">syncing…</span>}
          <div className="ml-auto flex items-center gap-1">
            {isDesktop && (
              <button
                onClick={() => changeView(view === "table" ? "cards" : "table")}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-navy/70 hover:bg-navy/5 hover:text-navy"
              >
                {view === "table" ? <ListIcon size={16} /> : <TableIcon size={16} />}
                {view === "table" ? "Index cards" : "Notebook"}
              </button>
            )}
            <button onClick={logout} aria-label="Log out" title="Log out" className="rounded-lg p-2 text-navy/60 hover:bg-navy/5 hover:text-navy">
              <LogoutIcon size={18} />
            </button>
            {isDesktop && (
              <button onClick={addHackathon} disabled={create.isPending} className="btn-launch ml-2 py-2 text-[14px]">
                <PlusIcon size={16} /> New hackathon
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] space-y-10 px-4 pb-28 pt-8 sm:px-8">
        {error && (
          <p className="rounded-md border-2 border-rocket bg-hl-pink px-4 py-3 text-[13px] text-rocket">
            Couldn&apos;t load hackathons: {error.message}
          </p>
        )}

        <Hero list={active} now={now} onOpen={(h) => setOpenId(h.id)} />

        <section className="space-y-4" aria-label="All hackathons">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-2xl font-bold tracking-tight">All hackathons</h2>
            <FilterBar q={q} onQ={setQ} category={category} onCategory={setCategory} categories={usedCategories} />
          </div>

          <div>
            <StatusTabs tab={tab} counts={counts} onChange={setTab} />
            <div className="border-t-2 border-navy">
              {rows.length === 0 ? (
                <div className="card-paper flex flex-col items-center rounded-t-none px-6 py-10 text-center">
                  <Duck mood="sleepy" size={96} />
                  <p className="mt-2 font-hand text-[22px] text-navy/80">
                    {list.length === 0 ? "Empty desk! Add your first hackathon." : "Nothing matches these filters."}
                  </p>
                </div>
              ) : showTable ? (
                <HackathonGrid
                  rows={rows}
                  now={now}
                  sort={sort}
                  onSort={onSort}
                  categories={categories}
                  actions={actions}
                  onOpen={(h) => setOpenId(h.id)}
                />
              ) : (
                <div className="pt-5">
                  <HackathonCards rows={rows} now={now} actions={actions} onOpen={(h) => setOpenId(h.id)} />
                </div>
              )}
            </div>
            {showTable && (
              <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted">
                Click any cell to edit · Enter saves · Esc cancels · yellow highlighter &lt; 7 days · pink &lt; 3 days
              </p>
            )}
          </div>
        </section>
      </main>

      {/* Phone: floating launch button */}
      {!isDesktop && (
        <button
          onClick={addHackathon}
          disabled={create.isPending}
          aria-label="New hackathon"
          className="btn-launch fixed bottom-5 right-5 z-50 size-14 rounded-2xl p-0"
        >
          <PlusIcon size={24} />
        </button>
      )}

      {opened && (
        <DetailSheet
          h={opened}
          now={now}
          categories={categories}
          actions={actions}
          isNew={opened.id === newId}
          onClose={() => {
            setOpenId(null);
            setNewId(null);
          }}
        />
      )}

      {confirming && (
        <ConfirmDelete
          name={confirming.name}
          onCancel={() => setConfirming(null)}
          onConfirm={() => {
            remove.mutate(confirming.id);
            if (openId === confirming.id) setOpenId(null);
            setToast({ message: `Deleted “${confirming.name}”`, tone: "info" });
            setConfirming(null);
          }}
        />
      )}

      {celebrate && <Liftoff name={celebrate} onDone={() => setCelebrate(null)} />}

      {toast && (
        <div
          role="status"
          className={`fixed bottom-5 left-1/2 z-[90] flex -translate-x-1/2 animate-rise items-center gap-3 whitespace-nowrap rounded-lg border-2 border-navy px-4 py-2.5 font-mono text-[12px] ${
            toast.tone === "error" ? "bg-rocket text-white" : "bg-navy text-paper"
          }`}
          style={{ boxShadow: "0 4px 0 rgba(28,37,65,.35)" }}
        >
          {toast.message}
          {toast.undo && (
            <button
              onClick={() => {
                toast.undo!();
                setToast(null);
              }}
              className="font-bold uppercase text-duck underline underline-offset-2"
            >
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
