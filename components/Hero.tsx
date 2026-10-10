"use client";
// Top of the page: greeting, the duck's sticky note, the next 3 launches, and
// a two-week ruler of deadlines.
import { useState } from "react";
import { DAY, msLeft, nextDeadlines, overdueList, timeLeftLabel, urgency } from "@/lib/deadlines";
import { formatDeadline } from "@/lib/format";
import type { Hackathon } from "@/lib/types";
import { Duck, Rocket, StickyNote, type DuckMood } from "./art";
import { IndexCard } from "./HackathonCards";

function loadName() {
  try {
    return localStorage.getItem("ht:name") || "builder";
  } catch {
    return "builder";
  }
}

function greeting(now: Date) {
  const h = now.getHours();
  return h < 5 ? "Burning the midnight oil" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export function Hero({ list, now, onOpen }: { list: Hackathon[]; now: Date; onOpen: (h: Hackathon) => void }) {
  const overdue = overdueList(list, now);
  const next = nextDeadlines(list, now, 3);
  const [name, setName] = useState(loadName);
  const [editingName, setEditingName] = useState(false);

  const saveName = (v: string) => {
    const n = v.trim() || "builder";
    setName(n);
    setEditingName(false);
    try {
      localStorage.setItem("ht:name", n);
    } catch {}
  };

  const inFlight = list.filter((h) => h.status !== "COMPLETED" && (msLeft(h, now) ?? -1) > 0).length;

  // The duck reacts to the most urgent thing on the desk.
  let mood: DuckMood = "happy";
  let note: React.ReactNode;
  const soonest = next[0];
  if (overdue.length) {
    mood = "sweat";
    note = (
      <>
        {overdue[0].name} launches in {timeLeftLabel(overdue[0], now)}. Ship it!
      </>
    );
  } else if (soonest && urgency(soonest, now) === "red") {
    mood = "sweat";
    note = <>{soonest.name} is due in {timeLeftLabel(soonest, now)}. Getting close!</>;
  } else if (soonest) {
    note = <>Next launch: {soonest.name}, {timeLeftLabel(soonest, now)} away. Quack on!</>;
  } else {
    mood = "sleepy";
    note = <>Nothing on the launch pad. Find a new hackathon?</>;
  }

  return (
    <section className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* left: greeting + duck note */}
        <div className="space-y-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="mt-1 font-display text-[34px] font-bold leading-[1.05] tracking-tight sm:text-[44px]">
              {greeting(now)},{" "}
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
                  className="w-44 border-b-4 border-duck bg-transparent outline-none"
                />
              ) : (
                <button
                  onClick={() => setEditingName(true)}
                  title="Click to change your name"
                  className="relative whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
                >
                  <span className="relative z-10">{name}.</span>
                  <span className="absolute inset-x-0 bottom-1 z-0 h-3 -rotate-1 bg-duck/70" aria-hidden />
                </button>
              )}
            </h1>
            <p className="mt-2 font-mono text-xs text-muted">
              {inFlight} in flight · {overdue.length} overdue · {list.filter((h) => h.status === "COMPLETED").length} launched
            </p>
          </div>

          <div className="relative max-w-sm pr-16">
            <StickyNote className="-rotate-2">{note}</StickyNote>
            <Duck mood={mood} size={112} className="absolute -right-2 -top-14 animate-bob" />
          </div>
        </div>

        {/* right: next launches */}
        <div className="space-y-5">
          <div>
            <h2 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Launch schedule · next 3</h2>
            {next.length === 0 ? (
              <p className="card-paper px-4 py-5 text-[13px] text-muted">No upcoming deadlines.</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-3">
                {next.map((h, i) => (
                  <IndexCard key={h.id} h={h} now={now} onOpen={() => onOpen(h)} tilt={[-0.6, 0.4, -0.2][i]} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <LaunchRuler list={list} now={now} />
    </section>
  );
}

/** A ruler of the next two weeks; rockets mark deadline days. */
function LaunchRuler({ list, now }: { list: Hackathon[]; now: Date }) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);
  const days = Array.from({ length: 16 }, (_, i) => new Date(start.getTime() + i * DAY));
  const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const byDay = new Map<string, Hackathon[]>();
  for (const h of list) {
    if (!h.deadline || h.status === "COMPLETED") continue;
    const k = key(new Date(h.deadline));
    byDay.set(k, [...(byDay.get(k) ?? []), h]);
  }
  const todayKey = key(now);

  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Deadlines over the next two weeks">
      <div className="relative flex min-w-[720px] rounded-md border-2 border-navy bg-duck/90">
        {days.map((d, i) => {
          const k = key(d);
          const items = byDay.get(k) ?? [];
          const isToday = k === todayKey;
          const isPast = d < start || (d.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime());
          const u = items.length ? items.map((h) => urgency(h, now)) : [];
          const grey = u.length > 0 && u.every((x) => x === "missed");
          return (
            <div
              key={k}
              title={items.length ? items.map((h) => `${h.name}, due ${formatDeadline(h.deadline)}`).join("\n") : undefined}
              className={`relative flex flex-1 flex-col items-center pb-1.5 pt-9 ${i ? "border-l border-navy/30" : ""} ${isPast ? "opacity-55" : ""}`}
            >
              {/* ruler ticks */}
              <span className="absolute left-1/2 top-0 h-3 w-px bg-navy/60" />
              <span className="absolute left-1/4 top-0 h-1.5 w-px bg-navy/30" />
              <span className="absolute left-3/4 top-0 h-1.5 w-px bg-navy/30" />
              {items.length > 0 && (
                <span className="absolute top-3.5 -rotate-90" aria-label={`${items.length} deadline${items.length > 1 ? "s" : ""}`}>
                  <Rocket width={26} grey={grey} />
                </span>
              )}
              <span className="mt-2 font-mono text-[9px] uppercase tracking-widest text-navy/70">
                {d.toLocaleDateString(undefined, { weekday: "short" })}
              </span>
              <span
                className={`font-mono text-[15px] font-bold ${isToday ? "rounded bg-navy px-1.5 text-duck" : "text-navy"}`}
              >
                {d.getDate()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
