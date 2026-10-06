import { describe, expect, it } from "vitest";
import { createHackathonSchema, listQuerySchema, updateHackathonSchema } from "@/lib/validation";

describe("createHackathonSchema", () => {
  it("requires a name and defaults status to CONSIDERING", () => {
    expect(createHackathonSchema.safeParse({}).success).toBe(false);
    expect(createHackathonSchema.safeParse({ name: "   " }).success).toBe(false);
    expect(createHackathonSchema.parse({ name: " X " })).toMatchObject({ name: "X", status: "CONSIDERING" });
  });

  it("turns empty strings into null and adds https:// to bare links", () => {
    const parsed = createHackathonSchema.parse({ name: "X", organizer: "  ", link: "devpost.com/x" });
    expect(parsed.organizer).toBeNull();
    expect(parsed.link).toBe("https://devpost.com/x");
  });

  it("rejects bad enums, dates and non-http links", () => {
    expect(createHackathonSchema.safeParse({ name: "X", status: "OVERDUE" }).success).toBe(false);
    expect(createHackathonSchema.safeParse({ name: "X", startDate: "10/04/2026" }).success).toBe(false);
    expect(createHackathonSchema.safeParse({ name: "X", deadline: "tomorrow" }).success).toBe(false);
    expect(createHackathonSchema.safeParse({ name: "X", link: "javascript:alert(1)" }).success).toBe(false);
  });
});

describe("updateHackathonSchema", () => {
  it("accepts partial updates, archive flag, and clearing fields", () => {
    expect(updateHackathonSchema.parse({ archived: true })).toEqual({ archived: true });
    expect(updateHackathonSchema.parse({ deadline: null, result: null })).toEqual({ deadline: null, result: null });
  });

  it("rejects unknown fields (e.g. trying to set id or archivedAt directly)", () => {
    expect(updateHackathonSchema.safeParse({ id: "x" }).success).toBe(false);
    expect(updateHackathonSchema.safeParse({ archivedAt: "2026-01-01T00:00:00Z" }).success).toBe(false);
  });
});

describe("listQuerySchema", () => {
  it("defaults to active rows only", () => {
    expect(listQuerySchema.parse({})).toEqual({ archived: "false" });
    expect(listQuerySchema.safeParse({ archived: "yes" }).success).toBe(false);
  });
});
