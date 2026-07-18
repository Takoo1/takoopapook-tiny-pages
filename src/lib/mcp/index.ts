import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listMyTicketsTool from "./tools/list-my-tickets";
import getFcBalanceTool from "./tools/get-fc-balance";
import listLiveGamesTool from "./tools/list-live-games";
import getGameDetailsTool from "./tools/get-game-details";

// Issuer MUST be the direct supabase.co host, built from the project ref.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "lottery-app-mcp",
  title: "Lottery App MCP",
  version: "0.1.0",
  instructions:
    "Tools for the signed-in user's lottery account. Use list_live_games to browse open games, get_game_details for a single game, list_my_tickets to see the caller's tickets, and get_fc_balance for their Fortune Coin balance.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listLiveGamesTool, getGameDetailsTool, listMyTicketsTool, getFcBalanceTool],
});
