// Date helpers for display and for the deadline editor. All in the viewer's local time.

export function formatDate(isoDate: string | null) {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function formatDeadline(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const date = d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${date}, ${time}`;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** ISO timestamp → { date: "YYYY-MM-DD", time: "HH:MM" } in local time. */
export function splitLocal(iso: string | null) {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

/** Local date + optional time → ISO timestamp. A blank time means 11:59 PM. */
export function joinLocal(date: string, time: string): string | null {
  if (!date) return null;
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = (time || "23:59").split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm).toISOString();
}

export function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
