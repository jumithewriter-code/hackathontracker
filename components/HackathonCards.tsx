"use client";
// Card/list view (always used on phones). Each row opens the detail sheet;
// Archive and Delete are visible buttons on every row.
import { DAY, HOUR, displayStatus, msLeft, urgency } from "@/lib/deadlines";
import { formatDeadline } from "@/lib/format";
import { STATUS_LABELS, type Hackathon } from "@/lib/types";
import type { RowActions } from "./HackathonGrid";
import { ArchiveIcon, CategoryIcon, RestoreIcon, TimerIcon, TrashIcon } from "./icons";
import { CARD_TONE, COUNT_TONE, STATUS_TONE } from "./tones";

/** "2 / days", "17 / hrs", "Missed", "Done", "—" */
export function Countdown({ h, now }: { h: Hackathon; now: Date }) {
  const u = urgency(h, now);
  const ms = msLeft(h, now);
  let big: string;
  let small: string | null = null;
  if (h.status === "COMPLETED") big = "Done";
  else if (ms === null) big = "—";
  else if (ms <= 0) big = "Missed";
  else if (ms < DAY) {
    big = String(Math.max(1, Math.floor(ms / HOUR)));
    small = big === "1" ? "hr" : "hrs";
  } else {
    big = String(Math.floor(ms / DAY));
    small = big === "1" ? "day" : "days";
  }
  return (
    <div className={`flex flex-col items-center justify-center leading-none ${COUNT_TONE[u]}`}>
      {small ? (
        <>
          <TimerIcon size={16} className="mb-1 opacity-70" />
          <span className="text-lg font-semibold tabular-nums">{big}</span>
          <span className="mt-0.5 text-[11px] text-muted">{small}</span>
        </>
      ) : (
        <span className="text-[13px] font-medium">{big}</span>
      )}
    </div>
  );
}

export function StatusLine({ h, now }: { h: Hackathon; now: Date }) {
  const s = displayStatus(h, now);
  const tone = STATUS_TONE[s];
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${tone.className}`}>
      <span aria-hidden>{tone.symbol}</span>
      {STATUS_LABELS[s]}
    </span>
  );
}

/** One habit-style row: icon · name + status · countdown. */
export function HackathonRow({
  h,
  now,
  onOpen,
  actions,
}: {
  h: Hackathon;
  now: Date;
  onOpen: () => void;
  actions?: RowActions;
}) {
  const u = urgency(h, now);
  const s = displayStatus(h, now);
  const done = s === "COMPLETED" || s === "MISSED";
  return (
    <div className={`group flex items-stretch overflow-hidden rounded-2xl ${CARD_TONE[u]} animate-rise`}>
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-leaf"
      >
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
            u === "overdue" ? "bg-coral text-white" : "bg-cream-3 text-ink/70"
          }`}
        >
          <CategoryIcon category={h.category} />
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-[15px] font-medium ${done ? "text-muted" : ""} ${s === "MISSED" ? "line-through" : ""}`}>
            {h.name}
          </span>
          <span className="flex min-w-0 items-center gap-2">
            <StatusLine h={h} now={now} />
            {h.deadline && <span className="hidden truncate text-xs text-muted sm:inline">· {formatDeadline(h.deadline)}</span>}
          </span>
        </span>
      </button>

      {actions && (
        <div className="flex items-center gap-0.5 pr-1">
          <button
            type="button"
            onClick={() => actions.toggleArchive(h)}
            aria-label={h.archivedAt ? `Restore ${h.name}` : `Archive ${h.name}`}
            title={h.archivedAt ? "Restore" : "Archive"}
            className="rounded-lg p-2 text-muted hover:bg-ink/5 hover:text-ink"
          >
            {h.archivedAt ? <RestoreIcon /> : <ArchiveIcon />}
          </button>
          <button
            type="button"
            onClick={() => actions.remove(h)}
            aria-label={`Delete ${h.name}`}
            title="Delete permanently"
            className="rounded-lg p-2 text-muted hover:bg-coral/10 hover:text-coral"
          >
            <TrashIcon />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onOpen}
        tabIndex={-1}
        aria-hidden
        className="flex w-[72px] shrink-0 items-center justify-center border-l-2 border-cream"
      >
        <Countdown h={h} now={now} />
      </button>
    </div>
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
  return (
    <ul className="space-y-2">
      {rows.map((h) => (
        <li key={h.id}>
          <HackathonRow h={h} now={now} onOpen={() => onOpen(h)} actions={actions} />
        </li>
      ))}
    </ul>
  );
}
