// Pure deadline logic — no React, no database — so it's easy to unit test.
import type { DisplayStatus, Hackathon } from "./types";

export const HOUR = 60 * 60 * 1000;
export const DAY = 24 * HOUR;

/** Thresholds (time remaining before the deadline). */
export const OVERDUE_WITHIN = DAY; // < 24h left → "Overdue"
export const RED_WITHIN = 3 * DAY; // < 3 days → red
export const YELLOW_WITHIN = 7 * DAY; // < 7 days → yellow

type DeadlineFields = Pick<Hackathon, "status" | "deadline">;

/** Milliseconds until the deadline (negative once passed), or null if there's no deadline. */
export function msLeft(h: Pick<Hackathon, "deadline">, now: Date): number | null {
  if (!h.deadline) return null;
  return new Date(h.deadline).getTime() - now.getTime();
}

/**
 * The status to show. Completed always wins. Otherwise a passed deadline is
 * "Missed", and less than 24h left is "Overdue". Nothing here is stored —
 * extend the deadline and the user's own status comes back.
 */
export function displayStatus(h: DeadlineFields, now: Date): DisplayStatus {
  if (h.status === "COMPLETED") return "COMPLETED";
  const ms = msLeft(h, now);
  if (ms === null) return h.status;
  if (ms <= 0) return "MISSED";
  if (ms < OVERDUE_WITHIN) return "OVERDUE";
  return h.status;
}

export type Urgency = "overdue" | "red" | "yellow" | "missed" | "none";

/** Drives row colours. Completed rows are never highlighted. */
export function urgency(h: DeadlineFields, now: Date): Urgency {
  if (h.status === "COMPLETED") return "none";
  const ms = msLeft(h, now);
  if (ms === null) return "none";
  if (ms <= 0) return "missed";
  if (ms < OVERDUE_WITHIN) return "overdue";
  if (ms < RED_WITHIN) return "red";
  if (ms < YELLOW_WITHIN) return "yellow";
  return "none";
}

/** Whole days left (floored), for sorting and display. null if no deadline. */
export function daysLeft(h: Pick<Hackathon, "deadline">, now: Date): number | null {
  const ms = msLeft(h, now);
  return ms === null ? null : Math.floor(ms / DAY);
}

/** Text for the "Days left" column: "Missed", "14h", "1d", "12d", or "—". */
export function timeLeftLabel(h: DeadlineFields, now: Date): string {
  if (h.status === "COMPLETED") return h.deadline ? "Done" : "—";
  const ms = msLeft(h, now);
  if (ms === null) return "—";
  if (ms <= 0) return "Missed";
  if (ms < DAY) return `${Math.max(1, Math.floor(ms / HOUR))}h`;
  return `${Math.floor(ms / DAY)}d`;
}

const isActive = (h: Hackathon) => !h.archivedAt && h.status !== "COMPLETED";

/** Active hackathons due within 24h, soonest first. */
export function overdueList(list: Hackathon[], now: Date): Hackathon[] {
  return list
    .filter((h) => isActive(h) && displayStatus(h, now) === "OVERDUE")
    .sort(byDeadline);
}

/** The next `n` upcoming deadlines, excluding ones already in the Overdue section. */
export function nextDeadlines(list: Hackathon[], now: Date, n = 3): Hackathon[] {
  return list
    .filter((h) => {
      const ms = msLeft(h, now);
      return isActive(h) && ms !== null && ms >= OVERDUE_WITHIN;
    })
    .sort(byDeadline)
    .slice(0, n);
}

function byDeadline(a: Hackathon, b: Hackathon) {
  return new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime();
}
