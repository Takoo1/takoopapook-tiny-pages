import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_live_games",
  title: "List live lottery games",
  description:
    "List currently open lottery games (online / booking_stopped / live). Returns id, title, ticket_price, game_date, status, total_tickets.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).optional().describe("Max games to return (default 25)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const sb = supabaseForUser(ctx);
    const { data, error } = await sb
      .from("lottery_games")
      .select("id,title,ticket_price,game_date,status,total_tickets,headline,organising_group_name")
      .in("status", ["online", "booking_stopped", "live"])
      .order("game_date", { ascending: true })
      .limit(limit ?? 25);
    if (error)
      return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { games: data },
    };
  },
});
