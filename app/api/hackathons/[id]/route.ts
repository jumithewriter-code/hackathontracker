import { NextResponse } from "next/server";
import { badRequest, handle, notFound, readJson } from "@/lib/api";
import { deleteHackathon, getHackathon, updateHackathon } from "@/lib/repo";
import { updateHackathonSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  const h = await getHackathon((await params).id);
  return h ? NextResponse.json(h) : notFound();
});

export const PATCH = handle(async (req: Request, { params }: Ctx) => {
  const parsed = updateHackathonSchema.safeParse(await readJson(req));
  if (!parsed.success) return badRequest(parsed.error);
  const h = await updateHackathon((await params).id, parsed.data);
  return h ? NextResponse.json(h) : notFound();
});

export const DELETE = handle(async (_req: Request, { params }: Ctx) => {
  return (await deleteHackathon((await params).id)) ? new NextResponse(null, { status: 204 }) : notFound();
});
