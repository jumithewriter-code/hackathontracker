import { describe, expect, it } from "vitest";
import {
  DAY,
  HOUR,
  daysLeft,
  displayStatus,
  nextDeadlines,
  overdueList,
  timeLeftLabel,
  urgency,
} from "@/lib/deadlines";
import { makeHackathon } from "./factory";

const now = new Date("2026-10-04T12:00:00.000Z");
const at = (ms: number) => new Date(now.getTime() + ms).toISOString();

describe("displayStatus", () => {
  it("keeps the user's status when the deadline is far away or missing", () => {
    expect(displayStatus(makeHackathon({ status: "IN_PROGRESS", deadline: at(10 * DAY) }), now)).toBe("IN_PROGRESS");
    expect(displayStatus(makeHackathon({ status: "CONSIDERING", deadline: null }), now)).toBe("CONSIDERING");
  });

  it("is OVERDUE with less than 24 hours left", () => {
    expect(displayStatus(makeHackathon({ deadline: at(23 * HOUR) }), now)).toBe("OVERDUE");
    expect(displayStatus(makeHackathon({ deadline: at(1000) }), now)).toBe("OVERDUE");
  });

  it("is not OVERDUE at exactly 24 hours", () => {
    expect(displayStatus(makeHackathon({ status: "NOT_STARTED", deadline: at(DAY) }), now)).toBe("NOT_STARTED");
  });

  it("is MISSED once the deadline has passed (including exactly now)", () => {
    expect(displayStatus(makeHackathon({ deadline: at(0) }), now)).toBe("MISSED");
    expect(displayStatus(makeHackathon({ deadline: at(-3 * DAY) }), now)).toBe("MISSED");
  });

  it("never overrides COMPLETED", () => {
    expect(displayStatus(makeHackathon({ status: "COMPLETED", deadline: at(-3 * DAY) }), now)).toBe("COMPLETED");
    expect(displayStatus(makeHackathon({ status: "COMPLETED", deadline: at(2 * HOUR) }), now)).toBe("COMPLETED");
  });

  it("reverts to the user's status if the deadline is extended", () => {
    const h = makeHackathon({ status: "IN_PROGRESS", deadline: at(-HOUR) });
    expect(displayStatus(h, now)).toBe("MISSED");
    expect(displayStatus({ ...h, deadline: at(5 * DAY) }, now)).toBe("IN_PROGRESS");
  });
});

describe("urgency (row highlighting)", () => {
  it.each([
    [12 * HOUR, "overdue"],
    [2 * DAY, "red"],
    [3 * DAY - 1, "red"],
    [3 * DAY, "yellow"],
    [7 * DAY - 1, "yellow"],
    [7 * DAY, "none"],
    [-HOUR, "missed"],
  ] as const)("%d ms left → %s", (ms, expected) => {
    expect(urgency(makeHackathon({ deadline: at(ms) }), now)).toBe(expected);
  });

  it("never highlights completed or deadline-less rows", () => {
    expect(urgency(makeHackathon({ status: "COMPLETED", deadline: at(HOUR) }), now)).toBe("none");
    expect(urgency(makeHackathon({ deadline: null }), now)).toBe("none");
  });
});

describe("days left", () => {
  it("floors whole days", () => {
    expect(daysLeft(makeHackathon({ deadline: at(2 * DAY + 23 * HOUR) }), now)).toBe(2);
    expect(daysLeft(makeHackathon({ deadline: null }), now)).toBeNull();
  });

  it("labels hours under a day, days otherwise, and Missed when passed", () => {
    expect(timeLeftLabel(makeHackathon({ deadline: at(14 * HOUR + 30 * 60_000) }), now)).toBe("14h");
    expect(timeLeftLabel(makeHackathon({ deadline: at(10 * 60_000) }), now)).toBe("1h");
    expect(timeLeftLabel(makeHackathon({ deadline: at(5 * DAY + HOUR) }), now)).toBe("5d");
    expect(timeLeftLabel(makeHackathon({ deadline: at(-HOUR) }), now)).toBe("Missed");
    expect(timeLeftLabel(makeHackathon({ deadline: null }), now)).toBe("—");
    expect(timeLeftLabel(makeHackathon({ status: "COMPLETED", deadline: at(-HOUR) }), now)).toBe("Done");
  });
});

describe("dashboard summary", () => {
  const list = [
    makeHackathon({ name: "far", deadline: at(30 * DAY) }),
    makeHackathon({ name: "soon", deadline: at(2 * DAY) }),
    makeHackathon({ name: "overdue", deadline: at(5 * HOUR) }),
    makeHackathon({ name: "missed", deadline: at(-DAY) }),
    makeHackathon({ name: "done", status: "COMPLETED", deadline: at(DAY + HOUR) }),
    makeHackathon({ name: "archived", deadline: at(DAY + 2 * HOUR), archivedAt: at(-DAY) }),
    makeHackathon({ name: "mid", deadline: at(4 * DAY) }),
    makeHackathon({ name: "later", deadline: at(10 * DAY) }),
    makeHackathon({ name: "none", deadline: null }),
  ];

  it("next 3 deadlines skip overdue, missed, completed, archived, and undated rows", () => {
    expect(nextDeadlines(list, now).map((h) => h.name)).toEqual(["soon", "mid", "later"]);
  });

  it("overdue section lists only active rows due within 24h", () => {
    expect(overdueList(list, now).map((h) => h.name)).toEqual(["overdue"]);
  });
});
