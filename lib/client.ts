"use client";
// Browser-side data layer: fetch helpers + TanStack Query hooks with optimistic updates.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Hackathon, Result, Status } from "./types";

export const HACKATHONS_KEY = ["hackathons"] as const;
export const CATEGORIES_KEY = ["categories"] as const;

/** Fields the UI can change. `archived` maps to archivedAt on the server. */
export type HackathonPatch = Partial<{
  name: string;
  organizer: string | null;
  category: string | null;
  status: Status;
  startDate: string | null;
  deadline: string | null;
  prize: string | null;
  link: string | null;
  notes: string | null;
  result: Result | null;
  resultDetail: string | null;
  archived: boolean;
}>;

export class ApiError extends Error {}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (res.status === 401) {
    window.location.href = "/login";
    throw new ApiError("Signed out");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail = body?.issues?.[0]?.message ?? body?.error ?? res.statusText;
    throw new ApiError(detail);
  }
  return (res.status === 204 ? null : await res.json()) as T;
}

export const api = {
  list: () => request<Hackathon[]>("/api/hackathons?archived=all"),
  categories: () => request<string[]>("/api/categories"),
  create: (data: HackathonPatch & { name: string }) =>
    request<Hackathon>("/api/hackathons", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, patch: HackathonPatch) =>
    request<Hackathon>(`/api/hackathons/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  remove: (id: string) => request<null>(`/api/hackathons/${id}`, { method: "DELETE" }),
};

export function useHackathons(initialData?: Hackathon[]) {
  return useQuery({ queryKey: HACKATHONS_KEY, queryFn: api.list, initialData });
}

export function useCategories() {
  return useQuery({ queryKey: CATEGORIES_KEY, queryFn: api.categories });
}

/** Applies a patch locally (what the UI shows before the server confirms). */
function applyPatch(h: Hackathon, patch: HackathonPatch): Hackathon {
  const { archived, ...rest } = patch;
  return {
    ...h,
    ...rest,
    ...(archived === undefined ? {} : { archivedAt: archived ? new Date().toISOString() : null }),
  };
}

export function useHackathonMutations(onError: (message: string) => void) {
  const qc = useQueryClient();

  const snapshot = async () => {
    await qc.cancelQueries({ queryKey: HACKATHONS_KEY });
    return qc.getQueryData<Hackathon[]>(HACKATHONS_KEY);
  };
  const rollback = (prev: Hackathon[] | undefined, err: Error) => {
    if (prev) qc.setQueryData(HACKATHONS_KEY, prev);
    onError(err.message);
  };
  const refresh = () => {
    qc.invalidateQueries({ queryKey: HACKATHONS_KEY });
    qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
  };

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: HackathonPatch }) => api.update(id, patch),
    onMutate: async ({ id, patch }) => {
      const prev = await snapshot();
      qc.setQueryData<Hackathon[]>(HACKATHONS_KEY, (list) => list?.map((h) => (h.id === id ? applyPatch(h, patch) : h)));
      return { prev };
    },
    onSuccess: (saved) =>
      qc.setQueryData<Hackathon[]>(HACKATHONS_KEY, (list) => list?.map((h) => (h.id === saved.id ? saved : h))),
    onError: (err, _vars, ctx) => rollback(ctx?.prev, err),
    onSettled: refresh,
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.remove(id),
    onMutate: async (id) => {
      const prev = await snapshot();
      qc.setQueryData<Hackathon[]>(HACKATHONS_KEY, (list) => list?.filter((h) => h.id !== id));
      return { prev };
    },
    onError: (err, _id, ctx) => rollback(ctx?.prev, err),
    onSettled: refresh,
  });

  const create = useMutation({
    mutationFn: api.create,
    onSuccess: (saved) => qc.setQueryData<Hackathon[]>(HACKATHONS_KEY, (list) => [...(list ?? []), saved]),
    onError: (err) => onError(err.message),
    onSettled: refresh,
  });

  return { update, remove, create };
}
