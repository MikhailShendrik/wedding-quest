"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import { questIsOpen, questReward } from "@/lib/quests";

const UUID = /^[0-9a-f-]{36}$/;

export async function completeQuest(token: string, questId: string) {
  if (!/^[a-f0-9]{24}$/.test(token) || !UUID.test(questId)) return;

  const db = supabaseAdmin();
  const { data: guest } = await db
    .from("guests")
    .select("id, event_id")
    .eq("token", token)
    .maybeSingle();
  if (!guest) return;

  const { data: event } = await db
    .from("events")
    .select("game_paused")
    .eq("id", guest.event_id)
    .single();
  if (event?.game_paused) return;

  const { data: quest } = await db
    .from("quests")
    .select("id, xp, multiplier, requires_moderation, is_active, starts_at, expires_at")
    .eq("id", questId)
    .eq("event_id", guest.event_id)
    .maybeSingle();
  if (!quest || !questIsOpen(quest, Date.now())) return;

  // Уникальный индекс (quest_id, guest_id) не даст выполнить задание дважды
  const { error } = await db.from("quest_completions").insert({
    quest_id: quest.id,
    guest_id: guest.id,
    status: quest.requires_moderation ? "pending" : "approved",
  });
  if (error) return;

  if (!quest.requires_moderation) {
    await db.from("xp_ledger").insert({
      event_id: guest.event_id,
      guest_id: guest.id,
      amount: questReward(quest),
      reason: "quest",
      ref_id: quest.id,
    });
  }

  revalidatePath(`/g/${token}`, "layout");
}
