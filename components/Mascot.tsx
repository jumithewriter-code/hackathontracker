// Friendly shape characters. Mood follows how close the deadline is.
export type MascotShape = "pentagon" | "triangle" | "blob";
export type MascotMood = "happy" | "worried" | "cheer" | "sleepy";

const SHAPES: Record<MascotShape, React.ReactNode> = {
  pentagon: <path d="M60 14 L106 48 L89 102 L31 102 L14 48 Z" />,
  triangle: <path d="M60 16 L106 100 L14 100 Z" />,
  blob: <rect x="16" y="26" width="88" height="76" rx="34" />,
};

export function Mascot({
  shape = "pentagon",
  mood = "happy",
  color = "var(--color-leaf)",
  size = 120,
  className = "",
}: {
  shape?: MascotShape;
  mood?: MascotMood;
  color?: string;
  size?: number;
  className?: string;
}) {
  const fy = shape === "triangle" ? 72 : 64; // face height
  const ink = "var(--color-ink)";
  return (
    <svg viewBox="0 0 120 132" width={size} height={size * 1.1} className={className} aria-hidden>
      <ellipse cx="60" cy="124" rx="40" ry="6" fill="var(--color-cream-3)" />

      {/* arms + legs when cheering */}
      {mood === "cheer" && (
        <g stroke={ink} strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M22 70 L6 52 M6 52 l-3 -6 M6 52 l-6 1" />
          <path d="M98 70 L114 52 M114 52 l3 -6 M114 52 l6 1" />
          <path d="M46 100 L40 118 l-6 1 M74 100 L80 118 l6 1" />
        </g>
      )}

      <g fill={color} stroke={color} strokeWidth="10" strokeLinejoin="round">
        {SHAPES[shape]}
      </g>
      {/* soft highlight */}
      <g fill="white" opacity="0.12">
        <ellipse cx="44" cy={fy - 20} rx="16" ry="7" transform={`rotate(-20 44 ${fy - 20})`} />
      </g>

      {/* face */}
      {mood === "happy" && (
        <g fill={ink}>
          <circle cx="49" cy={fy - 4} r="3.6" />
          <circle cx="71" cy={fy - 4} r="3.6" />
          <path d={`M48 ${fy + 6} Q60 ${fy + 20} 72 ${fy + 6} Z`} />
        </g>
      )}
      {mood === "cheer" && (
        <g>
          <g stroke={ink} strokeWidth="3" strokeLinecap="round" fill="none">
            <path d={`M44 ${fy - 2} q5 -7 10 0`} />
            <path d={`M66 ${fy - 2} q5 -7 10 0`} />
          </g>
          <path d={`M46 ${fy + 5} Q60 ${fy + 24} 74 ${fy + 5} Z`} fill={ink} />
          <path d={`M53 ${fy + 13} Q60 ${fy + 19} 67 ${fy + 13} Z`} fill="var(--color-coral)" opacity="0.8" />
        </g>
      )}
      {mood === "worried" && (
        <g>
          <g fill={ink}>
            <circle cx="49" cy={fy - 2} r="4" />
            <circle cx="71" cy={fy - 2} r="4" />
            <ellipse cx="60" cy={fy + 12} rx="5" ry="6" />
          </g>
          <g stroke={ink} strokeWidth="2.6" strokeLinecap="round">
            <path d={`M42 ${fy - 9} L54 ${fy - 13}`} />
            <path d={`M78 ${fy - 9} L66 ${fy - 13}`} />
          </g>
          <path d={`M88 ${fy - 22} q5 8 0 11 q-5 -3 0 -11 Z`} fill="#8cc8f0" />
        </g>
      )}
      {mood === "sleepy" && (
        <g stroke={ink} strokeWidth="3" strokeLinecap="round" fill="none">
          <path d={`M44 ${fy - 3} q5 5 10 0`} />
          <path d={`M66 ${fy - 3} q5 5 10 0`} />
          <path d={`M54 ${fy + 10} q6 4 12 0`} />
        </g>
      )}
    </svg>
  );
}

/** Handwritten speech bubble. `tail` says which side the tail points to. */
export function Bubble({
  children,
  tail = "left",
  className = "",
}: {
  children: React.ReactNode;
  tail?: "left" | "bottom" | "none";
  className?: string;
}) {
  return (
    <div className={`relative rounded-[26px] bg-cream-3 px-5 py-3 font-hand text-[15px] uppercase leading-snug text-ink ${className}`}>
      {children}
      {tail === "left" && (
        <svg className="absolute -left-2 bottom-4" width="16" height="16" viewBox="0 0 16 16" aria-hidden>
          <path d="M16 2 Q6 10 0 14 Q10 14 16 12 Z" fill="var(--color-cream-3)" />
        </svg>
      )}
      {tail === "bottom" && (
        <svg className="absolute -bottom-2 left-8" width="18" height="14" viewBox="0 0 18 14" aria-hidden>
          <path d="M0 0 Q4 10 2 14 Q10 8 18 0 Z" fill="var(--color-cream-3)" />
        </svg>
      )}
    </div>
  );
}

/** Confetti bits for celebrations. Deterministic so it doesn't jump on re-render. */
export function Confetti({ count = 26 }: { count?: number }) {
  const colors = ["var(--color-sky)", "var(--color-berry)", "var(--color-sun)", "var(--color-leaf)", "var(--color-coral)"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const left = (i * 37) % 100;
        const top = (i * 53) % 70;
        const color = colors[i % colors.length];
        const kind = i % 3;
        return (
          <span
            key={i}
            className="absolute animate-fall"
            style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${(i % 7) * 0.08}s` }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12">
              {kind === 0 && <circle cx="6" cy="6" r="5" fill={color} />}
              {kind === 1 && <path d="M1 11 L6 1 L11 11 Z" fill={color} />}
              {kind === 2 && <path d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5 Z" fill={color} />}
            </svg>
          </span>
        );
      })}
    </div>
  );
}
