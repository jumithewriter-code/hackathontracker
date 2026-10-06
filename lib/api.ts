import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function badRequest(error: ZodError) {
  return NextResponse.json(
    { error: "Invalid input", issues: error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) },
    { status: 400 },
  );
}

export const notFound = () => NextResponse.json({ error: "Not found" }, { status: 404 });

/** Wraps a handler so unexpected errors return JSON instead of an HTML error page. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  };
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}
