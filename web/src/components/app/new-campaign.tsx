"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PageContainer, PageTitle } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/ui/icons";
import { parseBrief, type ParsedBrief } from "@/lib/brief";

const inputClass =
  "h-12 w-full rounded-[10px] border border-rule bg-paper px-3.5 text-base font-semibold text-ink focus:border-ink";

export function NewCampaign() {
  const router = useRouter();
  const [brief, setBrief] = useState("");
  const [parsed, setParsed] = useState<ParsedBrief | null>(null);

  function launch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Until the agent API exists, every launch opens the sample campaign.
    router.push("/campagnes/restaurants-lyon");
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
          <Button className="self-start" onClick={() => setParsed(parseBrief(brief))}>
            Analyser
          </Button>
        )}

        {parsed && (
          <form onSubmit={launch} className="flex flex-col gap-6">
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
                <select name="radius" defaultValue="15" className={inputClass}>
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="15">15 km</option>
                  <option value="25">25 km</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] text-graphite">
                Nombre de prospects
                <input name="volume" type="number" min={10} max={500} step={10} defaultValue={50} className={inputClass} />
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
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1.5">
              <span className="font-mono text-[13px] text-graphite">1 crédit par prospect analysé</span>
              <Button type="submit" className="h-13 px-6.5">
                Lancer l’agent <ArrowRightIcon size={17} />
              </Button>
            </div>
          </form>
        )}
      </div>
    </PageContainer>
  );
}
