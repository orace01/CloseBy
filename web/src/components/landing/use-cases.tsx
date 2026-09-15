"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/format";
import { delay, paperShadow, SectionHeading, sectionX } from "./common";

const cases = [
  {
    label: "Agences web",
    brief: "Je crée des sites web pour les restaurants autour de Lyon",
    targets: ["Restaurants, bistrots et brasseries", "Dans un rayon de 15 km autour de Lyon", "Dont le site n’est pas adapté au mobile"],
    to: "contact@bistrot-margaux.fr",
    subject: "Votre menu du midi, directement sur votre site ?",
    facts: ["votre menu du midi n’est publié que sur Instagram", "les réservations se font uniquement par téléphone"],
    pitch: "Je crée des sites pour les restaurants lyonnais : menu modifiable, réservation en ligne. Quinze minutes pour en parler ?",
    sources: "page d’accueil, page Contact",
  },
  {
    label: "Photographes",
    brief: "Je photographie les produits des boutiques de créateurs à Nantes",
    targets: ["Boutiques de créateurs et concept stores", "À Nantes et dans les environs", "Avec une boutique en ligne"],
    to: "bonjour@atelier-lune.fr",
    subject: "Des photos à la hauteur de vos créations ?",
    facts: ["votre boutique en ligne présente plus de 40 créations", "la plupart des fiches n’ont qu’une seule photo"],
    pitch: "Je photographie les produits des créateurs nantais, en studio ou chez vous. Je peux vous montrer quelques exemples ?",
    sources: "boutique en ligne, fiches produits",
  },
  {
    label: "Consultants",
    brief: "J’aide les cabinets dentaires de Toulouse à réduire les rendez-vous manqués",
    targets: ["Cabinets dentaires", "À Toulouse", "Avec prise de rendez-vous par téléphone"],
    to: "accueil@cabinet-des-carmes.fr",
    subject: "Moins de rendez-vous manqués au cabinet ?",
    facts: ["la prise de rendez-vous se fait uniquement par téléphone", "votre cabinet compte quatre praticiens"],
    pitch: "J’accompagne les cabinets toulousains sur les rappels patients et l’organisation de l’agenda. Un échange de 15 minutes ?",
    sources: "page Équipe, page Contact",
  },
  {
    label: "Artisans et services",
    brief: "J’installe des alarmes pour les commerces de Lille",
    targets: ["Bijouteries, opticiens et boutiques", "À Lille et dans la métropole", "Avec un point de vente physique"],
    to: "contact@bijouterie-vauban.fr",
    subject: "La sécurité de votre boutique en dehors des heures d’ouverture ?",
    facts: ["votre boutique est fermée le dimanche et le lundi", "vous proposez des montres de collection"],
    pitch: "J’installe des alarmes pour les commerçants lillois, avec télésurveillance. Voulez-vous un devis ?",
    sources: "fiche établissement, site web",
  },
];

export function UseCases() {
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const current = cases[selected];

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const moves: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const next = (selected + moves[event.key] + cases.length) % cases.length;
    setSelected(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section id="usages" className={cn("bg-desk py-24 lg:py-35", sectionX)} aria-labelledby="usages-title">
      <div className="mx-auto flex max-w-[1312px] flex-col gap-14">
        <SectionHeading
          titleId="usages-title"
          eyebrow="Cas d’usage"
          title="Fait pour ceux qui vendent"
          accent="près de chez eux."
          lead="Freelance, agence ou consultant : décrivez votre métier, l’agent adapte la recherche et le message."
        />

        <div data-reveal style={delay(3)} role="tablist" aria-label="Métiers" className="flex flex-wrap gap-2">
          {cases.map((item, i) => (
            <button
              key={item.label}
              ref={(node) => {
                tabRefs.current[i] = node;
              }}
              type="button"
              role="tab"
              id={`usecase-tab-${i}`}
              aria-selected={i === selected}
              aria-controls="usecase-panel"
              tabIndex={i === selected ? 0 : -1}
              onClick={() => setSelected(i)}
              onKeyDown={handleKeyDown}
              className={cn(
                "h-12 rounded-full border px-5.5 text-base font-semibold transition-colors duration-300",
                i === selected ? "border-ink bg-ink text-paper" : "border-rule bg-paper text-ink hover:border-ink",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          data-reveal
          style={delay(4)}
          id="usecase-panel"
          role="tabpanel"
          aria-labelledby={`usecase-tab-${selected}`}
          className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
        >
          <div className="rounded-3xl bg-paper p-8 sm:p-12">
            <div key={selected} className="flex animate-fade-up flex-col gap-8">
              <p className="font-mono text-xs tracking-[0.06em] text-graphite uppercase">La demande</p>
              <p className="text-[clamp(26px,2.4vw,34px)] leading-[1.15] font-semibold tracking-[-0.03em] text-balance">
                « {current.brief} »
              </p>
              <div className="flex flex-col gap-3.5 border-t border-rule pt-6">
                <p className="font-mono text-xs tracking-[0.06em] text-graphite uppercase">L’agent cible</p>
                <ul className="flex flex-col gap-3.5">
                  {current.targets.map((target, i) => (
                    <li
                      key={target}
                      className="flex animate-fade-up items-center gap-3 text-lg"
                      style={{ animationDelay: `${150 + i * 90}ms` }}
                    >
                      <span className="size-2.5 shrink-0 bg-marker shadow-[inset_0_0_0_1px_var(--color-ink)]" aria-hidden="true" />
                      {target}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center rounded-3xl bg-desk-deep p-5 sm:p-12">
            <article
              key={selected}
              className={cn(
                "flex w-full max-w-[560px] animate-fade-up flex-col gap-4.5 bg-paper px-6 py-9 [animation-delay:120ms] sm:px-11 sm:py-10",
                paperShadow,
              )}
            >
              <p className="font-mono text-[11px] text-graphite">À : {current.to}</p>
              <h3 className="font-serif text-[26px] leading-[1.2] font-semibold">{current.subject}</h3>
              <p className="font-serif text-lg leading-[1.65]">
                Bonjour, j’ai vu que <span className="hl animate-sweep bg-no-repeat [animation-delay:450ms]">{current.facts[0]}</span>{" "}
                et que <span className="hl animate-sweep bg-no-repeat [animation-delay:850ms]">{current.facts[1]}</span>.
              </p>
              <p className="font-serif text-lg leading-[1.65]">{current.pitch}</p>
              <p className="flex items-center gap-2 font-mono text-[11px] text-graphite">
                <span className="size-2.5 bg-marker" aria-hidden="true" />
                Sources · {current.sources}
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
