// All database access goes through this file. To add multi-user support later,
// add a `userId` parameter to each function and to every `where` clause.
import type { Hackathon as HackathonRow, Prisma, PrismaClient } from "@prisma/client";
import { prisma as defaultClient } from "./db";
import type { Hackathon } from "./types";
import type { CreateHackathonInput, ListQuery, UpdateHackathonInput } from "./validation";

type Db = PrismaClient;

export function toDto(row: HackathonRow): Hackathon {
  return {
    ...row,
    startDate: row.startDate ? row.startDate.toISOString().slice(0, 10) : null,
    deadline: row.deadline?.toISOString() ?? null,
    archivedAt: row.archivedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const toDate = (v: string | null | undefined) => (v == null ? v : new Date(v));
// Date-only values are stored at UTC midnight so the calendar day never shifts.
const toDateOnly = (v: string | null | undefined) => (v == null ? v : new Date(`${v}T00:00:00Z`));

export async function listHackathons(query: Partial<ListQuery> = {}, db: Db = defaultClient) {
  const where: Prisma.HackathonWhereInput = {};
  const archived = query.archived ?? "false";
  if (archived === "false") where.archivedAt = null;
  if (archived === "true") where.archivedAt = { not: null };
  if (query.status) where.status = query.status;
  if (query.category) where.category = { equals: query.category, mode: "insensitive" };
  if (query.q) where.name = { contains: query.q, mode: "insensitive" };

  const rows = await db.hackathon.findMany({
    where,
    orderBy: [{ deadline: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
  });
  return rows.map(toDto);
}

export async function getHackathon(id: string, db: Db = defaultClient) {
  const row = await db.hackathon.findUnique({ where: { id } });
  return row ? toDto(row) : null;
}

export async function createHackathon(input: CreateHackathonInput, db: Db = defaultClient) {
  const row = await db.hackathon.create({
    data: {
      ...input,
      startDate: toDateOnly(input.startDate),
      deadline: toDate(input.deadline),
    },
  });
  return toDto(row);
}

/** Returns null if the hackathon doesn't exist. */
export async function updateHackathon(id: string, input: UpdateHackathonInput, db: Db = defaultClient) {
  const { archived, startDate, deadline, ...rest } = input;
  const data: Prisma.HackathonUpdateInput = { ...rest };
  if (startDate !== undefined) data.startDate = toDateOnly(startDate);
  if (deadline !== undefined) data.deadline = toDate(deadline);
  if (archived !== undefined) data.archivedAt = archived ? new Date() : null;

  try {
    return toDto(await db.hackathon.update({ where: { id }, data }));
  } catch (e) {
    if (isNotFound(e)) return null;
    throw e;
  }
}

/** Permanently deletes. Returns false if it didn't exist. */
export async function deleteHackathon(id: string, db: Db = defaultClient) {
  try {
    await db.hackathon.delete({ where: { id } });
    return true;
  } catch (e) {
    if (isNotFound(e)) return false;
    throw e;
  }
}

export async function listCategories(db: Db = defaultClient) {
  const rows = await db.hackathon.findMany({
    where: { category: { not: null } },
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category!).filter(Boolean);
}

function isNotFound(e: unknown) {
  return typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2025";
}
