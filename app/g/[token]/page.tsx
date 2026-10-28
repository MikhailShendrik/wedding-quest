import { notFound } from "next/navigation";
import uk from "@/locales/uk.json";
import { getGuestByToken } from "@/lib/guest";

export default async function GuestHome({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const guest = await getGuestByToken(token);
  if (!guest) notFound();

  const firstName = (guest.nickname ?? guest.full_name).split(" ")[0];
  const date = new Date(guest.events.starts_at).toLocaleString("uk-UA", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-10 px-6">
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
    </main>
  );
}
