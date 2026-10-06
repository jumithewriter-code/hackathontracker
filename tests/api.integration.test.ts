// Integration tests: real HTTP handlers → Prisma → a real Postgres (your Neon *test* branch).
// Skipped unless TEST_DATABASE_URL is set. Run `npm run test:db:setup` once first.
// ⚠ These tests DELETE ALL ROWS in the test database.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Hackathon } from "@/lib/types";

const TEST_URL = process.env.TEST_DATABASE_URL;
const sameAsReal = !!TEST_URL && TEST_URL === process.env.DATABASE_URL;

describe.skipIf(!TEST_URL || sameAsReal)("API + database (integration)", () => {
  // Loaded after pointing Prisma at the test database.
  let list: typeof import("@/app/api/hackathons/route");
  let item: typeof import("@/app/api/hackathons/[id]/route");
  let prisma: typeof import("@/lib/db").prisma;

  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_URL;
    ({ prisma } = await import("@/lib/db"));
    list = await import("@/app/api/hackathons/route");
    item = await import("@/app/api/hackathons/[id]/route");
  });
  beforeEach(async () => {
    await prisma.hackathon.deleteMany();
  });
  afterAll(async () => {
    await prisma?.hackathon.deleteMany();
    await prisma?.$disconnect();
  });

  const json = (body: unknown) => ({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
  const create = async (body: object) => {
    const res = await list.POST(new Request("http://t/api/hackathons", json(body)));
    expect(res.status).toBe(201);
    return (await res.json()) as Hackathon;
  };
  const get = async (qs = "") =>
    (await (await list.GET(new Request(`http://t/api/hackathons${qs}`))).json()) as Hackathon[];

  it("creates and lists a hackathon, round-tripping dates", async () => {
    const created = await create({
      name: "Persist me",
      category: "AI",
      status: "IN_PROGRESS",
      startDate: "2026-10-10",
      deadline: "2026-10-12T23:59:00.000Z",
      link: "example.com",
    });
    expect(created).toMatchObject({
      name: "Persist me",
      startDate: "2026-10-10",
      deadline: "2026-10-12T23:59:00.000Z",
      link: "https://example.com",
      archivedAt: null,
    });
    expect((await get()).map((h) => h.id)).toEqual([created.id]);
  });

  it("rejects invalid input with 400", async () => {
    const res = await list.POST(new Request("http://t/api/hackathons", json({ name: "" })));
    expect(res.status).toBe(400);
  });

  it("updates a single field inline (PATCH) and clears fields with null", async () => {
    const h = await create({ name: "Edit me", organizer: "Org", status: "CONSIDERING" });
    const res = await item.PATCH(
      new Request(`http://t/api/hackathons/${h.id}`, { ...json({ status: "COMPLETED", organizer: null }), method: "PATCH" }),
      ctx(h.id),
    );
    expect(res.status).toBe(200);
    const updated = (await res.json()) as Hackathon;
    expect(updated).toMatchObject({ status: "COMPLETED", organizer: null, name: "Edit me" });
  });

  it("archives and restores; archived rows are hidden from the default list", async () => {
    const h = await create({ name: "Archive me" });
    const patch = (archived: boolean) =>
      item.PATCH(new Request("http://t", { ...json({ archived }), method: "PATCH" }), ctx(h.id));

    expect(((await (await patch(true)).json()) as Hackathon).archivedAt).not.toBeNull();
    expect(await get()).toHaveLength(0);
    expect(await get("?archived=true")).toHaveLength(1);
    expect(await get("?archived=all")).toHaveLength(1);

    await patch(false);
    expect(await get()).toHaveLength(1);
  });

  it("permanently deletes; deleting again returns 404", async () => {
    const h = await create({ name: "Delete me" });
    expect((await item.DELETE(new Request("http://t"), ctx(h.id))).status).toBe(204);
    expect((await item.DELETE(new Request("http://t"), ctx(h.id))).status).toBe(404);
    expect(await prisma.hackathon.count()).toBe(0);
  });

  it("filters by status, category, and name on the server", async () => {
    await create({ name: "Alpha AI", category: "AI", status: "IN_PROGRESS" });
    await create({ name: "Beta Fin", category: "Fintech", status: "NOT_STARTED" });
    expect((await get("?status=IN_PROGRESS")).map((h) => h.name)).toEqual(["Alpha AI"]);
    expect((await get("?category=fintech")).map((h) => h.name)).toEqual(["Beta Fin"]);
    expect((await get("?q=alp")).map((h) => h.name)).toEqual(["Alpha AI"]);
  });

  it("returns 404 when updating a missing row", async () => {
    const res = await item.PATCH(new Request("http://t", { ...json({ name: "x" }), method: "PATCH" }), ctx("nope"));
    expect(res.status).toBe(404);
  });
});

it.runIf(sameAsReal)("refuses to run integration tests against the real DATABASE_URL", () => {
  throw new Error("TEST_DATABASE_URL must point to a separate Neon branch, not your real database.");
});
