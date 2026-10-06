"use client";
// Full details for one hackathon (bottom sheet on phones, side panel on desktop).
// Every field is still click-to-edit.
import { useEffect } from "react";
import { displayStatus, timeLeftLabel, urgency } from "@/lib/deadlines";
import type { Hackathon } from "@/lib/types";
import { DateCell, DeadlineCell, LinkCell, ResultCell, StatusCell, TextCell } from "./cells";
import type { RowActions } from "./HackathonGrid";
import {
  ArchiveIcon,
  BellIcon,
  CalendarIcon,
  CloseIcon,
  FlagIcon,
  LinkIcon,
  NoteIcon,
  RestoreIcon,
  TagIcon,
  TrashIcon,
  TrophyIcon,
  UserIcon,
} from "./icons";
import { Bubble, Mascot, type MascotMood } from "./Mascot";

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

  let mood: MascotMood = "happy";
  let say = "Let's build something great!";
  if (completed) {
    mood = "cheer";
    say = "Good job!";
  } else if (status === "MISSED") {
    mood = "sleepy";
    say = "Missed this one. Next time!";
  } else if (u === "overdue" || u === "red") {
    mood = "worried";
    say = `${timeLeftLabel(h, now)} left — ship it!`;
  } else if (!h.deadline) {
    say = "Set a deadline so I can remind you!";
  } else if (h.status === "CONSIDERING") {
    say = "Ooh, are we doing this one?";
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-ink/25 sm:items-stretch sm:justify-end" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={h.name}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full animate-rise flex-col overflow-hidden rounded-t-[32px] bg-cream shadow-2xl sm:max-h-none sm:w-[440px] sm:rounded-l-[32px] sm:rounded-tr-none"
      >
        <header className="flex items-center gap-2 px-5 pt-5">
          <div className="min-w-0 flex-1 text-center text-[17px] font-semibold">
            <TextCell value={h.name} onSave={(v) => save({ name: v! })} required autoEdit={isNew} className="text-center" />
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-2 text-muted hover:bg-ink/5 hover:text-ink">
            <CloseIcon />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-5">
          <div className="relative flex items-end justify-center gap-1 pt-2">
            <Mascot
              shape={completed ? "triangle" : "pentagon"}
              mood={mood}
              color={mood === "worried" ? "var(--color-coral)" : mood === "sleepy" ? "var(--color-muted)" : "var(--color-leaf)"}
              size={110}
              className="animate-bob"
            />
            <Bubble className="mb-20 max-w-[180px] text-[14px]">{say}</Bubble>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-cream-3 py-1 pl-4 pr-1">
            <BellIcon size={16} className="shrink-0" />
            <div className="min-w-0 flex-1 font-medium">
              <DeadlineCell value={h.deadline} onSave={(v) => save({ deadline: v })} />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-[15px] font-semibold">Details</h3>
            <Row icon={<FlagIcon size={16} />} label="Status">
              <StatusCell status={h.status} display={status} onSave={(s) => save({ status: s })} />
            </Row>
            <Row icon={<TagIcon size={16} />} label="Category">
              <TextCell value={h.category} onSave={(v) => save({ category: v })} suggestions={categories} placeholder="e.g. AI" />
            </Row>
            <Row icon={<UserIcon size={16} />} label="Organizer">
              <TextCell value={h.organizer} onSave={(v) => save({ organizer: v })} placeholder="Who's running it?" />
            </Row>
            <Row icon={<CalendarIcon size={16} />} label="Starts">
              <DateCell value={h.startDate} onSave={(v) => save({ startDate: v })} />
            </Row>
            <Row icon={<TrophyIcon size={16} />} label="Prize">
              <TextCell value={h.prize} onSave={(v) => save({ prize: v })} placeholder="What's at stake?" />
            </Row>
            <Row icon={<LinkIcon size={16} />} label="Link">
              <LinkCell value={h.link} onSave={(v) => save({ link: v })} />
            </Row>
            <Row icon={<NoteIcon size={16} />} label="Notes" top>
              <TextCell
                value={h.notes}
                onSave={(v) => save({ notes: v })}
                multiline
                placeholder="Ideas, teammates, progress…"
                className="whitespace-pre-wrap"
              />
            </Row>
            <Row icon={<TrophyIcon size={16} />} label="Result">
              <ResultCell value={h.result} detail={h.resultDetail} dim={!completed} onSave={save} />
            </Row>
          </div>
        </div>

        <footer className="space-y-2 border-t border-line/60 bg-cream px-5 pb-5 pt-3">
          {completed ? (
            <button
              onClick={() => save({ status: "IN_PROGRESS" })}
              className="w-full rounded-full bg-cream-3 py-3.5 text-[15px] font-medium hover:bg-line"
            >
              ✓ Completed — reopen
            </button>
          ) : (
            <button
              onClick={() => save({ status: "COMPLETED" })}
              className="w-full rounded-full bg-leaf py-3.5 text-[15px] font-medium text-white hover:bg-leaf-dark"
            >
              Mark as completed
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => actions.toggleArchive(h)}
              className="flex items-center justify-center gap-1.5 rounded-full bg-cream-2 py-2.5 font-medium hover:bg-cream-3"
            >
              {h.archivedAt ? <RestoreIcon size={16} /> : <ArchiveIcon size={16} />}
              {h.archivedAt ? "Restore" : "Archive"}
            </button>
            <button
              onClick={() => actions.remove(h)}
              className="flex items-center justify-center gap-1.5 rounded-full bg-coral/10 py-2.5 font-medium text-coral hover:bg-coral/20"
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

function Row({ icon, label, top, children }: { icon: React.ReactNode; label: string; top?: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex gap-2 rounded-2xl bg-cream-2 py-1.5 pl-3 pr-1.5 ${top ? "items-start" : "items-center"}`}>
      <span className={`flex w-24 shrink-0 items-center gap-2 text-[13px] text-muted ${top ? "pt-2" : ""}`}>
        {icon}
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
