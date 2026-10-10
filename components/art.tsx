// Illustrations and "desk" pieces: the rubber duck, the rocket, the launch
// track, flip-clock countdown, sticky notes and tape.
import { DAY, HOUR, msLeft, urgency, type Urgency } from "@/lib/deadlines";
import { formatDate, formatDeadline } from "@/lib/format";
import type { Hackathon } from "@/lib/types";

// ─── Rubber duck ─────────────────────────────────────────────────────────────

export type DuckMood = "happy" | "sweat" | "party" | "sleepy" | "astronaut";

export function Duck({ mood = "happy", size = 110, className = "" }: { mood?: DuckMood; size?: number; className?: string }) {
  const navy = "var(--color-navy)";
  return (
    <svg viewBox="0 0 130 120" width={size} height={(size * 120) / 130} className={className} aria-hidden>
      <ellipse cx="62" cy="112" rx="44" ry="5" fill="var(--color-navy)" opacity="0.08" />
      {/* body */}
      <path
        d="M12 52 C20 60 26 66 36 64 C46 56 66 58 80 64 C100 72 108 82 104 94 C98 106 72 110 52 108 C28 106 10 92 12 52 Z"
        fill="var(--color-duck)"
        stroke={navy}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* wing */}
      <path d="M42 78 C52 68 70 70 74 82 C66 92 50 92 42 78 Z" fill="var(--color-duck-dark)" stroke={navy} strokeWidth="2" strokeLinejoin="round" />
      {/* head */}
      <circle cx="82" cy="40" r="23" fill="var(--color-duck)" stroke={navy} strokeWidth="2.5" />
      {/* beak */}
      <path
        d={mood === "party" || mood === "sweat" ? "M100 40 C112 36 120 40 117 45 C113 46 106 46 102 46 C108 48 112 52 108 54 C102 54 98 50 97 47 Z" : "M100 40 C110 37 119 41 117 46 C113 51 103 50 98 47 Z"}
        fill="var(--color-beak)"
        stroke={navy}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* cheek */}
      <circle cx="92" cy="49" r="4.5" fill="var(--color-beak)" opacity="0.35" />

      {/* eyes */}
      {mood === "happy" || mood === "astronaut" ? (
        <g>
          <circle cx="88" cy="34" r="4" fill={navy} />
          <circle cx="89.5" cy="32.5" r="1.3" fill="white" />
        </g>
      ) : mood === "sweat" ? (
        <g>
          <circle cx="88" cy="35" r="4.6" fill="white" stroke={navy} strokeWidth="2" />
          <circle cx="89" cy="35.5" r="2.2" fill={navy} />
          <path d="M81 28 L95 23" stroke={navy} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M68 22 q5 9 0 12 q-5 -3 0 -12 Z" fill="#7cc4f2" stroke={navy} strokeWidth="1.2" />
        </g>
      ) : mood === "party" ? (
        <path d="M83 35 q5 -7 10 0" fill="none" stroke={navy} strokeWidth="2.6" strokeLinecap="round" />
      ) : (
        <g>
          <path d="M83 35 q5 4 10 0" fill="none" stroke={navy} strokeWidth="2.6" strokeLinecap="round" />
          <text x="106" y="16" fontFamily="var(--font-hand)" fontSize="16" fill={navy}>z</text>
          <text x="116" y="6" fontFamily="var(--font-hand)" fontSize="12" fill={navy}>z</text>
        </g>
      )}

      {/* party hat */}
      {mood === "party" && (
        <g transform="rotate(14 82 18)">
          <path d="M70 20 L82 -6 L94 20 Z" fill="var(--color-lav)" stroke={navy} strokeWidth="2" strokeLinejoin="round" />
          <path d="M74 12 L90 12 M77 4 L87 4" stroke="var(--color-duck)" strokeWidth="2.5" />
          <circle cx="82" cy="-6" r="4" fill="var(--color-rocket)" stroke={navy} strokeWidth="1.5" />
        </g>
      )}
      {/* astronaut helmet */}
      {mood === "astronaut" && (
        <g>
          <circle cx="84" cy="40" r="31" fill="#bfe6ff" opacity="0.35" stroke={navy} strokeWidth="2.5" />
          <path d="M66 24 q6 -8 16 -9" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      )}
    </svg>
  );
}

// ─── Rocket ──────────────────────────────────────────────────────────────────

/** Small horizontal rocket (pointing right) for launch tracks. */
export function Rocket({
  flame = false,
  grey = false,
  width = 34,
}: {
  flame?: boolean;
  grey?: boolean;
  width?: number;
}) {
  const body = grey ? "#d8d6cf" : "white";
  const accent = grey ? "#a9a69c" : "var(--color-rocket)";
  return (
    <svg viewBox="-12 0 52 20" width={width} height={(width * 20) / 52} aria-hidden className="overflow-visible">
      {flame && (
        <g className="origin-right animate-flame" style={{ transformBox: "fill-box" }}>
          <path d="M3 6 L-11 10 L3 14 Z" fill="var(--color-beak)" />
          <path d="M3 8 L-5 10 L3 12 Z" fill="var(--color-duck)" />
        </g>
      )}
      <path d="M8 3 L2 0 L4 6 Z M8 17 L2 20 L4 14 Z" fill={accent} stroke="var(--color-navy)" strokeWidth="1.2" strokeLinejoin="round" />
      <path
        d="M3 10 C3 5 9 3 21 3 C29 3 35 7 38 10 C35 13 29 17 21 17 C9 17 3 15 3 10 Z"
        fill={body}
        stroke="var(--color-navy)"
        strokeWidth="1.6"
      />
      <path d="M31 5.2 C34 6.6 36.5 8.5 38 10 C36.5 11.5 34 13.4 31 14.8 Z" fill={accent} />
      <circle cx="22" cy="10" r="3.2" fill={grey ? "#c9c6bd" : "var(--color-teal)"} stroke="var(--color-navy)" strokeWidth="1.3" />
    </svg>
  );
}

// ─── Launch track ────────────────────────────────────────────────────────────

/** Fraction of the start→deadline window that has elapsed (0..1), or null if there's no deadline. */
export function launchProgress(h: Hackathon, now: Date): number | null {
  if (!h.deadline) return null;
  const end = new Date(h.deadline).getTime();
  const start = h.startDate
    ? new Date(`${h.startDate}T00:00:00`).getTime()
    : Math.min(new Date(h.createdAt).getTime(), end - DAY);
  if (end <= start) return now.getTime() >= end ? 1 : 0;
  return Math.min(1, Math.max(0, (now.getTime() - start) / (end - start)));
}

const FILL: Record<Urgency, string> = {
  overdue: "bg-rocket",
  red: "bg-rocket/80",
  yellow: "bg-duck",
  missed: "bg-muted/40",
  none: "bg-teal",
};

/**
 * A dashed track from start date (launch pad) to deadline (target), with a
 * rocket at how far through the window you are.
 */
export function LaunchTrack({ h, now, size = "sm" }: { h: Hackathon; now: Date; size?: "sm" | "lg" }) {
  const u = urgency(h, now);
  const p = launchProgress(h, now);
  const lg = size === "lg";
  const completed = h.status === "COMPLETED";
  const missed = u === "missed";

  if (p === null) {
    return (
      <div className={`flex items-center gap-2 ${lg ? "h-10" : "h-6"}`}>
        <div className="h-0 flex-1 border-t-2 border-dashed border-navy/15" />
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">no launch date</span>
      </div>
    );
  }

  const pos = completed ? 1 : missed ? 0 : p;
  const rocketW = lg ? 44 : 30;
  const label = completed ? "Launched" : missed ? "Stayed on the pad" : `${Math.round(p * 100)}% of the window used`;

  return (
    <div className="w-full" role="img" aria-label={`Launch track: ${label}`}>
      <div className={`relative ${lg ? "h-10" : "h-6"}`}>
        {/* pad */}
        <span className="absolute bottom-[calc(50%-5px)] left-0 h-[10px] w-1.5 rounded-sm bg-navy/70" />
        {/* track */}
        <div className="absolute left-1 right-3 top-1/2 h-0 -translate-y-1/2 border-t-2 border-dashed border-navy/20" />
        <div
          className={`absolute left-1 top-1/2 h-[3px] -translate-y-1/2 rounded-full ${completed ? "bg-green" : FILL[u]}`}
          style={{ width: `calc((100% - 16px) * ${completed ? 1 : missed ? 1 : p})` }}
        />
        {/* target */}
        <span
          className={`absolute right-0 top-1/2 size-3 -translate-y-1/2 rounded-full border-2 border-navy ${completed ? "bg-green" : "bg-card"}`}
        />
        {/* rocket */}
        <span
          className="absolute top-1/2 -translate-y-1/2 transition-[left] duration-700"
          style={{ left: `calc((100% - ${rocketW}px) * ${pos})` }}
        >
          <Rocket width={rocketW} flame={!completed && !missed && p > 0} grey={missed} />
        </span>
      </div>
      {lg && (
        <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted">
          <span>{h.startDate ? `Start ${formatDate(h.startDate)}` : "Added"}</span>
          <span className={missed ? "text-rocket" : ""}>{label}</span>
          <span>Due {formatDeadline(h.deadline).split(",").slice(0, 2).join(",")}</span>
        </div>
      )}
    </div>
  );
}

// ─── Flip-clock countdown ────────────────────────────────────────────────────

function Tile({ children, lg, tone }: { children: React.ReactNode; lg?: boolean; tone: string }) {
  return (
    <span
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-md font-mono font-bold tabular-nums ${tone} ${
        lg ? "h-12 min-w-11 px-1.5 text-[26px]" : "h-8 min-w-7 px-1 text-[17px]"
      }`}
    >
      {children}
      <span className="absolute inset-x-0 top-1/2 h-px bg-black/25" />
    </span>
  );
}

const TILE_TONE: Record<Urgency, string> = {
  overdue: "bg-rocket text-white",
  red: "bg-navy text-hl-pink",
  yellow: "bg-navy text-duck",
  missed: "bg-paper-2 text-muted",
  none: "bg-navy text-paper",
};

/** "02 days", "17:42 h:m", "DONE", "—" as flip-clock tiles. */
export function FlipCountdown({ h, now, size = "sm" }: { h: Hackathon; now: Date; size?: "sm" | "lg" }) {
  const u = urgency(h, now);
  const ms = msLeft(h, now);
  const lg = size === "lg";
  const tone = TILE_TONE[u];
  const unit = (s: string) => <span className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-muted">{s}</span>;
  const pad = (n: number) => String(n).padStart(2, "0");

  if (h.status === "COMPLETED")
    return (
      <span className="inline-flex flex-col items-center">
        <Tile lg={lg} tone="bg-green text-white">✓</Tile>
        {unit("done")}
      </span>
    );
  if (ms === null)
    return (
      <span className="inline-flex flex-col items-center">
        <Tile lg={lg} tone="bg-paper-2 text-muted">––</Tile>
        {unit("no date")}
      </span>
    );
  if (ms <= 0)
    return (
      <span className="inline-flex flex-col items-center">
        <Tile lg={lg} tone={tone}>00</Tile>
        {unit("missed")}
      </span>
    );
  if (ms < DAY) {
    const hrs = Math.floor(ms / HOUR);
    const min = Math.floor((ms % HOUR) / 60_000);
    return (
      <span className="inline-flex flex-col items-center">
        <span className="flex items-center gap-0.5">
          <Tile lg={lg} tone={tone}>{pad(hrs)}</Tile>
          <span className="font-mono font-bold text-rocket">:</span>
          <Tile lg={lg} tone={tone}>{pad(min)}</Tile>
        </span>
        {unit("hrs : min")}
      </span>
    );
  }
  const days = Math.floor(ms / DAY);
  return (
    <span className="inline-flex flex-col items-center">
      <Tile lg={lg} tone={tone}>{pad(days)}</Tile>
      {unit(days === 1 ? "day" : "days")}
    </span>
  );
}

// ─── Desk bits ───────────────────────────────────────────────────────────────

/** A strip of washi tape. */
export function Tape({ className = "", color = "bg-duck/55" }: { className?: string; color?: string }) {
  return <span aria-hidden className={`pointer-events-none absolute h-5 w-16 ${color} ${className}`} style={{ clipPath: "polygon(3% 0, 97% 4%, 100% 100%, 0 94%)" }} />;
}

/** Handwritten sticky note. */
export function StickyNote({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative bg-hl-yellow px-5 pb-5 pt-6 font-hand text-[22px] leading-tight text-navy ${className}`}
      style={{ boxShadow: "0 10px 18px -12px rgba(28,37,65,.45)", clipPath: "polygon(0 0, 100% 0, 100% 88%, 92% 100%, 0 100%)" }}
    >
      {children}
    </div>
  );
}

/** Puffs of smoke for the liftoff animation. */
export function Smoke() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40" aria-hidden>
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className="absolute bottom-0 size-20 animate-puff rounded-full bg-white"
          style={{ left: `calc(50% + ${(i - 4) * 34}px - 40px)`, animationDelay: `${0.4 + (i % 4) * 0.12}s`, opacity: 0 }}
        />
      ))}
    </div>
  );
}
