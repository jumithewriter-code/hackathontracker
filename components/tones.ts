import type { Urgency } from "@/lib/deadlines";
import type { DisplayStatus } from "@/lib/types";

/** Row/card background per deadline urgency (opaque, so the sticky Name column matches). */
export const ROW_TONE: Record<Urgency, string> = {
  overdue: "bg-coral-soft",
  red: "bg-[#fdeeec]",
  yellow: "bg-sun-soft",
  missed: "bg-cream-2 text-muted",
  none: "bg-cream",
};

/** Card background (cards sit on cream, so "none" is one step darker). */
export const CARD_TONE: Record<Urgency, string> = { ...ROW_TONE, none: "bg-cream-2" };

/** Coloured left edge on the first cell. */
export const EDGE_TONE: Record<Urgency, string> = {
  overdue: "border-l-coral",
  red: "border-l-coral/60",
  yellow: "border-l-sun",
  missed: "border-l-line",
  none: "border-l-transparent",
};

/** Countdown text colour. */
export const COUNT_TONE: Record<Urgency, string> = {
  overdue: "text-coral",
  red: "text-coral",
  yellow: "text-[#a8930f]",
  missed: "text-muted",
  none: "text-ink",
};

/** Small status line: symbol + colour, like the "✱ New / ≈ Skip / ✓ Done" labels. */
export const STATUS_TONE: Record<DisplayStatus, { symbol: string; className: string }> = {
  CONSIDERING: { symbol: "✱", className: "text-berry" },
  NOT_STARTED: { symbol: "○", className: "text-muted" },
  IN_PROGRESS: { symbol: "≈", className: "text-sky" },
  COMPLETED: { symbol: "✓", className: "text-leaf-dark" },
  OVERDUE: { symbol: "!", className: "text-coral font-semibold" },
  MISSED: { symbol: "✕", className: "text-muted" },
};
