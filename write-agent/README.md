# Write

A Bot Development Kit (BDK) writing assistant. It drafts, edits, and rewrites
prose, and can save named drafts for later sessions.

## Run locally

```bash
cd write-agent
npx @cursor/bdk login
npx @cursor/bdk dev
```

In another terminal:

```bash
npx @cursor/bdk run --dir . --message "Rewrite this in two sentences: …"
```

Playground: `http://127.0.0.1:3000/playground`

## Check

```bash
npx @cursor/bdk validate --dir .
npx @cursor/bdk info --dir . --json
npx @cursor/bdk call save_draft --dir . --input '{"name":"demo","title":"Demo","body":"Hello"}'
npx @cursor/bdk call load_draft --dir . --input '{"name":"demo"}'
npm run check
npx @cursor/bdk eval --dir . --tag smoke
```

## Layout

- `bot/instructions.md` — always-on writing brief
- `bot/tools/save_draft.ts` / `load_draft.ts` — durable draft store (`host.kv`)
- `bot/skills/rewrite.md` — rewrite checklist
- `evals/smoke.eval.ts` — draft-and-save smoke case
