import { describe, expect, it } from "vitest";
import { DAY, HOUR } from "@/lib/deadlines";
import { applyFilters, sortHackathons, tabCounts } from "@/lib/filters";
import { makeHackathon } from "./factory";

const now = new Date("2026-10-04T12:00:00.000Z");
const at = (ms: number) => new Date(now.getTime() + ms).toISOString();

const list = [
  makeHackathon({ name: "Alpha AI", category: "AI", status: "CONSIDERING", deadline: at(20 * DAY) }),
  makeHackathon({ name: "Beta Fin", category: "Fintech", status: "IN_PROGRESS", deadline: at(2 * DAY) }),
  makeHackathon({ name: "Gamma AI", category: "ai", status: "IN_PROGRESS", deadline: at(3 * HOUR) }),
  makeHackathon({ name: "Delta Web3", category: "Web3", status: "NOT_STARTED", deadline: at(-DAY) }),
  makeHackathon({ name: "Epsilon", category: null, status: "COMPLETED", deadline: at(-10 * DAY) }),
  makeHackathon({ name: "Zeta old", category: "AI", status: "CONSIDERING", archivedAt: at(-DAY) }),
];
const names = (l: typeof list) => l.map((h) => h.name);

describe("status tabs", () => {
  it("ALL shows every non-archived row", () => {
    expect(names(applyFilters(list, { tab: "ALL", q: "", category: null }, now))).toHaveLength(5);
  });

  it("uses the computed status, so Overdue/Missed rows leave their original tab", () => {
    expect(names(applyFilters(list, { tab: "IN_PROGRESS", q: "", category: null }, now))).toEqual(["Beta Fin"]);
    expect(names(applyFilters(list, { tab: "OVERDUE", q: "", category: null }, now))).toEqual(["Gamma AI"]);
    expect(names(applyFilters(list, { tab: "MISSED", q: "", category: null }, now))).toEqual(["Delta Web3"]);
    expect(names(applyFilters(list, { tab: "COMPLETED", q: "", category: null }, now))).toEqual(["Epsilon"]);
  });

  it("ARCHIVED shows only archived rows, and archived rows appear nowhere else", () => {
    expect(names(applyFilters(list, { tab: "ARCHIVED", q: "", category: null }, now))).toEqual(["Zeta old"]);
    expect(names(applyFilters(list, { tab: "CONSIDERING", q: "", category: null }, now))).toEqual(["Alpha AI"]);
  });

  it("counts every tab", () => {
    expect(tabCounts(list, { q: "", category: null }, now)).toEqual({
      ALL: 5,
      CONSIDERING: 1,
      NOT_STARTED: 0,
      IN_PROGRESS: 1,
      OVERDUE: 1,
      MISSED: 1,
      COMPLETED: 1,
      ARCHIVED: 1,
    });
  });
});

describe("search and category", () => {
  it("matches category case-insensitively", () => {
    expect(names(applyFilters(list, { tab: "ALL", q: "", category: "AI" }, now))).toEqual(["Alpha AI", "Gamma AI"]);
  });

  it("searches name case-insensitively and combines with tab + category", () => {
    expect(names(applyFilters(list, { tab: "ALL", q: "  beta ", category: null }, now))).toEqual(["Beta Fin"]);
    expect(names(applyFilters(list, { tab: "OVERDUE", q: "gamma", category: "ai" }, now))).toEqual(["Gamma AI"]);
    expect(applyFilters(list, { tab: "CONSIDERING", q: "gamma", category: null }, now)).toEqual([]);
  });
});

describe("sorting", () => {
  it("sorts by days left with undated/completed rows last in both directions", () => {
    const active = list.filter((h) => !h.archivedAt);
    expect(names(sortHackathons(active, { key: "daysLeft", dir: "asc" }, now))).toEqual([
      "Delta Web3",
      "Gamma AI",
      "Beta Fin",
      "Alpha AI",
      "Epsilon",
    ]);
    expect(names(sortHackathons(active, { key: "daysLeft", dir: "desc" }, now)).at(-1)).toBe("Epsilon");
  });

  it("sorts text case-insensitively", () => {
    const sorted = sortHackathons(list, { key: "name", dir: "desc" }, now);
    expect(sorted[0].name).toBe("Zeta old");
  });
});
