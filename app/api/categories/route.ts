import { NextResponse } from "next/server";
import { handle } from "@/lib/api";
import { listCategories } from "@/lib/repo";

export const dynamic = "force-dynamic";

export const GET = handle(async () => NextResponse.json(await listCategories()));
