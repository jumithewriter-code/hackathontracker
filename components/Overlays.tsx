"use client";
// Modal pieces: delete confirmation and the LIFTOFF celebration.
import { useEffect, useRef } from "react";
import { Duck, Smoke } from "./art";

export function ConfirmDelete({
  name,
  onCancel,
  onConfirm,
}: {
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-navy/35 p-4 sm:items-center" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="del-title"
        onClick={(e) => e.stopPropagation()}
        className="card-paper relative w-full max-w-sm animate-rise overflow-visible px-6 pb-6 pt-10"
      >
        <Duck mood="sweat" size={88} className="absolute -top-12 left-1/2 -translate-x-1/2 animate-shake" />
        <h2 id="del-title" className="text-center font-display text-xl font-bold">
          Delete forever?
        </h2>
        <p className="mt-2 text-center text-[13px] text-muted">
          <span className="font-semibold text-navy">&ldquo;{name}&rdquo;</span> will be permanently deleted. This can&apos;t be
          undone — use Archive if you just want it off your desk.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="flex-1 rounded-xl border-2 border-navy/20 py-2.5 font-medium hover:border-navy/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          >
            Keep it
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl border-2 border-navy bg-rocket py-2.5 font-display font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            style={{ boxShadow: "0 4px 0 var(--color-navy)" }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function Liftoff({ name, onDone }: { name: string; onDone: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDone, 3000);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={onDone}
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#bfe3f7] via-[#e9f5fb] to-paper"
    >
      <div className="relative z-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-navy/60">mission complete</p>
        <p className="font-display text-[56px] font-extrabold leading-none tracking-tight text-navy sm:text-[80px]">LIFTOFF!</p>
        <p className="mt-2 max-w-xs text-[15px] font-medium text-navy/80">{name} is done. 🎉</p>
      </div>

      {/* duck rides the rocket up and out */}
      <div className="relative mt-6 animate-liftoff">
        <svg viewBox="0 0 120 220" width="120" height="220" aria-hidden className="overflow-visible">
          <g>
            <path d="M44 170 L60 215 L76 170 Z" fill="var(--color-beak)" className="origin-top animate-flame" style={{ transformBox: "fill-box" }} />
            <path d="M50 170 L60 198 L70 170 Z" fill="var(--color-duck)" />
          </g>
          <path d="M30 140 L14 172 L36 166 Z M90 140 L106 172 L84 166 Z" fill="var(--color-rocket)" stroke="var(--color-navy)" strokeWidth="2.5" strokeLinejoin="round" />
          <path
            d="M60 10 C84 30 92 70 90 120 L88 170 L32 170 L30 120 C28 70 36 30 60 10 Z"
            fill="white"
            stroke="var(--color-navy)"
            strokeWidth="3"
          />
          <path d="M60 10 C72 20 80 34 84 48 L36 48 C40 34 48 20 60 10 Z" fill="var(--color-rocket)" />
          <circle cx="60" cy="92" r="24" fill="#bfe6ff" stroke="var(--color-navy)" strokeWidth="3" />
        </svg>
        <div className="absolute left-1/2 top-[66px] -translate-x-1/2">
          <Duck mood="party" size={52} />
        </div>
      </div>
      <Smoke />
    </div>
  );
}
