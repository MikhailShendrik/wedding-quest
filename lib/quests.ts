import "server-only";
import { supabaseAdmin } from "./supabase/server";

export type QuestStatus = "none" | "pending" | "approved" | "rejected";

export type QuestView = {
  id: string;
  title: string;
  description: string | null;
  reward: number;
  requires_moderation: boolean;
  status: QuestStatus;
};

export function questReward(q: { xp: number; multiplier: number | string }) {
  return Math.round(q.xp * Number(q.multiplier));
}

export function questIsOpen(
  q: { is_active: boolean; starts_at: string | null; expires_at: string | null },
  now: number,
) {
  if (!q.is_active) return false;
  if (q.starts_at && new Date(q.starts_at).getTime() > now) return false;
  if (q.expires_at && new Date(q.expires_at).getTime() <= now) return false;
  return true;
}

export async function getQuests(guestId: string): Promise<QuestView[]> {
  const db = supabaseAdmin();
  const { data: guest } = await db
    .from("guests")
    .select("event_id")
    .eq("id", guestId)
    .maybeSingle();
  if (!guest) return [];

  const [{ data: quests }, { data: done }] = await Promise.all([
    db
      .from("quests")
      .select("id, title, description, xp, multiplier, requires_moderation, is_active, starts_at, expires_at")
      .eq("event_id", guest.event_id)
      .order("xp"),
    db.from("quest_completions").select("quest_id, status").eq("guest_id", guestId),
  ]);

  const statusByQuest = new Map<string, QuestStatus>(
    (done ?? []).map((c) => [c.quest_id as string, c.status as QuestStatus]),
  );
  const now = Date.now();

  return (quests ?? [])
    .filter((q) => questIsOpen(q, now) || statusByQuest.has(q.id))
    .map((q) => ({
      id: q.id,
      title: q.title,
      description: q.description,
      reward: questReward(q),
      requires_moderation: q.requires_moderation,
      status: statusByQuest.get(q.id) ?? "none",
    }));
}
