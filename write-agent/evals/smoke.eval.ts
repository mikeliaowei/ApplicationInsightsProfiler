import { defineEval, includes } from "@cursor/bdk/evals";

export default defineEval({
  tags: ["smoke"],
  cases: [
    {
      id: "draft-and-save",
      description: "Draft a short email and save it when asked.",
      async test(t) {
        await t.send(
          [
            "Write a 3-sentence product update email to existing customers.",
            "Product: Northlight. Change: dark mode shipped today.",
            "Tone: warm and brief. When done, save the draft as northlight-dark-mode.",
          ].join(" "),
        );

        t.succeeded();
        t.calledTool("save_draft", {
          input: { name: /northlight-dark-mode/i },
        });
        t.check(t.reply, includes(/dark mode|Northlight/i));
      },
    },
  ],
});
