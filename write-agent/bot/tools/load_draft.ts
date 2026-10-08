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
    "Load a saved draft by name, or list saved draft names when name is omitted.",
  effect: "read",
  inputSchema: z.object({
    name: z
      .string()
      .optional()
      .describe("Draft slug to load. Omit to list saved drafts."),
  }),
  async execute({ name }, ctx) {
    if (name === undefined || name.trim() === "") {
      const index = (await ctx.host.kv.get(DRAFT_INDEX)) as
        | DraftIndex
        | undefined;
      return {
        ok: true as const,
        drafts: index?.names ?? [],
      };
    }

    const slug = slugify(name);
    if (!slug) {
      return { ok: false as const, error: "name must contain letters or digits" };
    }

    const record = (await ctx.host.kv.get(
      `${DRAFT_PREFIX}${slug}`,
    )) as DraftRecord | undefined;

    if (record === undefined) {
      return { ok: false as const, error: `no draft named ${slug}` };
    }

    return {
      ok: true as const,
      draft: record,
    };
  },
});
