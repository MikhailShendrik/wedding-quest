import "server-only";
import { supabaseAdmin } from "./supabase/server";

export type GuestView = {
  id: string;
  full_name: string;
  nickname: string | null;
  rsvp: "pending" | "yes" | "no";
  opened_at: string | null;
  events: {
    title: string;
    couple_names: string;
    starts_at: string;
    venue_name: string | null;
  };
};

export async function getGuestByToken(token: string): Promise<GuestView | null> {
  if (!/^[a-f0-9]{24}$/.test(token)) return null;

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("guests")
    .select("id, full_name, nickname, rsvp, opened_at, events(title, couple_names, starts_at, venue_name)")
    .eq("token", token)
    .maybeSingle();

  if (error) {
    console.error("getGuestByToken error:", error.message, error.code);
    return null;
  }

  const guest = data as unknown as GuestView | null;
  if (!guest) {
    console.error("getGuestByToken: гость с таким токеном не найден");
    return null;
  }

  if (!guest.opened_at) {
    await db.from("guests").update({ opened_at: new Date().toISOString() }).eq("id", guest.id);
  }
  return guest;
}
