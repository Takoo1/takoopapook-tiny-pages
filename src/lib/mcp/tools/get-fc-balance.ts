import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_fc_balance",
  title: "Get Fortune Coin balance",
  description: "Get the signed-in user's Fortune Coin (FC) balance.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const sb = supabaseForUser(ctx);
    const { data, error } = await sb
      .from("fc_balances")
      .select("balance,updated_at")
      .eq("user_id", ctx.getUserId())
      .maybeSingle();
    if (error)
      return { content: [{ type: "text", text: error.message }], isError: true };
    const balance = data?.balance ?? 0;
    return {
      content: [{ type: "text", text: `Balance: ${balance} FC` }],
      structuredContent: { balance, updated_at: data?.updated_at ?? null },
    };
  },
});
