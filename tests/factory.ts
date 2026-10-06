import type { Hackathon } from "@/lib/types";

let n = 0;

/** Builds a Hackathon DTO with sensible defaults for tests. */
export function makeHackathon(overrides: Partial<Hackathon> = {}): Hackathon {
  n++;
  return {
    id: `h${n}`,
    name: `Hackathon ${n}`,
    organizer: null,
    category: null,
    status: "NOT_STARTED",
    startDate: null,
    deadline: null,
    prize: null,
    link: null,
    notes: null,
    result: null,
    resultDetail: null,
    archivedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}
