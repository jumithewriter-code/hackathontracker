"use client";
// Inline-editable cell editors. Each shows a value; click (or Enter when
// focused) to edit. Enter / clicking away saves, Esc cancels.
import { useEffect, useRef, useState } from "react";
import { formatDate, formatDeadline, hostname, joinLocal, splitLocal } from "@/lib/format";
import { STAMP } from "./tones";
import {
  RESULT_LABELS,
  RESULTS,
  STATUS_LABELS,
  STATUSES,
  type DisplayStatus,
  type Result,
  type Status,
} from "@/lib/types";

const cellButton =
  "block w-full min-h-8 cursor-text truncate rounded-md px-2 py-1.5 text-left hover:bg-navy/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy";
const inputBase =
  "w-full rounded-md border border-navy bg-white px-2 py-1.5 text-[13px] outline-none ring-4 ring-duck/50";

function Placeholder({ text = "—" }: { text?: string }) {
  return <span className="text-muted/60">{text}</span>;
}

// ─── Text ────────────────────────────────────────────────────────────────────

export function TextCell({
  value,
  onSave,
  placeholder,
  required,
  multiline,
  suggestions,
  autoEdit,
  className = "",
  display,
}: {
  value: string | null;
  onSave: (v: string | null) => void;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  /** Options for a <datalist> (e.g. existing categories). */
  suggestions?: string[];
  /** Start in edit mode (used for a freshly added row). */
  autoEdit?: boolean;
  className?: string;
  display?: React.ReactNode;
}) {
  const [editing, setEditing] = useState(!!autoEdit);
  const [draft, setDraft] = useState(value ?? "");
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const listId = useRef(`dl-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    if (editing) {
      ref.current?.focus();
      ref.current?.select();
    }
  }, [editing]);

  const start = () => {
    setDraft(value ?? "");
    setEditing(true);
  };
  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (required && !next) return; // keep old value
    if (next !== (value ?? "")) onSave(next || null);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setEditing(false);
    if (e.key === "Enter" && (!multiline || e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      commit();
    }
  };

  if (editing) {
    return multiline ? (
      <textarea
        ref={ref}
        value={draft}
        rows={4}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        placeholder="Ctrl+Enter to save"
        className={`${inputBase} min-w-56 resize-y`}
      />
    ) : (
      <>
        <input
          ref={ref}
          value={draft}
          list={suggestions ? listId : undefined}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={inputBase}
        />
        {suggestions && (
          <datalist id={listId}>
            {suggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        )}
      </>
    );
  }

  return (
    <button type="button" onClick={start} className={`${cellButton} ${className}`} title={value ?? undefined}>
      {display ?? (value || <Placeholder text={placeholder ? placeholder : "—"} />)}
    </button>
  );
}

// ─── Link ────────────────────────────────────────────────────────────────────

export function LinkCell({ value, onSave }: { value: string | null; onSave: (v: string | null) => void }) {
  return (
    <div className="flex items-center gap-1">
      <div className="min-w-0 flex-1">
        <TextCell
          value={value}
          onSave={onSave}
          placeholder="Add link"
          display={value ? <span className="text-teal underline decoration-teal/30 underline-offset-2">{hostname(value)}</span> : undefined}
        />
      </div>
      {value && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-md p-1 text-teal hover:bg-teal/10"
          aria-label="Open link in new tab"
        >
          ↗
        </a>
      )}
    </div>
  );
}

// ─── Status ──────────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: DisplayStatus }) {
  return (
    <span
      className={`inline-block -rotate-2 whitespace-nowrap rounded-[4px] border-2 px-1.5 py-px font-mono text-[10px] font-bold uppercase tracking-wider ${STAMP[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

/**
 * Shows the display status (which may be the automatic Overdue/Missed), with a
 * native dropdown on top so the user can still change their own status.
 */
export function StatusCell({
  status,
  display,
  onSave,
}: {
  status: Status;
  display: DisplayStatus;
  onSave: (s: Status) => void;
}) {
  const auto = display !== status;
  return (
    <label className="relative flex min-h-8 cursor-pointer items-center gap-1 rounded-md px-2 py-1 hover:bg-navy/5 focus-within:ring-2 focus-within:ring-navy">
      <StatusBadge status={display} />
      {auto && <span className="truncate text-xs text-muted">({STATUS_LABELS[status]})</span>}
      <span className="ml-auto text-[10px] text-muted">▾</span>
      <select
        aria-label="Status"
        value={status}
        onChange={(e) => onSave(e.target.value as Status)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </label>
  );
}

// ─── Result ──────────────────────────────────────────────────────────────────

export function ResultCell({
  value,
  detail,
  dim,
  onSave,
}: {
  value: Result | null;
  detail: string | null;
  dim: boolean;
  onSave: (patch: { result?: Result | null; resultDetail?: string | null }) => void;
}) {
  return (
    <div className={`flex items-center gap-1 ${dim ? "opacity-40 focus-within:opacity-100 hover:opacity-100" : ""}`}>
      <select
        aria-label="Result"
        value={value ?? ""}
        onChange={(e) => onSave({ result: (e.target.value || null) as Result | null })}
        className="min-h-8 shrink-0 cursor-pointer rounded-md bg-transparent px-1 py-1 hover:bg-navy/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
      >
        <option value="">—</option>
        {RESULTS.map((r) => (
          <option key={r} value={r}>
            {RESULT_LABELS[r]}
          </option>
        ))}
      </select>
      <div className="min-w-0 flex-1">
        <TextCell value={detail} onSave={(v) => onSave({ resultDetail: v })} placeholder="details" />
      </div>
    </div>
  );
}

// ─── Dates ───────────────────────────────────────────────────────────────────

export function DateCell({ value, onSave }: { value: string | null; onSave: (v: string | null) => void }) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <input
        type="date"
        autoFocus
        defaultValue={value ?? ""}
        onBlur={(e) => {
          setEditing(false);
          const v = e.target.value || null;
          if (v !== value) onSave(v);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setEditing(false);
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className={inputBase}
      />
    );
  }
  return (
    <button type="button" onClick={() => setEditing(true)} className={cellButton}>
      {value ? formatDate(value) : <Placeholder />}
    </button>
  );
}

/** Date + optional time. Leaving the time empty means 11:59 PM local. */
export function DeadlineCell({ value, onSave }: { value: string | null; onSave: (v: string | null) => void }) {
  const [editing, setEditing] = useState(false);
  const initial = splitLocal(value);
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const boxRef = useRef<HTMLDivElement>(null);

  const start = () => {
    const s = splitLocal(value);
    setDate(s.date);
    setTime(s.time);
    setEditing(true);
  };
  const commit = (next: string | null) => {
    setEditing(false);
    if (next !== value) onSave(next);
  };

  if (editing) {
    return (
      <div
        ref={boxRef}
        className="flex items-center gap-1"
        onBlur={(e) => {
          // Save when focus leaves the whole editor, not when moving between its inputs.
          if (!boxRef.current?.contains(e.relatedTarget as Node)) commit(joinLocal(date, time));
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setEditing(false);
          if (e.key === "Enter") commit(joinLocal(date, time));
        }}
      >
        <input type="date" autoFocus value={date} onChange={(e) => setDate(e.target.value)} className={`${inputBase} w-36`} />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className={`${inputBase} w-28`}
          title="Optional. Leave blank for 11:59 PM"
        />
        {value && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => commit(null)}
            className="rounded-md px-1.5 py-1 text-xs text-muted hover:bg-navy/5"
          >
            Clear
          </button>
        )}
      </div>
    );
  }
  return (
    <button type="button" onClick={start} className={cellButton}>
      {value ? formatDeadline(value) : <Placeholder text="Set deadline" />}
    </button>
  );
}
