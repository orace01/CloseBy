import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon, CheckIcon, SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/format";
import { delay, MarkerSquare, paperShadow, sectionX } from "./common";

const foundClients = [
  { initials: "BM", name: "Bistrot Margaux", meta: "Restaurant · à 1,2 km" },
  { initials: "PC", name: "Le Petit Comptoir", meta: "Bistrot · à 1,6 km" },
  { initials: "TJ", name: "La Table de Juliette", meta: "Restaurant · à 2,1 km" },
  { initials: "SK", name: "Sushi Kaze", meta: "Restaurant japonais · à 2,8 km" },
];

export function Hero() {
  return (
    <section className={cn("overflow-hidden bg-paper pt-16 lg:pt-24", sectionX)} aria-labelledby="hero-title">
      <div className="mx-auto max-w-[1312px]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] lg:items-end lg:gap-16">
          <div className="flex flex-col gap-7">
            <p data-reveal style={delay(0)} className="flex items-center gap-2.5 font-mono text-[13px] tracking-[0.06em] text-graphite uppercase">
              <MarkerSquare />
              L’agent IA qui trouve vos clients
            </p>
            <h1
              data-reveal
              style={delay(1)}
              id="hero-title"
              className="font-condensed text-[clamp(56px,7.8vw,112px)] leading-[0.92] font-semibold tracking-[-0.05em] text-balance"
            >
              Trouvez vos prochains clients,{" "}
              <span data-sweep style={delay(0, 900)} className="hl-strong pr-2 pl-1 font-serif font-medium tracking-[-0.03em] italic">
                sans chercher.
              </span>
            </h1>
          </div>
          <div className="flex flex-col gap-7 lg:pb-3">
            <p data-reveal style={delay(3)} className="text-xl leading-normal text-pretty text-body">
              CloseBy repère les entreprises qui ont besoin de vos services près de chez vous, trouve comment les
              contacter et prépare le premier e-mail. Vous n’avez plus qu’à valider.
            </p>
            <div data-reveal style={delay(4)} className="flex flex-wrap gap-2.5">
              <ButtonLink href="/inscription" size="lg" className="group">
                Trouver mes clients <ArrowRightIcon size={17} className="transition-transform group-hover:translate-x-1" />
              </ButtonLink>
              <ButtonLink href="#comment" size="lg" variant="secondary">
                Comment ça marche
              </ButtonLink>
            </div>
          </div>
        </div>

        <div
          id="demo"
          data-reveal
          style={delay(6)}
          className="mt-16 rounded-t-[28px] bg-desk px-4 pt-8 pb-10 sm:px-10 lg:mt-20 lg:px-16 lg:pt-13 lg:pb-7"
        >
          <p className="flex w-fit flex-wrap items-center gap-x-3 gap-y-1 rounded-3xl bg-paper px-4.5 py-3 text-[15px]">
            <SearchIcon size={16} />
            <span className="text-graphite">Votre activité :</span>
            <span className="font-semibold">
              <span data-type data-type-delay="900">
                sites web pour les restaurants, autour de Lyon
              </span>
              <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-blink bg-ink" aria-hidden="true" />
            </span>
          </p>

          <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,600px)_minmax(40px,1fr)_minmax(0,440px)] lg:items-start">
            <div data-reveal style={delay(12)} className={cn("rounded-[20px] bg-paper px-5 pt-1.5 pb-2.5 sm:px-7", paperShadow)}>
              <div className="flex h-16 items-center justify-between gap-4">
                <span className="text-lg font-semibold">Clients potentiels trouvés</span>
                <span className="hidden font-mono text-[13px] text-graphite sm:inline">
                  <span data-count="38">38</span> près de chez vous
                </span>
              </div>
              <ul>
                {foundClients.map((client, i) => (
                  <li
                    key={client.name}
                    data-reveal="fade"
                    style={delay(15 + i * 3)}
                    className="flex min-h-18 items-center gap-4 border-t border-rule-soft py-2"
                  >
                    <span className="flex size-10.5 shrink-0 items-center justify-center rounded-xl bg-desk text-[15px] font-semibold">
                      {client.initials}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-[17px] font-semibold">{client.name}</span>
                      <span className="text-sm text-graphite">{client.meta}</span>
                    </span>
                    <span
                      data-pop
                      style={delay(0, 2200 + i * 270)}
                      className="flex h-7.5 shrink-0 items-center gap-1.5 rounded-full bg-success-soft px-3 text-[13px] font-semibold text-success"
                    >
                      <CheckIcon size={13} strokeWidth={2.8} />
                      <span className="hidden sm:inline">Contact trouvé</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hidden justify-center pt-24 lg:flex" aria-hidden="true">
              <svg data-draw style={delay(0, 3300)} width="100%" height="16" viewBox="0 0 120 16" preserveAspectRatio="none" fill="none" className="max-w-[120px]">
                <path d="M0 8h110" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 5" />
                <path d="M104 3l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div data-reveal style={delay(40)} className={cn("flex flex-col gap-4.5 bg-paper px-6 py-8 sm:px-8.5 lg:-mt-7", paperShadow)}>
              <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.04em] text-graphite uppercase">
                <span className="size-2 animate-pulse-soft rounded-full bg-success" aria-hidden="true" />
                Premier e-mail prêt · Bistrot Margaux
              </p>
              <p className="font-serif text-[25px] leading-[1.2] font-semibold">Votre menu du midi, directement sur votre site ?</p>
              <p className="font-serif text-lg leading-[1.6] text-body">
                Bonjour, j’ai vu que{" "}
                <span data-sweep style={delay(0, 4500)} className="hl">
                  votre menu n’est publié que sur Instagram
                </span>
                . Quinze minutes pour en parler ?
              </p>
              <div className="flex justify-end gap-2 pt-1.5" aria-hidden="true">
                <span className="flex h-10.5 items-center rounded-lg border border-line px-4 text-sm font-semibold">Modifier</span>
                <span className="flex h-10.5 items-center gap-1.5 rounded-lg bg-ink px-4 text-sm font-semibold text-paper">
                  <CheckIcon size={14} strokeWidth={2.4} />
                  Approuver
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
