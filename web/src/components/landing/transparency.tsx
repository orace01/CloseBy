import { cn } from "@/lib/format";
import { delay, sectionX } from "./common";

const notes = [
  { mark: "1", label: "Source", text: "Page d’accueil : lien « Menu du midi » vers Instagram", danger: false, index: 12 },
  { mark: "2", label: "Source", text: "Page Contact : « Réservation par téléphone »", danger: false, index: 16 },
  { mark: "?", label: "Sans source", text: "Introuvable sur le site : à retirer avant l’envoi.", danger: true, index: 30 },
];

const fact = "hl-solid px-0.75 text-ink";

export function Transparency() {
  return (
    <section className={cn("overflow-hidden bg-ink py-24 text-paper lg:py-38", sectionX)} aria-labelledby="transparency-title">
      <div className="mx-auto grid max-w-[1312px] items-center gap-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-22">
        <div className="flex flex-col gap-6.5">
          <p data-reveal style={delay(0)} className="font-mono text-[13px] tracking-[0.06em] text-night-muted uppercase">
            Transparence
          </p>
          <h2
            data-reveal
            style={delay(1)}
            id="transparency-title"
            className="font-condensed text-[clamp(56px,6.7vw,96px)] leading-[0.92] font-semibold tracking-[-0.05em] text-balance"
          >
            Chaque phrase a sa <span className="font-serif font-medium tracking-[-0.03em] text-marker italic">source.</span>
          </h2>
          <p data-reveal style={delay(2)} className="max-w-[460px] text-xl leading-[1.55] text-pretty text-night-muted">
            L’agent ne s’appuie que sur ce qu’il a lu : page d’accueil, page contact, horaires, services. Un fait sans
            source est signalé, et vous relisez toujours avant l’envoi.
          </p>
        </div>

        <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
          <figure data-reveal style={delay(3)} className="flex flex-col gap-4.5 sm:w-[460px] sm:shrink-0" aria-label="Exemple d’e-mail annoté">
            <p className="font-mono text-xs text-night-muted">À : contact@bistrot-margaux.fr</p>
            <p className="font-serif text-[clamp(26px,2.2vw,32px)] leading-[1.2] font-semibold">
              Votre menu du midi, directement sur votre site ?
            </p>
            <p className="font-serif text-[clamp(19px,1.5vw,22px)] leading-[1.6] text-night-text">
              Bonjour, en regardant votre site, j’ai vu que{" "}
              <mark data-sweep style={delay(0, 900)} className={fact}>
                votre menu du midi n’est publié que sur Instagram
              </mark>
              <sup className="ml-0.5 font-mono text-[11px] text-marker">1</sup> et que{" "}
              <mark data-sweep style={delay(1, 1000)} className={fact}>
                les réservations se font uniquement par téléphone
              </mark>
              <sup className="ml-0.5 font-mono text-[11px] text-marker">2</sup>.
            </p>
            <p className="font-serif text-[clamp(19px,1.5vw,22px)] leading-[1.6] text-night-text">
              J’ai aussi noté que{" "}
              <span data-reveal="fade" style={delay(28)}>
                <span className="underline decoration-danger-night decoration-wavy decoration-[1.5px] underline-offset-[6px]">
                  vous ouvrez une terrasse cet été
                </span>
                <sup className="ml-0.5 font-mono text-[11px] text-danger-night">?</sup>
              </span>
              .
            </p>
          </figure>

          <ol className="flex flex-col gap-6 sm:w-[190px] sm:pt-30">
            {notes.map((note) => (
              <li key={note.mark} data-reveal style={delay(note.index)} className="flex flex-col gap-2">
                <span
                  className={cn(
                    "flex items-center gap-2 font-mono text-[11px] tracking-[0.06em] uppercase",
                    note.danger ? "text-danger-night" : "text-marker",
                  )}
                >
                  <span
                    className={cn("flex size-4 items-center justify-center text-ink", note.danger ? "bg-danger-night" : "bg-marker")}
                    aria-hidden="true"
                  >
                    {note.mark}
                  </span>
                  {note.label}
                </span>
                <span className="font-mono text-[13px] leading-[1.45] text-night-text">{note.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
