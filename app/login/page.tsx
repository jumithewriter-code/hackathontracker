"use client";

import { useState } from "react";
import { Bubble, Mascot } from "@/components/Mascot";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode: code }),
    });
    setBusy(false);
    if (res.ok) window.location.href = "/";
    else setError("Wrong passcode — try again");
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-ink px-6 py-10 text-cream sm:px-12">
      <h1 className="relative z-10 text-[52px] font-semibold uppercase leading-[0.95] tracking-tight sm:text-[76px]">
        Ship
        <br />
        <span className="text-leaf">better</span>
        <br />
        <span className="text-leaf">hackathons</span>
        <svg className="mt-2 block" width="150" height="14" viewBox="0 0 150 14" aria-hidden>
          <path d="M2 7 q9 -8 18 0 t18 0 t18 0 t18 0 t18 0 t18 0 t18 0 t18 0" stroke="var(--color-leaf)" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      </h1>

      <form onSubmit={submit} className="relative z-10 mt-10 w-full max-w-sm space-y-3">
        <label className="block space-y-2">
          <span className="text-[13px] text-cream/60">Passcode</span>
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-full bg-cream/10 px-5 py-3.5 text-[15px] text-cream outline-none ring-leaf placeholder:text-cream/30 focus:ring-2"
            placeholder="••••••••"
          />
        </label>
        {error && <p className="px-2 text-[13px] text-coral">{error}</p>}
        <button
          disabled={busy || !code}
          className="w-full rounded-full bg-leaf px-5 py-3.5 text-[15px] font-medium text-white hover:bg-leaf-dark disabled:opacity-50"
        >
          {busy ? "Checking…" : "Let's go"}
        </button>
      </form>

      <div className="pointer-events-none absolute -bottom-10 -right-16 flex items-start sm:right-10">
        <Bubble tail="bottom" className="relative z-10 -mr-6 mt-2 bg-cream-2">
          It&apos;s more fun
          <br />
          building together!
        </Bubble>
        <Mascot shape="blob" mood="cheer" size={300} className="opacity-95" />
      </div>
    </main>
  );
}
