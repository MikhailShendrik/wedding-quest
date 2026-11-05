import Link from "next/link";
import { notFound } from "next/navigation";
import uk from "@/locales/uk.json";
import { getGuestByToken } from "@/lib/guest";
import { getGuestXp } from "@/lib/xp";
import { getSchedule } from "@/lib/schedule";
import { setRsvp } from "./actions";

export default async function GuestHome({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const guest = await getGuestByToken(token);
  if (!guest) notFound();

  const [xp, schedule] = await Promise.all([
    getGuestXp(guest.id),
    getSchedule(guest.id),
  ]);

  const firstName = (guest.nickname ?? guest.full_name).split(" ")[0];
  const date = new Date(guest.events.starts_at).toLocaleString("uk-UA", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const btn =
    "w-full rounded-2xl px-5 py-4 text-base font-medium transition active:scale-[0.98]";

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-6 py-12">
      <header>
        <p className="text-sm tracking-widest text-amber-700 uppercase">
          {uk.guest.invited}
        </p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight">
          {uk.guest.hello.replace("{name}", firstName)}
        </h1>
        <p className="mt-4 text-2xl text-neutral-500">{guest.events.couple_names}</p>
      </header>

      <section className="space-y-5 rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur">
        <div>
          <p className="text-xs uppercase text-neutral-400">{uk.guest.date}</p>
          <p className="text-lg">{date}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-neutral-400">{uk.guest.place}</p>
          <p className="text-lg">{guest.events.venue_name}</p>
        </div>
      </section>

      <section className="rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-black/5">
        <p className="text-xs uppercase text-neutral-400">{uk.guest.xp}</p>
        <p className="mt-1 text-4xl font-semibold tabular-nums">{xp} XP</p>
      </section>
      <Link
        href={`/g/${token}/leaderboard`}
        className="rounded-3xl bg-neutral-900 px-6 py-5 text-center font-medium text-white transition active:scale-[0.98]"
      >
        {uk.leaderboard.open}
      </Link>

      <Link
        href={`/g/${token}/quests`}
        className="rounded-3xl bg-amber-700 px-6 py-5 text-center font-medium text-white transition active:scale-[0.98]"


      >
        {uk.quests.open}


      </Link>


      <Link
        href={`/g/${token}/leaderboard`}
        className="rounded-3xl bg-neutral-900 px-6 py-5 text-center font-medium text-white transition active:scale-[0.98]"
      >
        {uk.leaderboard.open}
      </Link>

      <section className="space-y-4 rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-black/5">
        <h2 className="text-xl font-semibold">{uk.guest.rsvpTitle}</h2>

        {guest.rsvp === "pending" && (
          <p className="text-sm text-amber-700">{uk.guest.rsvpBonus}</p>
        )}
        {guest.rsvp === "yes" && (
          <p className="text-neutral-600">{uk.guest.rsvpYesDone}</p>
        )}
        {guest.rsvp === "no" && (
          <p className="text-neutral-600">{uk.guest.rsvpNoDone}</p>
        )}

        <div className="flex gap-3">
          <form action={setRsvp.bind(null, token, "yes")} className="flex-1">
            <button
              className={`${btn} ${
                guest.rsvp === "yes"
                  ? "bg-amber-700 text-white"
                  : "bg-neutral-900 text-white"
              }`}
            >
              {uk.guest.rsvpYes}
            </button>
          </form>
          <form action={setRsvp.bind(null, token, "no")} className="flex-1">
            <button
              className={`${btn} ${
                guest.rsvp === "no"
                  ? "bg-neutral-300 text-neutral-900"
                  : "bg-neutral-100 text-neutral-900"
              }`}
            >
              {uk.guest.rsvpNo}
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-4 text-xl font-semibold">{uk.guest.program}</h2>
        <ol className="space-y-5">
          {schedule.map((item) => (
            <li key={item.id} className="flex gap-4">
              <time className="w-14 shrink-0 text-lg font-medium tabular-nums text-amber-700">
                {new Date(item.starts_at).toLocaleTimeString("uk-UA", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
              <div>
                <p className="font-medium">{item.title}</p>
                {item.description && (
                  <p className="text-sm text-neutral-500">{item.description}</p>
                )}
                {item.location && (
                  <p className="text-sm text-neutral-400">{item.location}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
