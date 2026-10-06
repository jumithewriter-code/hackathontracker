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
import { ListIcon, LogoutIcon, PlusIcon, TableIcon } from "./icons";
import { Mascot } from "./Mascot";
import { Celebration, ConfirmDelete } from "./Overlays";
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

  return (
    <div className="mx-auto max-w-[1500px] space-y-8 px-4 pb-32 pt-8 sm:px-8">
      {error && (
        <p className="rounded-2xl bg-coral-soft px-4 py-3 text-[13px] text-coral">
          Couldn&apos;t load hackathons: {error.message}
        </p>
      )}

      <Hero list={active} now={now} onOpen={(h) => setOpenId(h.id)} />

      <section className="space-y-3" aria-label="All hackathons">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Your hackathons
            {isFetching && <span className="ml-2 text-xs font-normal text-muted">syncing…</span>}
          </h2>
          {showTable && <span className="hidden text-xs text-muted lg:inline">Click any cell to edit · Enter saves · Esc cancels</span>}
        </div>
        <StatusTabs tab={tab} counts={counts} onChange={setTab} />
        <FilterBar q={q} onQ={setQ} category={category} onCategory={setCategory} categories={usedCategories} />

        {rows.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl bg-cream-2 px-6 py-10 text-center">
            <Mascot mood="sleepy" size={90} />
            <p className="mt-2 text-[14px] text-muted">
              {list.length === 0 ? "No hackathons yet — tap “New hackathon” to add one." : "Nothing matches these filters."}
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
          <HackathonCards rows={rows} now={now} actions={actions} onOpen={(h) => setOpenId(h.id)} />
        )}
      </section>

      {/* Floating bottom bar */}
      <nav
        aria-label="Main"
        className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full bg-ink p-1.5 shadow-xl shadow-ink/20"
      >
        <button
          onClick={addHackathon}
          disabled={create.isPending}
          className="flex items-center gap-1.5 rounded-full bg-leaf px-5 py-3 text-[14px] font-medium text-white hover:bg-leaf-dark disabled:opacity-60"
        >
          <PlusIcon size={16} /> New hackathon
        </button>
        {isDesktop && (
          <button
            onClick={() => changeView(view === "table" ? "cards" : "table")}
            aria-label={view === "table" ? "Switch to card view" : "Switch to table view"}
            title={view === "table" ? "Card view" : "Table view"}
            className="rounded-full p-3 text-cream/80 hover:bg-cream/10 hover:text-cream"
          >
            {view === "table" ? <ListIcon /> : <TableIcon />}
          </button>
        )}
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          aria-label="Log out"
          title="Log out"
          className="rounded-full p-3 text-cream/80 hover:bg-cream/10 hover:text-cream"
        >
          <LogoutIcon />
        </button>
      </nav>

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

      {celebrate && <Celebration name={celebrate} onDone={() => setCelebrate(null)} />}

      {toast && (
        <div
          role="status"
          className={`fixed bottom-24 left-1/2 z-[90] flex -translate-x-1/2 animate-rise items-center gap-3 whitespace-nowrap rounded-full px-5 py-2.5 text-[13px] shadow-lg ${
            toast.tone === "error" ? "bg-coral text-white" : "bg-ink text-cream"
          }`}
        >
          {toast.message}
          {toast.undo && (
            <button
              onClick={() => {
                toast.undo!();
                setToast(null);
              }}
              className="font-semibold text-mint underline underline-offset-2"
            >
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
