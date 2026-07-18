import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_tickets",
  title: "List my lottery tickets",
  description:
    "List lottery tickets booked by the signed-in user. RLS scopes results to the caller.",
  inputSchema: {
    game_id: z.string().uuid().optional().describe("Optionally filter by lottery game id."),
    limit: z.number().int().min(1).max(200).optional().describe("Max tickets (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ game_id, limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const sb = supabaseForUser(ctx);
    let q = sb
      .from("lottery_tickets")
      .select("id,lottery_game_id,ticket_number,status,booked_at,rendered_ticket_url")
      .eq("booked_by_user_id", ctx.getUserId())
      .order("booked_at", { ascending: false })
      .limit(limit ?? 50);
    if (game_id) q = q.eq("lottery_game_id", game_id);
    const { data, error } = await q;
    if (error)
      return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { tickets: data, count: data?.length ?? 0 },
    };
  },
});
