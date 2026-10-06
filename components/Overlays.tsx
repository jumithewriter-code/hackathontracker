"use client";
// Modal pieces: delete confirmation and the "GOOD JOB!" celebration.
import { useEffect, useRef } from "react";
import { Bubble, Confetti, Mascot } from "./Mascot";

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
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/30 p-4 sm:items-center" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="del-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm animate-rise rounded-[28px] bg-cream p-6 text-center shadow-2xl"
      >
        <div className="flex justify-center">
          <Mascot shape="blob" mood="worried" color="var(--color-coral)" size={86} />
        </div>
        <h2 id="del-title" className="mt-2 text-lg font-semibold">
          Delete forever?
        </h2>
        <p className="mt-1 text-[13px] text-muted">
          <span className="font-medium text-ink">&ldquo;{name}&rdquo;</span> will be permanently deleted. This can&apos;t
          be undone — use Archive if you just want to hide it.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="rounded-full bg-cream-3 px-4 py-3 font-medium hover:bg-line focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full bg-coral px-4 py-3 font-medium text-white hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function Celebration({ name, onDone }: { name: string; onDone: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDone, 2600);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={onDone}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-cream/85 backdrop-blur-sm"
    >
      <Confetti />
      <div className="relative flex animate-pop flex-col items-center">
        <Bubble tail="bottom" className="mb-3 ml-24 text-lg">
          Good job!
        </Bubble>
        <Mascot shape="triangle" mood="cheer" size={150} className="animate-bob" />
        <p className="mt-3 max-w-xs text-center text-[15px] font-semibold">{name} — completed 🎉</p>
      </div>
    </div>
  );
}
