"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";
import { Wordmark } from "@/components/ui/misc";
import { cn, formatNumber } from "@/lib/format";
import { adminIncidents, adminStats } from "@/lib/mock-data";

export function AdminConsole() {
  const [resolved, setResolved] = useState<string[]>([]);
  const open = adminIncidents.length - resolved.length;

  const stats = [
    { label: "utilisateurs", value: formatNumber(adminStats.users) },
    { label: "campagnes actives", value: formatNumber(adminStats.activeCampaigns) },
    { label: "envois aujourd’hui", value: formatNumber(adminStats.sendsToday) },
    { label: "incidents ouverts", value: String(open), alert: open > 0 },
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
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={cn("flex flex-col-reverse gap-2 py-6.5", i % 2 === 1 && "pl-7 border-l border-rule", i >= 2 && "lg:border-l lg:pl-7")}
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
            À traiter
          </h2>
          <ul className="border-t border-rule">
            {adminIncidents.map((incident) => {
              const done = resolved.includes(incident.id);
              return (
                <li
                  key={incident.id}
                  className="grid min-h-17 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 border-b border-rule-soft py-3 md:grid-cols-[140px_minmax(0,1fr)_150px_140px]"
                >
                  <span className={cn("font-mono text-xs tracking-[0.04em] uppercase", incident.critical ? "text-danger" : "text-graphite")}>
                    {incident.kind}
                  </span>
                  <span className="order-3 col-span-2 font-semibold md:order-none md:col-span-1">{incident.label}</span>
                  <span className="hidden text-graphite md:inline">{incident.when}</span>
                  <span className="flex justify-end">
                    {done ? (
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-success">
                        <CheckIcon size={15} strokeWidth={2.5} />
                        Traité
                      </span>
                    ) : (
                      <Button variant="secondary" size="sm" onClick={() => setResolved((prev) => [...prev, incident.id])}>
                        {incident.action}
                      </Button>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}
