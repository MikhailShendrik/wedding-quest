"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function setRsvp(token: string, rsvp: "yes" | "no") {
  if (!/^[a-f0-9]{24}$/.test(token)) return;
  if (rsvp !== "yes" && rsvp !== "no") return;

  const db = supabaseAdmin();
  const { data: guest } = await db
    .from("guests")
    .select("id, event_id")
    .eq("token", token)
    .maybeSingle();
  if (!guest) return;

  await db.from("guests").update({ rsvp }).eq("id", guest.id);

  if (rsvp === "yes") {
    // Уникальный индекс не даст начислить XP второй раз, ошибку игнорируем
    await db.from("xp_ledger").insert({
      event_id: guest.event_id,
      guest_id: guest.id,
      amount: 50,
      reason: "rsvp",
    });
  }

  revalidatePath(`/g/${token}`);
}
