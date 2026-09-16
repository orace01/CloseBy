"use client";

import Link from "next/link";
import { useTransition } from "react";
import { CampaignStatusLabel, PageContainer, PageTitle } from "@/components/app/page-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";
import { setCampaignPaused } from "@/lib/actions/campaigns";
import { plural } from "@/lib/format";
import type { Campaign } from "@/lib/types";

export function CampaignsList({ campaigns }: { campaigns: Campaign[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <PageContainer>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageTitle>Campagnes</PageTitle>
        <ButtonLink href="/campagnes/nouvelle">
          <PlusIcon strokeWidth={2.2} />
          Nouvelle campagne
        </ButtonLink>
      </div>

      {campaigns.length === 0 && (
        <p className="text-lg text-graphite">Aucune campagne pour l’instant. Décrivez ce que vous vendez, l’agent s’occupe du reste.</p>
      )}

      <ul className="border-t border-rule">
        {campaigns.map((campaign) => {
          const stats = [
            campaign.toReview > 0 && `${campaign.toReview} à relire`,
            plural(campaign.progress.drafted, "rédigé"),
            plural(campaign.sent, "envoyé"),
            plural(campaign.replies, "réponse"),
          ].filter(Boolean);

          return (
            <li key={campaign.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-rule-soft py-5">
              <Link href={`/campagnes/${campaign.id}`} className="group flex min-w-60 flex-1 flex-col gap-1.5">
                <span className="text-[19px] font-semibold group-hover:underline group-hover:underline-offset-4">{campaign.name}</span>
                <span className="font-mono text-[13px] text-graphite">{stats.join(" · ")}</span>
              </Link>
              <span className="w-28">
                <CampaignStatusLabel status={campaign.status} />
              </span>
              <span className="flex w-30 justify-end">
                {campaign.status !== "done" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-30"
                    disabled={pending}
                    onClick={() => startTransition(() => setCampaignPaused(campaign.id, campaign.status === "running"))}
                  >
                    {campaign.status === "paused" ? "Reprendre" : "Pause"}
                  </Button>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </PageContainer>
  );
}
