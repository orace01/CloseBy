"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { CalloutLink, PageContainer } from "@/components/app/page-shell";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/icons";
import { setCampaignPaused } from "@/lib/actions/campaigns";
import { cn, formatNumber, plural } from "@/lib/format";
import type { Campaign } from "@/lib/types";

export function CampaignProgress({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const { found, sitesRead, drafted } = campaign.progress;
  const isDone = campaign.status === "done";
  const isPaused = campaign.status === "paused";
  const isRunning = campaign.status === "running";
  const readingDone = campaign.sourced && sitesRead >= found;
  const percent = campaign.sourced ? Math.round((sitesRead / Math.max(found, 1)) * 100) : 0;

  // Live progress: refresh the server data while the agent works.
  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(timer);
  }, [isRunning, router]);

  const title = isDone ? "Campagne terminée" : isPaused ? "Agent en pause" : "L’agent travaille…";

  const steps = [
    { label: "Recherche des entreprises", value: campaign.sourced ? formatNumber(found) : "…", done: campaign.sourced },
    { label: "Analyse des entreprises", value: `${formatNumber(sitesRead)} / ${formatNumber(found)}`, done: readingDone },
    { label: "Rédaction des e-mails", value: `${formatNumber(drafted)} prêts`, done: isDone },
  ];

  return (
    <PageContainer size="sm" className="gap-9 sm:pt-20">
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs tracking-[0.04em] text-graphite uppercase">{campaign.name}</p>
        <h1 className="text-4xl leading-none font-semibold tracking-[-0.035em] sm:text-[44px]">{title}</h1>
      </div>

      <div
        role="progressbar"
        aria-label="Analyse des entreprises"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 overflow-hidden rounded-sm bg-desk"
      >
        <div className="h-full rounded-sm bg-ink transition-[width] duration-700" style={{ width: `${percent}%` }} />
      </div>

      <ol>
        {steps.map((step) => (
          <li key={step.label} className="flex min-h-16 items-center gap-4 border-b border-rule-soft">
            {step.done ? (
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-paper">
                <CheckIcon size={15} strokeWidth={3} />
              </span>
            ) : (
              <span className="flex size-7 shrink-0 items-center justify-center" aria-hidden="true">
                <span className={cn("size-3.5 bg-marker shadow-[inset_0_0_0_1px_var(--color-ink)]", isRunning && "animate-pulse-soft")} />
              </span>
            )}
            <span className="flex-1 text-lg">{step.label}</span>
            <span className="font-mono text-sm text-graphite">{step.value}</span>
          </li>
        ))}
      </ol>

      {campaign.withoutWebsite > 0 && (
        <CalloutLink href={`/prospects?filtre=sans-site&campagne=${campaign.id}`} action="Voir">
          {plural(campaign.withoutWebsite, "entreprise")} sans site web
        </CalloutLink>
      )}

      {campaign.note && (
        <p role="status" className="rounded-[10px] bg-desk px-4.5 py-4 text-base leading-snug">
          {campaign.note}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        {!isDone ? (
          <button
            type="button"
            disabled={pending}
            className="text-base font-semibold disabled:text-graphite"
            onClick={() => startTransition(() => setCampaignPaused(campaign.id, !isPaused))}
          >
            {isPaused ? "Reprendre" : "Mettre en pause"}
          </button>
        ) : (
          <span />
        )}
        {campaign.toReview > 0 ? (
          <ButtonLink href={`/campagnes/${campaign.id}/relecture`} className="h-13">
            Relire {plural(campaign.toReview, "e-mail")} <ArrowRightIcon size={17} />
          </ButtonLink>
        ) : (
          <ButtonLink href={`/prospects?campagne=${campaign.id}`} variant="secondary" className="h-13">
            Voir les prospects
          </ButtonLink>
        )}
      </div>

      {isRunning && <p className="text-sm text-graphite">Vous pouvez fermer cette page : l’agent continue.</p>}
    </PageContainer>
  );
}
