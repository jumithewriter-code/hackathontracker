"use client";
// Desktop spreadsheet view, drawn as a sheet of notebook paper: ruled blue lines,
// a red margin, and highlighter tints for upcoming deadlines. Every cell is
// inline-editable.
import type { HackathonPatch } from "@/lib/client";
import { displayStatus, urgency } from "@/lib/deadlines";
import type { Sort, SortKey } from "@/lib/filters";
import type { Hackathon } from "@/lib/types";
import { FlipCountdown, LaunchTrack } from "./art";
import { DateCell, DeadlineCell, LinkCell, ResultCell, StatusCell, TextCell } from "./cells";
import { ArchiveIcon, OpenIcon, RestoreIcon, TrashIcon } from "./icons";
import { ROW_TONE } from "./tones";

export interface RowActions {
  save: (id: string, patch: HackathonPatch) => void;
  toggleArchive: (h: Hackathon) => void;
  remove: (h: Hackathon) => void;
}

const COLUMNS: { key: SortKey | null; label: string; width: string }[] = [
  { key: "name", label: "Name", width: "w-60" },
  { key: "organizer", label: "Organizer", width: "w-36" },
  { key: "category", label: "Category", width: "w-28" },
  { key: "status", label: "Status", width: "w-48" },
  { key: "startDate", label: "Start", width: "w-32" },
  { key: "deadline", label: "Deadline", width: "w-52" },
  { key: "daysLeft", label: "Left", width: "w-28" },
  { key: null, label: "Launch track", width: "w-44" },
  { key: "prize", label: "Prize", width: "w-32" },
  { key: null, label: "Link", width: "w-40" },
  { key: null, label: "Notes", width: "w-64" },
  { key: "result", label: "Result", width: "w-56" },
];

export function HackathonGrid({
  rows,
  now,
  sort,
  onSort,
  categories,
  actions,
  onOpen,
}: {
  rows: Hackathon[];
  now: Date;
  sort: Sort;
  onSort: (key: SortKey) => void;
  categories: string[];
  actions: RowActions;
  onOpen: (h: Hackathon) => void;
}) {
  const iconBtn = "rounded-md p-1.5 text-navy/50 hover:bg-navy/5 hover:text-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-navy";
  return (
    <div className="card-paper overflow-x-auto rounded-t-none">
      <table className="w-max min-w-full table-fixed border-collapse text-[13px]">
        <thead className="text-left font-mono text-[10px] uppercase tracking-widest text-muted">
          <tr className="border-b-2 border-rule">
            <th className="sticky left-0 z-10 w-10 border-r-2 border-margin bg-card" aria-label="Row number" />
            {COLUMNS.map((c, i) => (
              <th
                key={c.label}
                scope="col"
                aria-sort={c.key && sort.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                className={`${c.width} px-0 py-0 font-semibold ${i === 0 ? "sticky left-10 z-10 bg-card" : ""}`}
              >
                {c.key ? (
                  <button
                    type="button"
                    onClick={() => onSort(c.key!)}
                    className="flex w-full items-center gap-1 px-3 py-3 uppercase hover:text-navy"
                  >
                    {c.label}
                    <span className="text-[9px] text-rocket">{sort.key === c.key ? (sort.dir === "asc" ? "▲" : "▼") : ""}</span>
                  </button>
                ) : (
                  <span className="block px-3 py-3">{c.label}</span>
                )}
              </th>
            ))}
            <th className="w-[112px] px-3 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((h, idx) => {
            const u = urgency(h, now);
            const tone = ROW_TONE[u];
            const save = (patch: HackathonPatch) => actions.save(h.id, patch);
            const td = "border-b border-rule px-1 py-1 align-middle";
            return (
              <tr key={h.id} className={tone}>
                <td className={`${td} sticky left-0 z-[1] border-r-2 border-r-margin text-center font-mono text-[11px] text-muted ${tone}`}>
                  {u === "overdue" ? <span className="font-bold text-rocket">T-</span> : idx + 1}
                </td>
                <td className={`${td} sticky left-10 z-[1] font-display text-[14px] font-semibold ${tone}`}>
                  <TextCell value={h.name} onSave={(v) => save({ name: v! })} required />
                </td>
                <td className={td}>
                  <TextCell value={h.organizer} onSave={(v) => save({ organizer: v })} />
                </td>
                <td className={td}>
                  <TextCell value={h.category} onSave={(v) => save({ category: v })} suggestions={categories} />
                </td>
                <td className={td}>
                  <StatusCell status={h.status} display={displayStatus(h, now)} onSave={(s) => save({ status: s })} />
                </td>
                <td className={td}>
                  <DateCell value={h.startDate} onSave={(v) => save({ startDate: v })} />
                </td>
                <td className={td}>
                  <DeadlineCell value={h.deadline} onSave={(v) => save({ deadline: v })} />
                </td>
                <td className={`${td} py-1.5 text-center`}>
                  <FlipCountdown h={h} now={now} />
                </td>
                <td className={`${td} px-3`}>
                  <LaunchTrack h={h} now={now} />
                </td>
                <td className={td}>
                  <TextCell value={h.prize} onSave={(v) => save({ prize: v })} />
                </td>
                <td className={td}>
                  <LinkCell value={h.link} onSave={(v) => save({ link: v })} />
                </td>
                <td className={td}>
                  <TextCell value={h.notes} onSave={(v) => save({ notes: v })} multiline />
                </td>
                <td className={td}>
                  <ResultCell value={h.result} detail={h.resultDetail} dim={h.status !== "COMPLETED"} onSave={save} />
                </td>
                <td className={td}>
                  <div className="flex justify-end gap-0.5">
                    <button type="button" onClick={() => onOpen(h)} aria-label={`Open ${h.name}`} title="Open mission file" className={iconBtn}>
                      <OpenIcon size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => actions.toggleArchive(h)}
                      aria-label={h.archivedAt ? `Restore ${h.name}` : `Archive ${h.name}`}
                      title={h.archivedAt ? "Restore" : "Archive"}
                      className={iconBtn}
                    >
                      {h.archivedAt ? <RestoreIcon size={17} /> : <ArchiveIcon size={17} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => actions.remove(h)}
                      aria-label={`Delete ${h.name}`}
                      title="Delete permanently"
                      className={`${iconBtn} hover:bg-rocket/10 hover:text-rocket`}
                    >
                      <TrashIcon size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
