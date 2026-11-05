import "server-only";
import { supabaseAdmin } from "./supabase/server";

export type LeaderRow = {
  guest_id: string;
  nickname: string | null;
  full_name: string;
  xp: number;
  position: number;
};

export async function getLeaderboard(eventId: string): Promise<LeaderRow[]> {
  const { data, error } = await supabaseAdmin()
    .from("leaderboard")
    .select("guest_id, nickname, full_name, xp, position")
    .eq("event_id", eventId)
    .order("xp", { ascending: false })
    .limit(50);

  if (error) {
    console.error("getLeaderboard error:", error.message);
    return [];
  }
  return data ?? [];
}
