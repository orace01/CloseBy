"use client";

import { PageContainer } from "@/components/app/page-shell";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/icons";
import { cn, formatNumber, plural } from "@/lib/format";
import { useAppStore } from "@/lib/store";

export function CampaignProgress({ campaignId }: { campaignId: string }) {
  const { state, dispatch } = useAppStore();
  const campaign = state.campaigns.find((c) => c.id === campaignId);
  if (!campaign) return null;

  const { found, sitesRead, drafted } = campaign.progress;
  const toReview = state.prospects.filter((p) => p.campaignId === campaign.id && p.status === "to_review").length;
  const isDone = campaign.status === "done";
  const isPaused = campaign.status === "paused";
  const readingDone = sitesRead >= found;
  const percent = Math.round((sitesRead / Math.max(found, 1)) * 100);

  const title = isDone ? "Campagne terminée" : isPaused ? "Agent en pause" : "L’agent travaille…";

  const steps = [
    { label: "Recherche des entreprises", value: formatNumber(found), done: true },
    { label: "Lecture des sites", value: `${formatNumber(sitesRead)} / ${formatNumber(found)}`, done: readingDone },
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
        aria-label="Lecture des sites"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 overflow-hidden rounded-sm bg-desk"
      >
        <div className="h-full rounded-sm bg-ink" style={{ width: `${percent}%` }} />
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
                <span
                  className={cn(
                    "size-3.5 bg-marker shadow-[inset_0_0_0_1px_var(--color-ink)]",
                    !isPaused && "animate-pulse-soft",
                  )}
                />
              </span>
            )}
            <span className="flex-1 text-lg">{step.label}</span>
            <span className="font-mono text-sm text-graphite">{step.value}</span>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-4">
        {!isDone ? (
          <button
            type="button"
            className="text-base font-semibold"
            onClick={() => dispatch({ type: "toggleCampaignPause", id: campaign.id })}
          >
            {isPaused ? "Reprendre" : "Mettre en pause"}
          </button>
        ) : (
          <span />
        )}
        {toReview > 0 ? (
          <ButtonLink href={`/campagnes/${campaign.id}/relecture`} className="h-13">
            Relire {plural(toReview, "e-mail")} <ArrowRightIcon size={17} />
          </ButtonLink>
        ) : (
          <ButtonLink href="/prospects" variant="secondary" className="h-13">
            Voir les prospects
          </ButtonLink>
        )}
      </div>

      {!isDone && <p className="text-sm text-graphite">Vous pouvez fermer cette page : l’agent continue.</p>}
    </PageContainer>
  );
}
