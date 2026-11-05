import { notFound } from "next/navigation";
import uk from "@/locales/uk.json";
import AutoRefresh from "@/components/AutoRefresh";
import { isAdminKey } from "@/lib/admin";
import { questReward } from "@/lib/quests";
import { supabaseAdmin } from "@/lib/supabase/server";
import { reviewCompletion } from "./actions";

type Row = {
  id: string;
  quests: { title: string; xp: number; multiplier: number };
  guests: { full_name: string; nickname: string | null };
};

export default async function AdminPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  if (!isAdminKey(key)) notFound();

  const { data, error } = await supabaseAdmin()
    .from("quest_completions")
    .select("id, quests(title, xp, multiplier), guests(full_name, nickname)")
    .eq("status", "pending")
    .order("created_at");
  if (error) console.error("admin list error:", error.message);

  const rows = (data ?? []) as unknown as Row[];
  const btn = "rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.98]";

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-6 py-12">
      <AutoRefresh seconds={5} />
      <h1 className="text-3xl font-semibold tracking-tight">{uk.admin.title}</h1>

      {rows.length === 0 && <p className="text-neutral-500">{uk.admin.empty}</p>}

      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.id} className="space-y-3 rounded-2xl bg-white/70 p-4 ring-1 ring-black/5">
            <div>
              <p className="font-medium">{r.guests.nickname ?? r.guests.full_name}</p>
              <p className="text-neutral-600">{r.quests.title}</p>
              <p className="text-sm text-amber-700">+{questReward(r.quests)} XP</p>
            </div>
            <div className="flex gap-2">
              <form action={reviewCompletion.bind(null, key, r.id, "approved")}>
                <button className={`${btn} bg-neutral-900 text-white`}>{uk.admin.approve}</button>
              </form>
              <form action={reviewCompletion.bind(null, key, r.id, "rejected")}>
                <button className={`${btn} bg-neutral-100 text-neutral-900`}>{uk.admin.reject}</button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
