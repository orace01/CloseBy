"use client";

import Link from "next/link";
import { CampaignStatusLabel, PageContainer, PageTitle } from "@/components/app/page-shell";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon, PlusIcon } from "@/components/ui/icons";
import { formatNumber, plural } from "@/lib/format";
import { account } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";

export function Dashboard() {
  const { state } = useAppStore();
  const toReview = state.prospects.filter((p) => p.status === "to_review");
  const reviewCampaignId = toReview[0]?.campaignId;
  const totals = state.campaigns.reduce(
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
        <PageTitle>Bonjour {account.name.split(" ")[0]}</PageTitle>
        <ButtonLink href="/campagnes/nouvelle">
          <PlusIcon strokeWidth={2.2} />
          Nouvelle campagne
        </ButtonLink>
      </div>

      {reviewCampaignId && (
        <Link
          href={`/campagnes/${reviewCampaignId}/relecture`}
          className="flex min-h-19 items-center justify-between gap-4 rounded-xl bg-desk px-5 py-4 transition-colors hover:bg-desk-deep sm:px-7"
        >
          <span className="flex items-center gap-3.5 text-lg font-semibold sm:text-[19px]">
            <span className="size-3.5 shrink-0 bg-marker shadow-[inset_0_0_0_1px_var(--color-ink)]" aria-hidden="true" />
            {plural(toReview.length, "e-mail")} à relire
          </span>
          <span className="flex items-center gap-2 font-semibold">
            Relire <ArrowRightIcon size={17} />
          </span>
        </Link>
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
          {state.campaigns.map((campaign) => (
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
