import Link from "next/link";
import { notFound } from "next/navigation";
import uk from "@/locales/uk.json";
import AutoRefresh from "@/components/AutoRefresh";
import { getGuestByToken } from "@/lib/guest";
import { getQuests } from "@/lib/quests";
import { completeQuest } from "./actions";

export default async function QuestsPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const guest = await getGuestByToken(token);
  if (!guest) notFound();

  const quests = await getQuests(guest.id);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-6 py-12">
      <AutoRefresh seconds={5} />

      <Link href={`/g/${token}`} className="text-sm text-amber-700">
        {uk.leaderboard.back}
      </Link>
      <h1 className="text-4xl font-semibold tracking-tight">{uk.quests.title}</h1>

      {quests.length === 0 && <p className="text-neutral-500">{uk.quests.empty}</p>}

      <ul className="space-y-3">
        {quests.map((q) => (
          <li key={q.id} className="space-y-3 rounded-3xl bg-white/70 p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold">{q.title}</h2>
              <span className="shrink-0 font-semibold tabular-nums text-amber-700">
                +{q.reward} XP
              </span>
            </div>
            {q.description && <p className="text-sm text-neutral-500">{q.description}</p>}
            {q.requires_moderation && q.status === "none" && (
              <p className="text-xs text-neutral-400">{uk.quests.moderated}</p>
            )}

            {q.status === "none" && (
              <form action={completeQuest.bind(null, token, q.id)}>
                <button className="w-full rounded-2xl bg-neutral-900 px-5 py-3 font-medium text-white transition active:scale-[0.98]">
                  {uk.quests.do}
                </button>
              </form>
            )}
            {q.status === "pending" && (
              <p className="text-sm text-neutral-500">⏳ {uk.quests.pending}</p>
            )}
            {q.status === "approved" && (
              <p className="text-sm font-medium text-amber-700">✓ {uk.quests.approved}</p>
            )}
            {q.status === "rejected" && (
              <p className="text-sm text-neutral-400">{uk.quests.rejected}</p>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
