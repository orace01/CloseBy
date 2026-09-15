"use client";

import Link from "next/link";
import { useState } from "react";
import { PageContainer, PageTitle } from "@/components/app/page-shell";
import { SearchIcon } from "@/components/ui/icons";
import { StatusLabel } from "@/components/ui/misc";
import { formatKm } from "@/lib/format";
import { useAppStore } from "@/lib/store";

export function ProspectsTable() {
  const { state } = useAppStore();
  const [query, setQuery] = useState("");
  const needle = query.trim().toLocaleLowerCase("fr-FR");
  const rows = needle
    ? state.prospects.filter((p) =>
        [p.name, p.activity, p.city].some((value) => value.toLocaleLowerCase("fr-FR").includes(needle)),
      )
    : state.prospects;

  return (
    <PageContainer className="gap-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-baseline gap-3.5">
          <PageTitle>Prospects</PageTitle>
          <span className="font-mono text-sm text-graphite">{state.prospects.length}</span>
        </div>
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Rechercher un prospect</span>
          <SearchIcon size={16} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-graphite" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher"
            className="h-11.5 w-full rounded-[10px] border border-line bg-paper pr-4 pl-10 text-[15px] placeholder:text-graphite-soft focus:border-ink"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-[15px]">
          <thead>
            <tr className="h-10 border-b border-rule font-mono text-[11px] tracking-[0.06em] text-graphite uppercase">
              <th scope="col" className="px-4 font-normal">Nom</th>
              <th scope="col" className="px-4 font-normal">Activité</th>
              <th scope="col" className="px-4 font-normal">Ville</th>
              <th scope="col" className="px-4 font-normal">Distance</th>
              <th scope="col" className="px-4 font-normal">E-mail</th>
              <th scope="col" className="px-4 font-normal">Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((prospect) => (
              <tr key={prospect.id} className="relative h-15 border-b border-rule-soft transition-colors hover:bg-desk/60">
                <td className="px-4 font-semibold">
                  <Link href={`/prospects/${prospect.id}`} className="after:absolute after:inset-0">
                    {prospect.name}
                  </Link>
                </td>
                <td className="px-4 text-graphite">{prospect.activity}</td>
                <td className="px-4 text-graphite">{prospect.city}</td>
                <td className="px-4 font-mono text-[13px] text-graphite">{formatKm(prospect.distanceKm)}</td>
                <td className="px-4 font-mono text-[13px]">
                  {prospect.email ? "Trouvé" : <span className="text-disabled">—</span>}
                </td>
                <td className="px-4">
                  <StatusLabel status={prospect.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="px-4 py-10 text-graphite">Aucun prospect ne correspond à « {query} ».</p>}
      </div>
    </PageContainer>
  );
}
