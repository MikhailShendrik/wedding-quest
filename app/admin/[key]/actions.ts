"use server";

import { revalidatePath } from "next/cache";
import { isAdminKey } from "@/lib/admin";
import { questReward } from "@/lib/quests";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function reviewCompletion(
  key: string,
  completionId: string,
  decision: "approved" | "rejected",
) {
  if (!isAdminKey(key)) return;
  if (decision !== "approved" && decision !== "rejected") return;

  const db = supabaseAdmin();

  // Меняем статус только у заявок в ожидании: двойной клик не даст двойной XP
  const { data: updated } = await db
    .from("quest_completions")
    .update({ status: decision })
    .eq("id", completionId)
    .eq("status", "pending")
    .select("quest_id, guest_id");
  const completion = updated?.[0];
  if (!completion) return;

  if (decision === "approved") {
    const { data: quest } = await db
      .from("quests")
      .select("event_id, xp, multiplier")
      .eq("id", completion.quest_id)
      .single();
    if (quest) {
      await db.from("xp_ledger").insert({
        event_id: quest.event_id,
        guest_id: completion.guest_id,
        amount: questReward(quest),
        reason: "quest",
        ref_id: completion.quest_id,
      });
    }
  }

  revalidatePath(`/admin/${key}`);
}
