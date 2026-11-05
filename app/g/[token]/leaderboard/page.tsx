import Link from "next/link";
import { notFound } from "next/navigation";
import uk from "@/locales/uk.json";
import AutoRefresh from "@/components/AutoRefresh";
import { getGuestByToken } from "@/lib/guest";
import { getLeaderboard } from "@/lib/leaderboard";
import { supabaseAdmin } from "@/lib/supabase/server";


export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const guest = await getGuestByToken(token);
  if (!guest) notFound();

  const { data: row } = await supabaseAdmin()
    .from("guests")
    .select("event_id")
    .eq("id", guest.id)
    .single();
  const rows = await getLeaderboard(row!.event_id);

  const medal = ["🥇", "🥈", "🥉"];

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-6 py-12">
      <AutoRefresh seconds={5} />

      <Link href={`/g/${token}`} className="text-sm text-amber-700">
        {uk.leaderboard.back}
      </Link>
      <h1 className="text-4xl font-semibold tracking-tight">
        {uk.leaderboard.title}
      </h1>

      <ol className="space-y-3">
        {rows.map((r) => {
          const isMe = r.guest_id === guest.id;
          return (
            <li
              key={r.guest_id}
              className={`flex items-center gap-4 rounded-2xl p-4 ring-1 ring-black/5 ${
                isMe ? "bg-amber-50" : "bg-white/70"
              }`}
            >
              <span className="w-8 text-center text-xl tabular-nums">
                {medal[r.position - 1] ?? r.position}
              </span>
              <span className="flex-1 font-medium">
                {r.nickname ?? r.full_name.split(" ")[0]}
                {isMe && (
                  <span className="ml-2 text-xs text-amber-700">
                    {uk.leaderboard.you}
                  </span>
                )}
              </span>
              <span className="font-semibold tabular-nums">{r.xp} XP</span>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
