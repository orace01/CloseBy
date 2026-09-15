import type { ReactNode } from "react";
import { CheckIcon, PencilIcon, SendIcon } from "@/components/ui/icons";
import { cn } from "@/lib/format";
import { CheckItem, paperShadow, SectionHeading, sectionX } from "./common";

function Step({
  index,
  title,
  text,
  points,
  visual,
  visualClassName,
  reverse = false,
}: {
  index: string;
  title: string;
  text: string;
  points: string[];
  visual: ReactNode;
  visualClassName?: string;
  reverse?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid items-center gap-10 lg:gap-24",
        reverse ? "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]" : "lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]",
      )}
    >
      <div className={cn("flex flex-col gap-5.5", reverse && "lg:order-2")}>
        <span className="font-mono text-sm text-graphite">{index} / 04</span>
        <h3 className="text-[clamp(32px,3.1vw,44px)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance [font-stretch:90%]">
          {title}
        </h3>
        <p className="text-lg leading-[1.55] text-graphite">{text}</p>
        <ul className="flex flex-col gap-3 pt-1.5">
          {points.map((point) => (
            <CheckItem key={point}>{point}</CheckItem>
          ))}
        </ul>
      </div>
      <div
        className={cn(
          "relative flex min-h-[480px] items-center justify-center overflow-hidden rounded-3xl bg-desk p-5 sm:p-8",
          reverse && "lg:order-1",
          visualClassName,
        )}
      >
        {visual}
      </div>
    </div>
  );
}

function BriefVisual() {
  const fields = [
    ["Offre", "Création de site web"],
    ["Cible", "Restaurants"],
    ["Zone", "Lyon · 15 km"],
    ["Ton", "Professionnel"],
  ];
  return (
    <div className={cn("flex w-full max-w-[520px] flex-col gap-5 rounded-2xl bg-paper p-6 sm:p-8", paperShadow)}>
      <span className="text-sm font-semibold">Que vendez-vous, et à qui ?</span>
      <p className="rounded-xl border-[1.5px] border-ink px-4.5 py-4 text-[19px] leading-[1.4]">
        Je crée des sites web pour les restaurants autour de Lyon
        <span className="ml-0.5 inline-block h-5 w-0.5 translate-y-1 animate-blink bg-ink" aria-hidden="true" />
      </p>
      <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.04em] text-graphite uppercase">
        <span className="size-2.5 bg-marker" aria-hidden="true" />
        L’agent a compris
      </p>
      <dl className="grid gap-2.5 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between rounded-[10px] border border-rule px-3.5 py-3">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-graphite">{label}</dt>
              <dd className="text-[15px] font-semibold">{value}</dd>
            </div>
            <PencilIcon size={15} strokeWidth={1.8} className="text-graphite" />
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-xs text-graphite">50 crédits au maximum</span>
        <span className="flex h-11 items-center rounded-[9px] bg-ink px-4.5 text-[15px] font-semibold text-paper">Lancer l’agent</span>
      </div>
    </div>
  );
}

function MapVisual() {
  const results = [
    ["Entreprises trouvées", "142"],
    ["Avec un site web", "97"],
    ["E-mails publics", "41"],
    ["Doublons écartés", "12"],
  ];
  return (
    <>
      <svg className="absolute inset-0 size-full" viewBox="0 0 740 480" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
        <path d="M-20 400 C 150 360, 300 440, 470 410 S 700 370, 760 390" stroke="#e3e2dd" strokeWidth="30" strokeLinecap="round" />
        <g stroke="#ffffff" strokeWidth="14" strokeLinecap="round">
          <path d="M-20 120 L760 80" />
          <path d="M-20 340 C 200 310, 480 380, 760 330" />
          <path d="M180 -20 L230 500" />
          <path d="M560 -20 C 530 160, 600 320, 560 500" />
        </g>
        <g stroke="#ffffff" strokeWidth="6" strokeLinecap="round">
          <path d="M-20 220 L760 200" />
          <path d="M-20 450 L760 460" />
          <path d="M330 -20 L360 500" />
          <path d="M450 -20 L430 500" />
          <path d="M660 -20 L690 500" />
        </g>
        <circle cx="400" cy="250" r="190" fill="#fdf156" fillOpacity="0.14" stroke="#12110f" strokeWidth="1.5" strokeDasharray="4 6" />
        <path d="M392 250h16M400 242v16" stroke="#12110f" strokeWidth="1.5" />
        <g fill="#b9b8b3">
          {[
            [330, 160], [450, 235], [300, 365], [520, 350], [385, 300], [290, 225], [640, 120], [670, 400], [140, 300],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" />
          ))}
        </g>
        <g fill="#fdf156" stroke="#12110f" strokeWidth="1.5">
          {[
            [303, 202], [423, 158], [473, 283], [343, 323], [253, 273], [403, 383], [523, 213],
          ].map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="14" height="14" />
          ))}
        </g>
      </svg>
      <dl className={cn("absolute top-6 left-6 flex min-w-[230px] flex-col gap-2.5 rounded-2xl bg-paper px-5 py-4.5 text-sm", paperShadow)}>
        <p className="font-mono text-[11px] tracking-[0.04em] text-graphite uppercase">Résultats · exemple</p>
        {results.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-7">
            <dt>{label}</dt>
            <dd className="font-mono font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="absolute bottom-6 left-6 flex flex-wrap gap-x-4.5 gap-y-1 rounded-[10px] bg-paper px-3.5 py-2.5 text-[13px]">
        <span className="flex items-center gap-2">
          <span className="size-2.5 bg-marker shadow-[inset_0_0_0_1.5px_var(--color-ink)]" aria-hidden="true" />
          Correspond à votre cible
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-disabled" aria-hidden="true" />
          Autres entreprises
        </span>
      </div>
      <span className="absolute right-7 bottom-7.5 hidden font-mono text-xs tracking-[0.06em] sm:block">RAYON 15 KM</span>
    </>
  );
}

function SiteToEmailVisual() {
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className={cn("w-[280px] overflow-hidden rounded-xl bg-paper xl:w-[300px]", paperShadow)}>
        <div className="flex h-8.5 items-center gap-1.5 border-b border-rule-soft px-3">
          <span className="size-2 rounded-full bg-rule" />
          <span className="size-2 rounded-full bg-rule" />
          <span className="size-2 rounded-full bg-rule" />
          <span className="ml-2 font-mono text-[11px] text-graphite">bistrot-margaux.fr</span>
        </div>
        <div className="flex flex-col gap-3 p-5">
          <span className="font-serif text-[22px] font-semibold">Bistrot Margaux</span>
          <span className="h-2 w-4/5 rounded bg-rule-soft" />
          <span className="h-2 w-3/5 rounded bg-rule-soft" />
          <span className="h-23 rounded-lg bg-[#f3f3f1]" />
          <span className="text-[13px]">
            <span className="bg-marker px-1">Menu du midi : voir Instagram</span>
          </span>
          <span className="h-2 w-[90%] rounded bg-rule-soft" />
          <span className="text-[13px]">
            <span className="bg-marker px-1">Réservations au 04 •• •• •• ••</span>
          </span>
          <span className="h-2 w-[70%] rounded bg-rule-soft" />
        </div>
      </div>
      <svg width="44" height="24" viewBox="0 0 44 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 rotate-90 sm:rotate-0" aria-hidden="true">
        <path d="M2 12h38" />
        <path d="M32 5l8 7-8 7" />
      </svg>
      <div className={cn("flex w-[280px] flex-col gap-3 bg-paper p-5.5 xl:w-[300px]", paperShadow)}>
        <span className="font-mono text-[10px] text-graphite">À : contact@bistrot-margaux.fr</span>
        <p className="font-serif text-[17px] leading-[1.3] font-semibold">Votre menu du midi, directement sur votre site ?</p>
        <p className="font-serif text-sm leading-[1.6]">
          Bonjour, j’ai vu que <span className="hl">votre menu du midi n’est publié que sur Instagram</span> et que{" "}
          <span className="hl">les réservations se font par téléphone</span>. Quinze minutes pour en parler ?
        </p>
      </div>
    </div>
  );
}

function ReviewSendVisual() {
  const rows = [
    { name: "Bistrot Margaux", state: "approved" },
    { name: "Le Petit Comptoir", state: "approved" },
    { name: "Maison Berthe", state: "rejected" },
    { name: "Sushi Kaze", state: "todo" },
  ];
  return (
    <div className="flex w-full flex-col gap-4 sm:block sm:min-h-[416px]">
      <div className={cn("flex w-full flex-col rounded-2xl bg-paper px-5.5 py-5 sm:absolute sm:top-11 sm:left-10 sm:w-[380px]", paperShadow)}>
        <div className="flex items-baseline justify-between pb-3">
          <span className="text-lg font-semibold">Relecture</span>
          <span className="font-mono text-xs text-graphite">3 à relire</span>
        </div>
        {rows.map((row) => (
          <div key={row.name} className="flex h-11.5 items-center justify-between border-t border-rule-soft text-[15px]">
            <span className={cn(row.state === "rejected" && "text-graphite line-through decoration-danger")}>{row.name}</span>
            {row.state === "approved" && (
              <span className="flex items-center gap-1.5 text-[13px] font-semibold text-success">
                <CheckIcon size={13} strokeWidth={2.6} />
                Approuvé
              </span>
            )}
            {row.state === "rejected" && <span className="text-[13px] font-semibold text-danger">Rejeté</span>}
            {row.state === "todo" && <span className="text-[13px] font-semibold">À relire</span>}
          </div>
        ))}
      </div>
      <div className="flex w-full flex-col gap-5.5 rounded-2xl bg-paper p-7 shadow-[0_30px_60px_-20px_rgba(18,17,15,0.35)] sm:absolute sm:right-10 sm:bottom-11 sm:w-[360px]">
        <span className="text-2xl font-semibold tracking-[-0.02em]">Envoyer 8 e-mails ?</span>
        <dl className="flex flex-col gap-2.5 text-sm">
          {[
            ["Depuis", "camille@studioroux.fr"],
            ["Rythme", "1 toutes les 15 min"],
            ["Désinscription", "Incluse"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="text-graphite">{label}</dt>
              <dd className="font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex justify-end gap-2" aria-hidden="true">
          <span className="flex h-10.5 items-center rounded-lg border border-line px-4 text-sm font-semibold">Annuler</span>
          <span className="flex h-10.5 items-center gap-1.5 rounded-lg bg-ink px-4 text-sm font-semibold text-paper">
            <SendIcon size={14} />
            Envoyer
          </span>
        </div>
      </div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="comment" className={cn("border-t border-rule bg-paper py-24 lg:py-35", sectionX)} aria-labelledby="comment-title">
      <div className="mx-auto flex max-w-[1312px] flex-col gap-24 lg:gap-28">
        <SectionHeading
          titleId="comment-title"
          eyebrow="Comment ça marche"
          title="De l’idée à l’envoi,"
          accent="en quatre étapes."
          lead="Vous décrivez, l’agent prépare, vous décidez. À chaque étape, vous voyez ce qu’il fait et pourquoi."
        />
        <Step
          index="01"
          title="Décrivez votre offre en une phrase"
          text="CloseBy comprend votre métier, votre cible et votre zone. Vous ajustez chaque paramètre avant de lancer l’agent."
          points={["Secteur, ville et rayon détectés", "Ton et langue du message au choix", "Nombre de prospects plafonné"]}
          visual={<BriefVisual />}
        />
        <Step
          index="02"
          reverse
          title="L’agent repère les entreprises autour de vous"
          text="Il consulte des sources publiques, écarte les doublons et ne garde que les entreprises qui correspondent à votre cible."
          points={["Recherche par activité, ville et rayon", "Doublons fusionnés automatiquement", "Source et date affichées pour chaque fiche"]}
          visual={<MapVisual />}
          visualClassName="p-0"
        />
        <Step
          index="03"
          title="Il lit leur site et écrit un e-mail unique"
          text="L’agent relève les faits utiles (menu, horaires, réservation, présence en ligne) et rédige un message qui s’appuie dessus."
          points={["Uniquement des pages publiques", "Chaque fait relié à sa source", "Ton adapté à votre offre"]}
          visual={<SiteToEmailVisual />}
        />
        <Step
          index="04"
          reverse
          title="Vous relisez, puis vous envoyez"
          text="Rien ne part sans votre accord. Les e-mails partent de votre boîte Gmail ou Outlook, espacés dans le temps pour rester naturels."
          points={["Approuver, modifier ou rejeter en un clic", "Envoi progressif et plafonné", "Suivi des envois et des réponses"]}
          visual={<ReviewSendVisual />}
        />
      </div>
    </section>
  );
}

