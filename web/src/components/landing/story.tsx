import { cn } from "@/lib/format";
import { SectionHeading, sectionX } from "./common";

const trades = [
  "Agences web",
  "Photographes",
  "Consultants",
  "Experts-comptables",
  "Installateurs",
  "Traiteurs",
  "Formateurs",
  "Community managers",
];

export function Marquee() {
  return (
    <section aria-label="À qui s’adresse CloseBy" className="flex flex-col gap-6 overflow-hidden border-y border-rule bg-paper py-14">
      <p className={cn("font-mono text-xs tracking-[0.06em] text-graphite uppercase", sectionX)}>
        Pour tous ceux qui vendent aux entreprises de leur région
      </p>
      <div className="flex w-max animate-marquee">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1 ? true : undefined}
            className="flex items-center gap-11 pr-11 font-condensed text-[clamp(32px,3.2vw,46px)] font-semibold tracking-[-0.035em] whitespace-nowrap"
          >
            {trades.map((trade) => (
              <li key={trade} className="flex items-center gap-11">
                {trade}
                <span className="size-3.5 bg-marker shadow-[inset_0_0_0_1px_var(--color-ink)]" aria-hidden="true" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}

const without = [
  "Des heures à chercher sur Maps et dans des tableurs",
  "Des adresses e-mail introuvables",
  "Le même message copié-collé à tout le monde",
  "Aucun suivi de qui a été contacté",
];

export function BeforeAfter() {
  return (
    <section id="produit" className={cn("bg-paper py-24 lg:py-35", sectionX)} aria-labelledby="produit-title">
      <div className="mx-auto flex max-w-[1312px] flex-col gap-16">
        <SectionHeading
          titleId="produit-title"
          title="Trouver des clients,"
          accent="sans y passer vos soirées."
          lead="Chercher des entreprises, trouver le bon contact, écrire un message qui ne sonne pas faux : CloseBy fait le travail préparatoire. Vous gardez le dernier mot."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-9 rounded-3xl bg-desk p-8 sm:p-12">
            <h3 className="font-mono text-xs tracking-[0.06em] text-graphite uppercase">Sans CloseBy</h3>
            <ul className="flex flex-col gap-5.5 text-[clamp(20px,1.7vw,24px)] leading-[1.3] text-graphite">
              {without.map((item) => (
                <li key={item} className="line-through decoration-danger decoration-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-9 rounded-3xl bg-ink p-8 text-paper sm:p-12">
            <h3 className="font-mono text-xs tracking-[0.06em] text-night-muted uppercase">Avec CloseBy</h3>
            <ul className="flex flex-col gap-5.5 text-[clamp(20px,1.7vw,24px)] leading-[1.3]">
              <li className="flex gap-4">
                <span className="mt-2.5 size-3 shrink-0 bg-marker" aria-hidden="true" />
                Une phrase pour décrire votre cible
              </li>
              <li className="flex gap-4">
                <span className="mt-2.5 size-3 shrink-0 bg-marker" aria-hidden="true" />
                Les e-mails publics trouvés pour vous
              </li>
              <li className="flex gap-4">
                <span className="mt-2.5 size-3 shrink-0 bg-marker" aria-hidden="true" />
                <span>
                  Un message qui cite <span className="bg-marker px-1 text-ink">leur activité</span>
                </span>
              </li>
              <li className="flex gap-4">
                <span className="mt-2.5 size-3 shrink-0 bg-marker" aria-hidden="true" />
                Chaque envoi suivi, chaque réponse repérée
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
