"use client";

import Link from "next/link";
import { CalloutLink, CampaignStatusLabel, PageContainer, PageTitle } from "@/components/app/page-shell";
import { ButtonLink } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";
import { formatNumber, plural } from "@/lib/format";
import type { Campaign } from "@/lib/types";

export function Dashboard({ firstName, campaigns }: { firstName: string; campaigns: Campaign[] }) {
  const toReview = campaigns.reduce((sum, c) => sum + c.toReview, 0);
  const reviewCampaignId = campaigns.find((c) => c.toReview > 0)?.id;
  const withoutWebsite = campaigns.reduce((sum, c) => sum + c.withoutWebsite, 0);
  const totals = campaigns.reduce(
    (sum, c) => ({ found: sum.found + c.progress.found, sent: sum.sent + c.sent, replies: sum.replies + c.replies }),
    { found: 0, sent: 0, replies: 0 },
  );

  const stats = [
    { value: totals.found, label: "prospects trouvés" },
    { value: totals.sent, label: "e-mails envoyés" },
    { value: totals.replies, label: "réponses" },
  ];

  return (
    <PageContainer>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageTitle>Bonjour {firstName}</PageTitle>
        <ButtonLink href="/campagnes/nouvelle">
          <PlusIcon strokeWidth={2.2} />
          Nouvelle campagne
        </ButtonLink>
      </div>

      {(reviewCampaignId || withoutWebsite > 0) && (
        <div className="flex flex-col gap-3">
          {reviewCampaignId && (
            <CalloutLink href={`/campagnes/${reviewCampaignId}/relecture`} action="Relire">
              {plural(toReview, "e-mail")} à relire
            </CalloutLink>
          )}
          {withoutWebsite > 0 && (
            <CalloutLink href="/prospects?filtre=sans-site" action="Voir">
              {plural(withoutWebsite, "entreprise")} sans site web
            </CalloutLink>
          )}
        </div>
      )}

      <dl className="grid grid-cols-1 border-y border-rule sm:grid-cols-3">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={
              i === 0
                ? "flex flex-col-reverse gap-2 py-7"
                : "flex flex-col-reverse gap-2 border-t border-rule py-7 sm:border-t-0 sm:border-l sm:px-8"
            }
          >
            <dt className="text-[15px] text-graphite">{stat.label}</dt>
            <dd className="text-[56px] leading-none font-semibold tracking-[-0.04em] tabular-nums">{formatNumber(stat.value)}</dd>
          </div>
        ))}
      </dl>

      <section className="flex flex-col gap-2.5" aria-labelledby="recent-campaigns">
        <h2 id="recent-campaigns" className="text-xl font-semibold">
          Campagnes récentes
        </h2>
        <ul>
          {campaigns.length === 0 && <li className="py-4 text-graphite">Aucune campagne pour l’instant.</li>}
          {campaigns.slice(0, 5).map((campaign) => (
            <li key={campaign.id}>
              <Link
                href={`/campagnes/${campaign.id}`}
                className="flex min-h-15.5 items-center justify-between gap-4 border-b border-rule-soft px-1 py-3 transition-colors hover:bg-desk/60"
              >
                <span className="text-[17px] font-semibold">{campaign.name}</span>
                <CampaignStatusLabel status={campaign.status} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageContainer>
  );
}
