import type { ComponentType } from "react";
import { ButtonLink } from "@/components/ui/button";
import { CheckIcon, ClockIcon, DownloadIcon, GlobeIcon, LockIcon, ShieldIcon, UserMinusIcon } from "@/components/ui/icons";
import { cn, formatNumber } from "@/lib/format";
import { plans } from "@/lib/mock-data";
import { delay, SectionHeading, sectionX } from "./common";

const commitments: Array<{ icon: ComponentType<{ size?: number; strokeWidth?: number }>; title: string; text: string }> = [
  { icon: ShieldIcon, title: "Validation humaine", text: "Aucun e-mail ne part sans votre accord explicite." },
  { icon: LockIcon, title: "Connexion officielle", text: "Envoi via Google ou Microsoft, sans jamais partager votre mot de passe." },
  { icon: GlobeIcon, title: "Sources publiques", text: "Des informations publiées par les entreprises elles-mêmes." },
  { icon: UserMinusIcon, title: "Droit d’opposition", text: "Lien de désinscription et liste d’exclusion dans chaque campagne." },
  { icon: ClockIcon, title: "Envois plafonnés", text: "Un rythme limité pour protéger votre réputation d’expéditeur." },
  { icon: DownloadIcon, title: "Vos données", text: "Export et suppression de votre compte à tout moment." },
];

export function Responsible() {
  return (
    <section className={cn("bg-paper py-24 lg:py-35", sectionX)} aria-labelledby="responsible-title">
      <div className="mx-auto grid max-w-[1312px] gap-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-24">
        <div className="flex flex-col gap-6">
          <p data-reveal style={delay(0)} className="font-mono text-[13px] tracking-[0.06em] text-graphite uppercase">
            Prospection responsable
          </p>
          <h2
            data-reveal
            style={delay(1)}
            id="responsible-title"
            className="font-condensed text-[clamp(44px,4.5vw,64px)] leading-[0.98] font-semibold tracking-[-0.045em] text-balance"
          >
            Un outil de prospection,{" "}
            <span className="font-serif font-medium tracking-[-0.03em] italic">pas une machine à spam.</span>
          </h2>
          <p data-reveal style={delay(2)} className="text-lg leading-[1.55] text-pretty text-graphite sm:text-[19px]">
            CloseBy est conçu pour des messages peu nombreux et pertinents. Vous restez responsable de vos campagnes ;
            l’outil vous aide à bien faire.
          </p>
        </div>
        <ul className="grid gap-x-10 gap-y-12 sm:grid-cols-2">
          {commitments.map(({ icon: Icon, title, text }, i) => (
            <li key={title} data-reveal style={delay(i)} className="flex flex-col gap-3">
              <Icon size={28} strokeWidth={1.6} />
              <h3 className="text-[22px] font-semibold tracking-[-0.02em]">{title}</h3>
              <p className="leading-normal text-graphite">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const comparison: Array<{ label: string; values: Array<string | boolean> }> = [
  { label: "Crédits par mois", values: plans.map((plan) => formatNumber(plan.credits)) },
  { label: "Boîtes mail connectées", values: ["1", "Plusieurs", "Plusieurs"] },
  { label: "Utilisateurs", values: ["1", "1", "Plusieurs"] },
  { label: "Faits sourcés et relecture", values: [true, true, true] },
  { label: "Liste d’exclusion", values: [true, true, true] },
  { label: "Relances validées", values: [false, true, true] },
  { label: "Suivi des réponses", values: [false, true, true] },
];

export function Pricing() {
  return (
    <section id="tarifs" className={cn("bg-desk py-24 lg:py-35", sectionX)} aria-labelledby="pricing-title">
      <div className="mx-auto flex max-w-[1312px] flex-col gap-14">
        <SectionHeading
          titleId="pricing-title"
          eyebrow="Tarifs"
          title="Des tarifs simples,"
          accent="sans surprise."
          lead="Un crédit correspond à un prospect analysé et à son e-mail rédigé. Les régénérations sont incluses, et une recherche sans résultat ne coûte rien."
        />

        <ul className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan, i) => {
            const featured = plan.id === "pro";
            return (
              <li
                key={plan.id}
                data-reveal
                style={delay(i * 2)}
                className={cn("flex flex-col gap-7 rounded-3xl p-8 sm:p-10", featured ? "bg-ink text-paper" : "bg-paper")}
              >
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-semibold">{plan.name}</h3>
                  <p className={featured ? "text-night-muted" : "text-graphite"}>{plan.tagline}</p>
                </div>
                <p className="flex items-baseline gap-2">
                  <span className="text-[64px] leading-none font-semibold tracking-[-0.05em]">{plan.priceEur} €</span>
                  <span className={featured ? "text-night-muted" : "text-graphite"}>/ mois</span>
                </p>
                <ButtonLink href="/inscription" variant={featured ? "marker" : "secondary"} className={cn("h-13", !featured && "border-ink")}>
                  Choisir {plan.name}
                </ButtonLink>
                <ul className={cn("flex flex-col gap-3.5 border-t pt-6.5", featured ? "border-night-rule" : "border-rule")}>
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckIcon size={16} strokeWidth={2.4} className={cn("shrink-0", featured && "text-marker")} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>

        <div data-reveal style={delay(2)} className="overflow-x-auto rounded-3xl bg-paper px-6 pt-3 pb-5 sm:px-10">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <caption className="sr-only">Comparaison des offres</caption>
            <thead>
              <tr className="h-16">
                <th scope="col" className="text-lg font-semibold">Comparer les offres</th>
                {plans.map((plan) => (
                  <th key={plan.id} scope="col" className="font-semibold">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.label} className="h-14 border-t border-rule-soft">
                  <th scope="row" className="font-normal text-graphite">
                    {row.label}
                  </th>
                  {row.values.map((value, i) => (
                    <td key={i}>
                      {value === true ? (
                        <CheckIcon size={18} strokeWidth={2.4} aria-label="Inclus" role="img" aria-hidden={false} />
                      ) : value === false ? (
                        <span className="text-disabled" aria-label="Non inclus">
                          —
                        </span>
                      ) : (
                        <span className="font-mono">{value}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
