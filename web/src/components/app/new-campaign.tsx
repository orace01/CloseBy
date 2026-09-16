"use client";

import { useActionState, useState, useTransition } from "react";
import { PageContainer, PageTitle } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/ui/icons";
import { analyzeBriefAction, launchCampaign } from "@/lib/actions/campaigns";
import type { ParsedBrief } from "@/lib/brief";

const inputClass =
  "h-12 w-full rounded-[10px] border border-rule bg-paper px-3.5 text-base font-semibold text-ink focus:border-ink";

export function NewCampaign({ maxProspects }: { maxProspects: number }) {
  const [brief, setBrief] = useState("");
  const [parsed, setParsed] = useState<ParsedBrief | null>(null);
  const [analyzing, startAnalyzing] = useTransition();
  const [state, launch, launching] = useActionState(launchCampaign, undefined);

  function analyze() {
    startAnalyzing(async () => setParsed(await analyzeBriefAction(brief)));
  }

  return (
    <PageContainer size="sm">
      <PageTitle>Nouvelle campagne</PageTitle>

      <div className="flex flex-col gap-7">
        <label htmlFor="brief" className="flex flex-col gap-2.5 text-[15px] text-graphite">
          Que vendez-vous, et à qui ?
          <textarea
            id="brief"
            name="brief"
            rows={3}
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
            placeholder="Ex. : je crée des sites web pour les restaurants autour de Lyon"
            className="resize-none rounded-xl border-[1.5px] border-ink bg-paper px-4.5 py-4 text-xl leading-[1.45] text-ink placeholder:text-graphite-soft"
          />
        </label>

        {!parsed && (
          <Button className="self-start" onClick={analyze} disabled={analyzing}>
            {analyzing ? "Analyse…" : "Analyser"}
          </Button>
        )}

        {parsed && (
          <form action={launch} className="flex flex-col gap-6">
            <input type="hidden" name="brief" value={brief} />
            <p className="flex items-center gap-2 font-mono text-xs tracking-[0.04em] text-graphite uppercase">
              <span className="size-3 bg-marker" aria-hidden="true" />
              L’agent a compris
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-[13px] text-graphite">
                Offre
                <input name="offer" defaultValue={parsed.offer} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] text-graphite">
                Cible
                <input name="target" defaultValue={parsed.target} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] text-graphite">
                Zone
                <input name="zone" defaultValue={parsed.zone} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] text-graphite">
                Rayon
                <select name="radius" defaultValue="10" className={inputClass}>
                  <option value="2">2 km</option>
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="15">15 km</option>
                  <option value="25">25 km</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] text-graphite">
                Nombre de prospects
                <input name="volume" type="number" min={1} max={maxProspects} defaultValue={maxProspects} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] text-graphite">
                Ton
                <select name="tone" defaultValue="Professionnel" className={inputClass}>
                  <option>Professionnel</option>
                  <option>Direct</option>
                  <option>Chaleureux</option>
                  <option>Consultatif</option>
                </select>
              </label>
            </div>
            {state?.error && (
              <p role="alert" className="rounded-[10px] bg-danger-soft px-4 py-3 text-[15px] text-danger">
                {state.error}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1.5">
              <span className="font-mono text-[13px] text-graphite">1 crédit par e-mail rédigé</span>
              <Button type="submit" className="h-13 px-6.5" disabled={launching}>
                {launching ? "Lancement…" : "Lancer l’agent"} <ArrowRightIcon size={17} />
              </Button>
            </div>
          </form>
        )}
      </div>
    </PageContainer>
  );
}
