"use client";
// The "mission file" for one hackathon: a clipboard sheet (bottom sheet on
// phones, side panel on desktop). Every field is still click-to-edit.
import { useEffect } from "react";
import { displayStatus, timeLeftLabel, urgency } from "@/lib/deadlines";
import type { Hackathon } from "@/lib/types";
import { Duck, FlipCountdown, LaunchTrack, type DuckMood } from "./art";
import { DateCell, DeadlineCell, LinkCell, ResultCell, StatusCell, TextCell } from "./cells";
import type { RowActions } from "./HackathonGrid";
import { ArchiveIcon, CloseIcon, RestoreIcon, TrashIcon } from "./icons";

export function DetailSheet({
  h,
  now,
  categories,
  actions,
  isNew,
  onClose,
}: {
  h: Hackathon;
  now: Date;
  categories: string[];
  actions: RowActions;
  isNew: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "Escape" && !["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = (patch: Parameters<RowActions["save"]>[1]) => actions.save(h.id, patch);
  const status = displayStatus(h, now);
  const u = urgency(h, now);
  const completed = h.status === "COMPLETED";

  let mood: DuckMood = "happy";
  let say = "Let's build something great.";
  if (completed) {
    mood = "party";
    say = "We launched! 🎉";
  } else if (status === "MISSED") {
    mood = "sleepy";
    say = "This one stayed on the pad.";
  } else if (u === "overdue" || u === "red") {
    mood = "sweat";
    say = `${timeLeftLabel(h, now)} left. Ship it!`;
  } else if (!h.deadline) {
    say = "Give me a launch date!";
  } else if (h.status === "CONSIDERING") {
    say = "Are we doing this one?";
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-navy/30 sm:items-stretch sm:justify-end" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={h.name}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[94vh] w-full animate-rise flex-col overflow-hidden rounded-t-2xl border-2 border-navy bg-paper shadow-2xl sm:max-h-none sm:w-[460px] sm:rounded-none sm:border-y-0 sm:border-r-0"
      >
        {/* clipboard clip */}
        <div className="flex items-center gap-2 border-b-2 border-navy bg-navy px-4 py-2 text-paper">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-duck">Mission file</span>
          <span className="ml-auto font-mono text-[10px] text-paper/50">#{h.id.slice(-6)}</span>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-paper/70 hover:bg-paper/10 hover:text-paper">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-6 pt-4">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 font-display text-[22px] font-bold leading-tight">
              <TextCell value={h.name} onSave={(v) => save({ name: v! })} required autoEdit={isNew} className="whitespace-normal" />
            </div>
            <FlipCountdown h={h} now={now} size="lg" />
          </div>

          <div className="card-paper relative px-4 pb-3 pt-4">
            <div className="absolute -top-10 left-3 flex flex-row-reverse items-end gap-1">
              <span className="mb-6 rounded-md bg-card px-2 py-1 font-hand text-[18px] leading-none shadow-sm">{say}</span>
              <Duck mood={mood} size={70} className="animate-bob" />
            </div>
            <LaunchTrack h={h} now={now} size="lg" />
          </div>

          <dl className="card-paper divide-y divide-rule px-2">
            <Field label="Status">
              <StatusCell status={h.status} display={status} onSave={(s) => save({ status: s })} />
            </Field>
            <Field label="Deadline">
              <DeadlineCell value={h.deadline} onSave={(v) => save({ deadline: v })} />
            </Field>
            <Field label="Starts">
              <DateCell value={h.startDate} onSave={(v) => save({ startDate: v })} />
            </Field>
            <Field label="Category">
              <TextCell value={h.category} onSave={(v) => save({ category: v })} suggestions={categories} placeholder="e.g. AI" />
            </Field>
            <Field label="Organizer">
              <TextCell value={h.organizer} onSave={(v) => save({ organizer: v })} placeholder="Who's running it?" />
            </Field>
            <Field label="Prize">
              <TextCell value={h.prize} onSave={(v) => save({ prize: v })} placeholder="What's at stake?" />
            </Field>
            <Field label="Link">
              <LinkCell value={h.link} onSave={(v) => save({ link: v })} />
            </Field>
            <Field label="Result">
              <ResultCell value={h.result} detail={h.resultDetail} dim={!completed} onSave={save} />
            </Field>
          </dl>

          <div className="relative bg-hl-yellow px-3 pb-3 pt-2" style={{ boxShadow: "0 8px 16px -12px rgba(28,37,65,.5)" }}>
            <p className="px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-navy/60">Notes</p>
            <div className="font-hand text-[19px] leading-snug">
              <TextCell
                value={h.notes}
                onSave={(v) => save({ notes: v })}
                multiline
                placeholder="Ideas, teammates, progress…"
                className="whitespace-pre-wrap"
              />
            </div>
          </div>
        </div>

        <footer className="space-y-3 border-t-2 border-navy bg-paper px-5 pb-5 pt-4">
          {completed ? (
            <button onClick={() => save({ status: "IN_PROGRESS" })} className="btn-launch w-full bg-paper-2 py-3">
              ✓ Launched — reopen
            </button>
          ) : (
            <button onClick={() => save({ status: "COMPLETED" })} className="btn-launch w-full py-3 text-[15px]">
              🚀 Launch it — mark completed
            </button>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => actions.toggleArchive(h)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-navy/20 py-2.5 font-medium hover:border-navy/50"
            >
              {h.archivedAt ? <RestoreIcon size={16} /> : <ArchiveIcon size={16} />}
              {h.archivedAt ? "Restore" : "Archive"}
            </button>
            <button
              onClick={() => actions.remove(h)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-rocket/30 py-2.5 font-medium text-rocket hover:border-rocket hover:bg-rocket/5"
            >
              <TrashIcon size={16} />
              Delete
            </button>
          </div>
        </footer>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <dt className="w-24 shrink-0 px-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">{label}</dt>
      <dd className="min-w-0 flex-1">{children}</dd>
    </div>
  );
}
