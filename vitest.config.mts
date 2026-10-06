import { defineConfig } from "vitest/config";
import path from "node:path";

// Make TEST_DATABASE_URL (and friends) from .env available to the tests.
try {
  process.loadEnvFile(".env");
} catch {
  // no .env — integration tests will be skipped
}

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, ".") } },
  test: {
    include: ["tests/**/*.test.ts"],
    // Integration tests share one database, so run files one at a time.
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
});
