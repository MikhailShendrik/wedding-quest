import "server-only";
import { supabaseAdmin } from "./supabase/server";

export type ScheduleItem = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  location: string | null;
};

export async function getSchedule(guestId: string): Promise<ScheduleItem[]> {
  const db = supabaseAdmin();
  const { data: guest } = await db
    .from("guests")
    .select("event_id")
    .eq("id", guestId)
    .maybeSingle();
  if (!guest) return [];

  const { data } = await db
    .from("schedule_items")
    .select("id, title, description, starts_at, location")
    .eq("event_id", guest.event_id)
    .order("starts_at");
  return data ?? [];
}
