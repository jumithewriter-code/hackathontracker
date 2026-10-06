// Applies migrations to the TEST database (TEST_DATABASE_URL), never the real one.
import { spawnSync } from "node:child_process";

try {
  process.loadEnvFile(".env");
} catch {}

const url = process.env.TEST_DATABASE_URL;
if (!url) {
  console.error("TEST_DATABASE_URL is not set in .env — nothing to do.");
  process.exit(1);
}
if (url === process.env.DATABASE_URL || url === process.env.DIRECT_URL) {
  console.error("TEST_DATABASE_URL must be a separate Neon branch, not your real database.");
  process.exit(1);
}

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, DATABASE_URL: url, DIRECT_URL: url },
});
process.exit(result.status ?? 1);
