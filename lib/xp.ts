import "server-only";
import { supabaseAdmin } from "./supabase/server";

export async function getGuestXp(guestId: string): Promise<number> {
  const { data } = await supabaseAdmin()
    .from("xp_ledger")
    .select("amount")
    .eq("guest_id", guestId);
  return (data ?? []).reduce((sum, row) => sum + row.amount, 0);
}
