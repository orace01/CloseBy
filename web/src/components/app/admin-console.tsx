import Link from "next/link";
import { Wordmark } from "@/components/ui/misc";
import { cn, formatNumber } from "@/lib/format";

export interface AdminIncident {
  id: string;
  name: string;
  workspace: string;
  note: string;
  updatedAt: string;
}

export function AdminConsole({
  stats,
  incidents,
}: {
  stats: { users: number; activeCampaigns: number; draftsToday: number };
  incidents: AdminIncident[];
}) {
  const figures = [
    { label: "utilisateurs", value: formatNumber(stats.users) },
    { label: "campagnes en cours", value: formatNumber(stats.activeCampaigns) },
    { label: "e-mails rédigés aujourd’hui", value: formatNumber(stats.draftsToday) },
    { label: "campagnes bloquées", value: String(incidents.length), alert: incidents.length > 0 },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-16 items-center justify-between border-b border-rule px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <Wordmark className="text-[21px]" />
          <span className="bg-ink px-2 py-1 font-mono text-[11px] tracking-[0.08em] text-paper">ADMIN</span>
        </div>
        <Link href="/tableau-de-bord" className="text-[15px] font-semibold">
          Quitter
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-[1184px] flex-col gap-10 px-4 pt-11 pb-20 sm:px-8">
        <h1 className="text-4xl leading-none font-semibold tracking-[-0.035em] sm:text-[44px]">Console</h1>

        <dl className="grid grid-cols-2 border-y border-rule lg:grid-cols-4">
          {figures.map((stat, i) => (
            <div
              key={stat.label}
              className={cn("flex flex-col-reverse gap-2 py-6.5", i % 2 === 1 && "border-l border-rule pl-7", i >= 2 && "lg:border-l lg:pl-7")}
            >
              <dt className="text-[15px] text-graphite">{stat.label}</dt>
              <dd className={cn("text-[44px] leading-none font-semibold tracking-[-0.04em] tabular-nums", stat.alert && "text-danger")}>
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <section className="flex flex-col gap-3" aria-labelledby="incidents">
          <h2 id="incidents" className="text-xl font-semibold">
            Campagnes bloquées
          </h2>
          {incidents.length === 0 ? (
            <p className="text-graphite">Rien à traiter.</p>
          ) : (
            <ul className="border-t border-rule">
              {incidents.map((incident) => (
                <li
                  key={incident.id}
                  className="grid min-h-17 gap-x-6 gap-y-1 border-b border-rule-soft py-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_160px] md:items-center"
                >
                  <span className="font-semibold">
                    {incident.name} <span className="font-normal text-graphite">· {incident.workspace}</span>
                  </span>
                  <span className="text-graphite">{incident.note}</span>
                  <span className="font-mono text-xs text-graphite">
                    {new Date(incident.updatedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
