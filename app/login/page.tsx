"use client";

import { useState } from "react";
import { Duck, Rocket, Tape } from "@/components/art";

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
    else setError("Wrong passcode. The duck is not amused.");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-sm">
        <Duck mood={error ? "sweat" : "astronaut"} size={120} className="absolute -top-[88px] left-6 z-10 animate-bob" />
        <form onSubmit={submit} className="card-paper relative -rotate-1 px-6 pb-6 pt-8">
          <Tape className="-top-2.5 right-8 rotate-6" />
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">Hackathon Tracker</p>
          <h1 className="mt-1 font-display text-[34px] font-extrabold leading-none tracking-tight">Ready for launch?</h1>
          <div className="my-4 flex items-center gap-2">
            <span className="h-0 flex-1 border-t-2 border-dashed border-navy/20" />
            <Rocket width={36} flame />
          </div>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Passcode</span>
            <input
              type="password"
              autoFocus
              autoComplete="current-password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 w-full border-b-2 border-navy/30 bg-transparent px-1 py-2 font-mono text-[16px] tracking-widest outline-none focus:border-navy"
            />
          </label>
          {error && <p className="mt-2 font-hand text-[19px] text-rocket">{error}</p>}
          <button disabled={busy || !code} className="btn-launch mt-6 w-full py-3 text-[15px]">
            {busy ? "Checking…" : "🚀 Unlock"}
          </button>
        </form>
      </div>
    </main>
  );
}
