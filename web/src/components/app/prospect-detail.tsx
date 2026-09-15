"use client";

import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/button";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { StatusLabel } from "@/components/ui/misc";
import { formatDate, formatKm } from "@/lib/format";
import { useAppStore } from "@/lib/store";

export function ProspectDetail({ prospectId }: { prospectId: string }) {
  const { state, dispatch } = useAppStore();
  const prospect = state.prospects.find((p) => p.id === prospectId);
  if (!prospect) return null;

  const excluded = prospect.status === "excluded";
  const rows = [
    { label: "Site", value: prospect.website ?? "Aucun site trouvé" },
    { label: "E-mail", value: prospect.email ?? "Aucun e-mail public", note: prospect.emailSource },
    { label: "Code NAF", value: prospect.nafCode, mono: true },
    { label: "Source", value: prospect.source },
    { label: "Collecté le", value: formatDate(prospect.collectedAt), mono: true },
  ].filter((row) => row.value);

  function toggleExclusion() {
    if (!prospect) return;
    const restored = prospect.draft ? "to_review" : "no_email";
    dispatch({ type: "setProspectStatus", id: prospect.id, status: excluded ? restored : "excluded" });
  }

  return (
    <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_520px]">
      <div className="flex flex-col gap-8 px-4 py-10 sm:px-16">
        <Link href="/prospects" className="flex items-center gap-1.5 self-start text-[15px] text-graphite hover:text-ink">
          <ArrowLeftIcon size={17} />
          Prospects
        </Link>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-[40px] leading-none font-semibold tracking-[-0.04em] sm:text-[52px]">{prospect.name}</h1>
            <StatusLabel status={prospect.status} className="rounded-full bg-desk px-3 py-1.5" />
          </div>
          <p className="text-lg text-graphite">
            {prospect.activity} · {prospect.city} · à {formatKm(prospect.distanceKm)}
          </p>
        </div>

        <dl className="flex max-w-[560px] flex-col border-t border-rule">
          {rows.map((row) => (
            <div key={row.label} className="flex min-h-14 flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-rule-soft py-3">
              <dt className="text-graphite">{row.label}</dt>
              <dd className={row.mono ? "font-mono text-[15px]" : "font-semibold"}>
                {row.value}
                {row.note && <span className="ml-2 text-sm font-normal text-graphite">({row.note})</span>}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap gap-2.5">
          {prospect.draft && !excluded && (
            <ButtonLink href={`/campagnes/${prospect.campaignId}/relecture?prospect=${prospect.id}`} className="h-12.5">
              Voir l’e-mail
            </ButtonLink>
          )}
          <Button variant="secondary" className="h-12.5" onClick={toggleExclusion}>
            {excluded ? "Annuler l’exclusion" : "Exclure ce prospect"}
          </Button>
        </div>
      </div>

      <aside className="flex flex-col gap-6 bg-desk px-4 py-10 sm:px-14 lg:pt-26">
        <h2 className="font-mono text-xs tracking-[0.04em] text-graphite uppercase">Ce que l’agent a trouvé</h2>
        {prospect.facts.length === 0 ? (
          <p className="text-graphite">Aucune information exploitable sur ce prospect.</p>
        ) : (
          <ul className="flex flex-col gap-6">
            {prospect.facts.map((fact) => (
              <li key={fact.id} className="flex gap-3.5">
                <span className="mt-1.5 size-3.5 shrink-0 bg-marker shadow-[inset_0_0_0_1px_var(--color-ink)]" aria-hidden="true" />
                <div className="flex flex-col gap-1.5">
                  <span className="text-[17px] leading-[1.45]">{fact.text}</span>
                  <span className="font-mono text-xs text-graphite">
                    {fact.source} · {formatDate(fact.collectedAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
