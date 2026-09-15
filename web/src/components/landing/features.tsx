import type { ReactNode } from "react";
import { MailIcon } from "@/components/ui/icons";
import { cn } from "@/lib/format";
import { delay, SectionHeading, sectionX } from "./common";

function Feature({
  index,
  title,
  text,
  wide = false,
  children,
}: {
  index: number;
  title: string;
  text: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <li data-reveal style={delay(index)} className={cn("flex flex-col gap-6 rounded-3xl bg-desk p-6 sm:p-8", wide && "md:col-span-2")}>
      <div className="flex h-[190px] items-center justify-center overflow-hidden rounded-2xl bg-paper px-5" aria-hidden="true">
        {children}
      </div>
      <div className="flex flex-col gap-2.5">
        <h3 className="text-2xl font-semibold tracking-[-0.02em]">{title}</h3>
        <p className="leading-normal text-graphite">{text}</p>
      </div>
    </li>
  );
}

const sourcedFacts = [
  ["Menu publié sur Instagram", "page d’accueil · 14/09"],
  ["Réservation par téléphone", "page Contact · 14/09"],
  ["Ouvert du mardi au samedi", "fiche établissement · 14/09"],
];

const tones = ["Professionnel", "Direct", "Chaleureux", "Consultatif"];

const exclusions = [
  ["contact@maison-berthe.fr", "Exclu"],
  ["hello@lekiosque.fr", "Désinscrit"],
  ["@concurrent.fr", "Domaine"],
];

export function Features() {
  return (
    <section id="fonctionnalites" className={cn("bg-paper py-24 lg:py-35", sectionX)} aria-labelledby="features-title">
      <div className="mx-auto flex max-w-[1312px] flex-col gap-16">
        <SectionHeading
          titleId="features-title"
          eyebrow="Fonctionnalités"
          title="Tout ce qu’il faut."
          accent="Rien de superflu."
          lead="Pensé pour les indépendants et les petites équipes : pas de CRM à configurer, pas de jargon. Juste ce qui sert à décrocher des rendez-vous."
        />
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Feature
            index={0}
            wide
            title="Des faits sourcés"
            text="Chaque information utilisée dans un e-mail indique la page d’où elle vient et la date à laquelle elle a été lue."
          >
            <div className="flex gap-3">
              {sourcedFacts.map(([fact, source], i) => (
                <div
                  key={fact}
                  data-reveal="fade"
                  style={delay(4 + i * 3)}
                  className={cn("w-[220px] shrink-0 flex-col gap-2 rounded-xl bg-desk p-4", i === 2 ? "hidden xl:flex" : "flex")}
                >
                  <span className="text-sm leading-[1.4]">
                    <span data-sweep style={delay(i, 900)} className="hl">
                      {fact}
                    </span>
                  </span>
                  <span className="font-mono text-[11px] text-graphite">{source}</span>
                </div>
              ))}
            </div>
          </Feature>

          <Feature index={2} title="Votre ton, votre langue" text="Les messages suivent votre façon de parler et l’appel à l’action que vous choisissez.">
            <div className="flex flex-col items-center gap-3.5">
              <div className="flex max-w-[280px] flex-wrap justify-center gap-2 text-sm font-semibold">
                {tones.map((tone, i) => (
                  <span
                    key={tone}
                    data-pop
                    style={delay(i, 600)}
                    className={cn(
                      "flex h-9 items-center rounded-full px-3.5",
                      i === 0 ? "bg-ink text-paper" : "border border-line",
                    )}
                  >
                    {tone}
                  </span>
                ))}
              </div>
              <span className="font-mono text-xs text-graphite">Français · English</span>
            </div>
          </Feature>

          <Feature index={0} title="Un rythme d’envoi prudent" text="Les envois sont espacés et plafonnés chaque jour, pour protéger votre adresse.">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center">
                    {i > 0 && (
                      <span className="h-px w-6.5 bg-rule">
                        {i <= 2 && <span data-fill style={delay(i * 3 - 2, 500)} className="block h-px w-full bg-ink" />}
                      </span>
                    )}
                    <span
                      data-pop
                      style={delay(i * 3, 500)}
                      className={cn("size-3.5 rounded-full", i <= 2 ? "bg-ink" : "border-[1.5px] border-ink")}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 font-mono text-[11px] text-graphite">
                <span>9:00</span>
                <span>9:15</span>
                <span>9:30</span>
                <span>9:45</span>
                <span>10:00</span>
              </div>
            </div>
          </Feature>

          <Feature index={1} title="Liste d’exclusion" text="Une adresse ou un domaine exclu ne peut plus être ciblé par vos campagnes.">
            <div className="flex w-full flex-col gap-2.5 text-sm">
              {exclusions.map(([address, label], i) => (
                <div key={address} className="flex items-center justify-between gap-2.5">
                  <span data-strike style={delay(i, 700)} className="truncate text-graphite line-through decoration-danger">
                    {address}
                  </span>
                  <span className="text-xs font-semibold text-danger">{label}</span>
                </div>
              ))}
            </div>
          </Feature>

          <Feature index={2} title="Suivi des réponses" text="Envoyé, répondu, désinscrit : le statut de chaque prospect se met à jour.">
            <div className="flex w-full max-w-[280px] items-start gap-3">
              <span className="flex size-9.5 shrink-0 items-center justify-center rounded-full bg-desk text-[13px] font-semibold">LP</span>
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">Le Petit Comptoir</span>
                  <span data-pop style={delay(0, 900)} className="rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success">
                    Réponse
                  </span>
                </div>
                <span className="text-[13px] leading-[1.45] text-graphite">Bonjour, oui avec plaisir. Jeudi matin, ça vous irait ?</span>
              </div>
            </div>
          </Feature>

          <Feature
            index={0}
            wide
            title="Des crédits transparents"
            text="Vous savez toujours ce qui a été consommé, et pourquoi. Une recherche sans résultat ne coûte rien."
          >
            <div className="flex w-full flex-col gap-4 px-2 sm:flex-row sm:items-center sm:gap-12 sm:px-6">
              <p className="flex items-baseline gap-2.5">
                <span data-count="112" className="text-[clamp(56px,5vw,88px)] leading-none font-semibold tracking-[-0.05em] tabular-nums">
                  112
                </span>
                <span className="text-lg text-graphite">/ 150 crédits</span>
              </p>
              <div className="flex flex-1 flex-col gap-3">
                <div className="h-2 overflow-hidden rounded bg-desk">
                  <div className="h-full w-3/4">
                    <div data-fill style={delay(0, 400)} className="h-full rounded bg-ink" />
                  </div>
                </div>
                <span className="font-mono text-xs leading-normal text-graphite">
                  1 crédit = 1 prospect analysé et son e-mail rédigé · régénérations incluses
                </span>
              </div>
            </div>
          </Feature>

          <Feature index={2} title="Gmail et Outlook" text="Connexion sécurisée en deux clics, sans partager votre mot de passe.">
            <div className="flex w-full flex-col gap-3 text-sm">
              <div data-reveal="fade" style={delay(5)} className="flex items-center gap-3">
                <MailIcon size={20} strokeWidth={1.8} />
                <span className="flex-1 font-semibold">Gmail</span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-success">
                  <span className="size-1.75 animate-pulse-soft rounded-full bg-success" />
                  Connectée
                </span>
              </div>
              <span className="h-px bg-rule-soft" />
              <div data-reveal="fade" style={delay(8)} className="flex items-center gap-3">
                <MailIcon size={20} strokeWidth={1.8} />
                <span className="flex-1 font-semibold">Outlook</span>
                <span className="flex h-7.5 items-center rounded-md bg-ink px-3 text-xs font-semibold text-paper">Connecter</span>
              </div>
            </div>
          </Feature>
        </ul>
      </div>
    </section>
  );
}
