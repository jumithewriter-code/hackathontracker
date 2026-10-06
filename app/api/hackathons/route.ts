import { NextResponse } from "next/server";
import { badRequest, handle, readJson } from "@/lib/api";
import { createHackathon, listHackathons } from "@/lib/repo";
import { createHackathonSchema, listQuerySchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const GET = handle(async (req: Request) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = listQuerySchema.safeParse(params);
  if (!parsed.success) return badRequest(parsed.error);
  return NextResponse.json(await listHackathons(parsed.data));
});

export const POST = handle(async (req: Request) => {
  const parsed = createHackathonSchema.safeParse(await readJson(req));
  if (!parsed.success) return badRequest(parsed.error);
  return NextResponse.json(await createHackathon(parsed.data), { status: 201 });
});
