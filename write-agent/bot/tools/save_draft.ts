import { defineTool } from "@cursor/bdk/tools";
import { z } from "zod";

const DRAFT_PREFIX = "drafts/";
const DRAFT_INDEX = "drafts/index";

type DraftRecord = {
  name: string;
  title: string;
  body: string;
  notes?: string;
  updatedAt: string;
};

type DraftIndex = {
  names: string[];
};

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export default defineTool({
  description:
    "Save or update a named writing draft for later load. Use a short recognizable slug.",
  effect: "write",
  inputSchema: z.object({
    name: z
      .string()
      .min(1)
      .describe("Short slug or title for the draft, e.g. launch-email"),
    title: z.string().min(1).describe("Human-readable title"),
    body: z.string().min(1).describe("Full draft text to store"),
    notes: z
      .string()
      .optional()
      .describe("Optional revision notes or constraints to keep with the draft"),
  }),
  async execute({ name, title, body, notes }, ctx) {
    const slug = slugify(name);
    if (!slug) {
      return { ok: false as const, error: "name must contain letters or digits" };
    }

    const record: DraftRecord = {
      name: slug,
      title: title.trim(),
      body,
      ...(notes !== undefined && notes.trim() !== ""
        ? { notes: notes.trim() }
        : {}),
      updatedAt: new Date().toISOString(),
    };

    await ctx.host.kv.put(`${DRAFT_PREFIX}${slug}`, record);

    const existing = (await ctx.host.kv.get(DRAFT_INDEX)) as
      | DraftIndex
      | undefined;
    const names = new Set(existing?.names ?? []);
    names.add(slug);
    const index: DraftIndex = { names: [...names].sort() };
    await ctx.host.kv.put(DRAFT_INDEX, index);

    return {
      ok: true as const,
      name: slug,
      title: record.title,
      updatedAt: record.updatedAt,
      charCount: body.length,
    };
  },
});
