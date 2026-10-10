// Shared types and labels used by the API, UI, and tests.

export const STATUSES = ["CONSIDERING", "NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as const;
export type Status = (typeof STATUSES)[number];

/** What the user sees: their own status, or one computed from the deadline. */
export type DisplayStatus = Status | "OVERDUE" | "MISSED";

export const RESULTS = ["WON", "PLACED", "SUBMITTED", "DID_NOT_FINISH"] as const;
export type Result = (typeof RESULTS)[number];

export const STATUS_LABELS: Record<DisplayStatus, string> = {
  CONSIDERING: "Considering",
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  OVERDUE: "Overdue",
  MISSED: "Missed",
};

export const RESULT_LABELS: Record<Result, string> = {
  WON: "Won",
  PLACED: "Placed",
  SUBMITTED: "Submitted",
  DID_NOT_FINISH: "Didn't finish",
};

/** A hackathon as sent over the API (dates are ISO strings). */
export interface Hackathon {
  id: string;
  name: string;
  organizer: string | null;
  category: string | null;
  status: Status;
  /** "YYYY-MM-DD" */
  startDate: string | null;
  /** ISO timestamp */
  deadline: string | null;
  prize: string | null;
  link: string | null;
  notes: string | null;
  result: Result | null;
  resultDetail: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Tabs shown above the table. */
export const TABS = [
  "ALL",
  "CONSIDERING",
  "NOT_STARTED",
  "IN_PROGRESS",
  "OVERDUE",
  "MISSED",
  "COMPLETED",
  "ARCHIVED",
] as const;
export type Tab = (typeof TABS)[number];

/** Tabs shown in the UI. "Not Started" rows still appear under All. */
export const VISIBLE_TABS: readonly Tab[] = TABS.filter((t) => t !== "NOT_STARTED");

export const TAB_LABELS: Record<Tab, string> = {
  ALL: "All",
  ARCHIVED: "Archived",
  ...STATUS_LABELS,
};
