// Single-passcode lock. The cookie holds a SHA-256 of the passcode (never the
// passcode itself). Used from middleware, so it sticks to Web Crypto.
export const SESSION_COOKIE = "ht_session";

export async function sessionToken(passcode: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`hackathon-tracker:${passcode}`));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time compare so response timing doesn't reveal how much matched. */
export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function configuredPasscode() {
  return process.env.APP_PASSCODE || null;
}
