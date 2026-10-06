"use client";
// Top of the page: greeting, week strip with deadline markers, mascot tip, and the
// Overdue + Next 3 deadlines lists.
import { useState } from "react";
import { msLeft, nextDeadlines, overdueList, timeLeftLabel, urgency, DAY } from "@/lib/deadlines";
import { formatDeadline } from "@/lib/format";
import type { Hackathon } from "@/lib/types";
import { HackathonRow } from "./HackathonCards";
import { Bubble, Mascot, type MascotMood } from "./Mascot";

const WEEKDAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

function loadName() {
  try {
    return localStorage.getItem("ht:name") || "hacker";
  } catch {
    return "hacker";
  }
}

export function Hero({ list, now, onOpen }: { list: Hackathon[]; now: Date; onOpen: (h: Hackathon) => void }) {
  const overdue = overdueList(list, now);
  const next = nextDeadlines(list, now, 3);
  const [name, setName] = useState(loadName);
  const [editingName, setEditingName] = useState(false);

  const saveName = (v: string) => {
    const n = v.trim() || "hacker";
    setName(n);
    setEditingName(false);
    try {
      localStorage.setItem("ht:name", n);
    } catch {}
  };

  // Mascot reacts to the most urgent thing on the board.
  const soonest = next[0];
  let mood: MascotMood = "happy";
  let tip: React.ReactNode;
  if (overdue.length) {
    mood = "worried";
    tip = (
      <>
        {overdue[0].name} is due in {timeLeftLabel(overdue[0], now)}. Ship it!
      </>
    );
  } else if (soonest) {
    const u = urgency(soonest, now);
    mood = u === "red" ? "worried" : "happy";
    tip =
      u === "red" ? (
        <>Heads up — {soonest.name} is due in {timeLeftLabel(soonest, now)}!</>
      ) : (
        <>Next up: {soonest.name} in {timeLeftLabel(soonest, now)}. You got this!</>
      );
  } else {
    mood = "sleepy";
    tip = <>No deadlines coming up. Time to find your next hackathon!</>;
  }

  return (
    <section className="space-y-5">
      <h1 className="text-[34px] leading-tight tracking-tight sm:text-[40px]">
        Hey,{" "}
        {editingName ? (
          <input
            autoFocus
            defaultValue={name}
            onBlur={(e) => saveName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveName((e.target as HTMLInputElement).value);
              if (e.key === "Escape") setEditingName(false);
            }}
            aria-label="Your name"
            className="w-48 rounded-xl border border-leaf bg-white px-2 font-bold outline-none"
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            title="Click to change your name"
            className="rounded-xl font-bold hover:bg-ink/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
          >
            {name}!
          </button>
        )}
      </h1>

      <WeekStrip list={list} now={now} />

      <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex items-end gap-2">
          <Mascot
            mood={mood}
            color={mood === "worried" ? "var(--color-coral)" : "var(--color-leaf)"}
            size={118}
            className="shrink-0 animate-bob"
          />
          <Bubble className="mb-16 max-w-[260px]">{tip}</Bubble>
        </div>

        <div className="space-y-2">
          {overdue.length > 0 && (
            <div className="space-y-2" aria-label="Overdue — due within 24 hours">
              <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-coral">
                <span className="inline-block size-1.5 animate-pulse rounded-full bg-coral" /> Overdue — due within 24
                hours
              </h2>
              {overdue.map((h) => (
                <HackathonRow key={h.id} h={h} now={now} onOpen={() => onOpen(h)} />
              ))}
            </div>
          )}
          <h2 className="pt-1 text-xs font-semibold uppercase tracking-wider text-muted">Next deadlines</h2>
          {next.length === 0 ? (
            <p className="rounded-2xl bg-cream-2 px-4 py-4 text-[13px] text-muted">Nothing on the horizon.</p>
          ) : (
            next.map((h) => <HackathonRow key={h.id} h={h} now={now} onOpen={() => onOpen(h)} />)
          )}
        </div>
      </div>
    </section>
  );
}

/** Two weeks of dates. Days with a deadline get a filled circle and a coloured dot. */
function WeekStrip({ list, now }: { list: Hackathon[]; now: Date }) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3);
  const days = Array.from({ length: 17 }, (_, i) => new Date(start.getTime() + i * DAY));
  const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  const byDay = new Map<string, Hackathon[]>();
  for (const h of list) {
    if (!h.deadline || h.archivedAt || h.status === "COMPLETED") continue;
    const k = key(new Date(h.deadline));
    byDay.set(k, [...(byDay.get(k) ?? []), h]);
  }
  const todayKey = key(now);

  return (
    <div className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Deadlines this fortnight">
      {days.map((d) => {
        const k = key(d);
        const items = byDay.get(k) ?? [];
        const isToday = k === todayKey;
        const worst = items.reduce<"coral" | "sun" | "leaf" | null>((acc, h) => {
          const ms = msLeft(h, now) ?? 0;
          if (ms < 3 * DAY) return "coral";
          if (ms < 7 * DAY && acc !== "coral") return "sun";
          return acc ?? "leaf";
        }, null);
        const title = items.length
          ? items.map((h) => `${h.name} — ${formatDeadline(h.deadline)}`).join("\n")
          : undefined;
        return (
          <div
            key={k}
            title={title}
            className={`flex w-11 shrink-0 flex-col items-center gap-1.5 rounded-full py-2 ${isToday ? "bg-ink text-cream" : ""}`}
          >
            <span className={`text-[11px] font-medium ${isToday ? "text-cream" : "text-muted"}`}>
              {WEEKDAYS[d.getDay()]}
            </span>
            <span
              className={`flex size-8 items-center justify-center rounded-full text-[13px] font-semibold ${
                isToday ? "" : items.length ? "bg-cream-3" : ""
              }`}
            >
              {d.getDate()}
            </span>
            <span
              className={`size-1.5 rounded-full ${
                worst === "coral" ? "bg-coral" : worst === "sun" ? "bg-sun" : worst === "leaf" ? "bg-leaf" : "bg-transparent"
              }`}
              aria-label={items.length ? `${items.length} deadline${items.length > 1 ? "s" : ""}` : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}
