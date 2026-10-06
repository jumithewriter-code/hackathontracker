import { z } from "zod";
import { RESULTS, STATUSES } from "./types";

// Empty strings from inputs become null so "clearing a cell" clears the value.
const optionalText = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : typeof v === "string" ? v.trim() : v),
    z.string().max(max).nullable().optional(),
  );

const optionalUrl = z.preprocess(
  (v) => {
    if (typeof v !== "string" || v.trim() === "") return v === undefined ? undefined : null;
    const s = v.trim();
    return /^https?:\/\//i.test(s) ? s : `https://${s}`;
  },
  z.url({ protocol: /^https?$/ }).max(2000).nullable().optional(),
);

const dateOnly = z.preprocess(
  (v) => (v === "" ? null : v),
  z.iso.date().nullable().optional(),
);

const timestamp = z.preprocess(
  (v) => (v === "" ? null : v),
  z.iso.datetime({ offset: true }).nullable().optional(),
);

const fields = {
  name: z.string().trim().min(1, "Name is required").max(200),
  organizer: optionalText(200),
  category: optionalText(60),
  status: z.enum(STATUSES),
  startDate: dateOnly,
  deadline: timestamp,
  prize: optionalText(200),
  link: optionalUrl,
  notes: optionalText(10_000),
  result: z.enum(RESULTS).nullable().optional(),
  resultDetail: optionalText(200),
};

export const createHackathonSchema = z.object({
  ...fields,
  status: fields.status.default("CONSIDERING"),
});

export const updateHackathonSchema = z
  .object({ ...fields, archived: z.boolean() })
  .partial()
  .strict();

export type CreateHackathonInput = z.infer<typeof createHackathonSchema>;
export type UpdateHackathonInput = z.infer<typeof updateHackathonSchema>;

export const listQuerySchema = z.object({
  /** "false" (default) = active only, "true" = archived only, "all" = both */
  archived: z.enum(["true", "false", "all"]).default("false"),
  status: z.enum(STATUSES).optional(),
  category: z.string().trim().min(1).optional(),
  q: z.string().trim().min(1).optional(),
});
export type ListQuery = z.infer<typeof listQuerySchema>;
