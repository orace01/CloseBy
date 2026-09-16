import { PageContainer, PageTitle } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";
import { cn, formatDayMonth, formatNumber } from "@/lib/format";
import { plans } from "@/lib/plans";
import type { PlanId } from "@/lib/types";

export function Credits({ balance, planId, renewsOn }: { balance: number; planId: PlanId; renewsOn: string | null }) {
  const currentPlan = plans.find((plan) => plan.id === planId) ?? plans[0];
  const percent = Math.min(100, Math.round((balance / currentPlan.credits) * 100));

  return (
    <PageContainer className="gap-11">
      <div className="flex flex-col gap-4.5">
        <PageTitle>Crédits</PageTitle>
        <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
          <span className="text-[88px] leading-none font-semibold tracking-[-0.05em] tabular-nums">{formatNumber(balance)}</span>
          <span className="text-lg text-graphite">
            sur {formatNumber(currentPlan.credits)}
            {renewsOn && <> · renouvelés le {formatDayMonth(renewsOn)}</>}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Crédits restants"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-1.5 overflow-hidden rounded-sm bg-desk"
        >
          <div className="h-full rounded-sm bg-ink" style={{ width: `${percent}%` }} />
        </div>
        <p className="font-mono text-[13px] text-graphite">1 crédit = 1 prospect analysé et son e-mail rédigé</p>
      </div>

      <ul className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan.id;
          return (
            <li
              key={plan.id}
              className={cn(
                "flex flex-col gap-5 rounded-2xl p-7",
                isCurrent ? "border-[1.5px] border-ink" : "border border-rule",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">{plan.name}</h2>
                {isCurrent && <span className="rounded-full bg-desk px-2.5 py-1 text-xs font-semibold">Plan actuel</span>}
              </div>
              <p className="flex items-baseline gap-1.5">
                <span className="text-[44px] leading-none font-semibold tracking-[-0.04em]">{plan.priceEur} €</span>
                <span className="text-[15px] text-graphite">/ mois</span>
              </p>
              <ul className="flex flex-col gap-2.5 border-t border-rule pt-5 text-[15px]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <CheckIcon size={15} strokeWidth={2.4} />
                    {feature}
                  </li>
                ))}
              </ul>
              {/* Payments are not wired yet: plans can't be changed. */}
              <Button variant="secondary" disabled className="mt-auto">
                {isCurrent ? "Plan actuel" : "Paiement bientôt disponible"}
              </Button>
            </li>
          );
        })}
      </ul>
    </PageContainer>
  );
}
