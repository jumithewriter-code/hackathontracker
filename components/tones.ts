import type { Urgency } from "@/lib/deadlines";
import type { DisplayStatus } from "@/lib/types";

/** Highlighter-pen row tint per deadline urgency (opaque, so sticky cells match). */
export const ROW_TONE: Record<Urgency, string> = {
  overdue: "bg-hl-red",
  red: "bg-hl-pink",
  yellow: "bg-hl-yellow",
  missed: "bg-paper text-muted",
  none: "bg-card",
};

/** Rubber-stamp status styles: outlined, uppercase mono, colour per status. */
export const STAMP: Record<DisplayStatus, string> = {
  CONSIDERING: "text-lav border-lav",
  NOT_STARTED: "text-slate border-slate",
  IN_PROGRESS: "text-teal border-teal",
  COMPLETED: "text-green border-green",
  OVERDUE: "text-white border-rocket bg-rocket",
  MISSED: "text-muted border-muted/60 line-through",
};

/** Tape colour on index cards, keyed by status. */
export const TAPE: Record<DisplayStatus, string> = {
  CONSIDERING: "bg-lav/30",
  NOT_STARTED: "bg-slate/25",
  IN_PROGRESS: "bg-teal/30",
  COMPLETED: "bg-green/30",
  OVERDUE: "bg-rocket/45",
  MISSED: "bg-muted/25",
};
