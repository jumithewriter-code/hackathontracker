"use client";
// Index-card view (always used on phones). Each card opens the mission file;
// Archive and Delete are visible buttons on every card.
import { displayStatus } from "@/lib/deadlines";
import { formatDeadline } from "@/lib/format";
import type { Hackathon } from "@/lib/types";
import { FlipCountdown, LaunchTrack, Tape } from "./art";
import { StatusBadge } from "./cells";
import type { RowActions } from "./HackathonGrid";
import { ArchiveIcon, CategoryIcon, OpenIcon, RestoreIcon, TrashIcon } from "./icons";
import { ROW_TONE, TAPE } from "./tones";
import { urgency } from "@/lib/deadlines";

export function IndexCard({
  h,
  now,
  onOpen,
  actions,
  tilt = 0,
}: {
  h: Hackathon;
  now: Date;
  onOpen: () => void;
  actions?: RowActions;
  /** Tiny rotation for a hand-placed look (degrees). */
  tilt?: number;
}) {
  const s = displayStatus(h, now);
  const u = urgency(h, now);
  return (
    <article
      className={`card-paper relative animate-rise ${u === "missed" ? "opacity-80" : ""}`}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <Tape className="-top-2.5 left-1/2 -translate-x-1/2 rotate-[-3deg]" color={TAPE[s]} />
      {/* highlighter stripe on the left shows urgency at a glance */}
      <span className={`absolute inset-y-0 left-0 w-1.5 rounded-l-md ${u === "none" ? "bg-transparent" : ROW_TONE[u].split(" ")[0]}`} />

      <button
        type="button"
        onClick={onOpen}
        className="block w-full rounded-md px-4 pb-3 pt-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border-2 border-navy/80 bg-paper text-navy">
            <CategoryIcon category={h.category} size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className={`truncate font-display text-[16px] font-bold leading-tight ${s === "MISSED" ? "text-muted line-through" : ""}`}>
              {h.name}
            </h3>
            <p className="truncate text-xs text-muted">{[h.organizer, h.category].filter(Boolean).join(" · ") || "—"}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <StatusBadge status={s} />
              {h.deadline && <span className="font-mono text-[11px] text-muted">{formatDeadline(h.deadline)}</span>}
            </div>
          </div>
          <FlipCountdown h={h} now={now} />
        </div>
        <div className="mt-3 border-t border-rule pt-2">
          <LaunchTrack h={h} now={now} />
        </div>
      </button>

      {actions && (
        <div className="flex items-center justify-end gap-1 border-t border-dashed border-navy/15 px-2 py-1.5">
          <button type="button" onClick={onOpen} className="mr-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-navy/70 hover:bg-navy/5">
            <OpenIcon size={14} /> Open
          </button>
          <button
            type="button"
            onClick={() => actions.toggleArchive(h)}
            aria-label={h.archivedAt ? `Restore ${h.name}` : `Archive ${h.name}`}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-navy/70 hover:bg-navy/5"
          >
            {h.archivedAt ? <RestoreIcon size={14} /> : <ArchiveIcon size={14} />}
            {h.archivedAt ? "Restore" : "Archive"}
          </button>
          <button
            type="button"
            onClick={() => actions.remove(h)}
            aria-label={`Delete ${h.name}`}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-rocket hover:bg-rocket/10"
          >
            <TrashIcon size={14} /> Delete
          </button>
        </div>
      )}
    </article>
  );
}

export function HackathonCards({
  rows,
  now,
  actions,
  onOpen,
}: {
  rows: Hackathon[];
  now: Date;
  actions: RowActions;
  onOpen: (h: Hackathon) => void;
}) {
  const tilts = [-0.4, 0.3, -0.2, 0.5, 0];
  return (
    <ul className="grid gap-5 pt-2 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((h, i) => (
        <li key={h.id}>
          <IndexCard h={h} now={now} onOpen={() => onOpen(h)} actions={actions} tilt={tilts[i % tilts.length]} />
        </li>
      ))}
    </ul>
  );
}
