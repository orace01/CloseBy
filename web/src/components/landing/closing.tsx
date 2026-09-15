import Link from "next/link";
import { PlusIcon } from "@/components/ui/icons";
import { Wordmark } from "@/components/ui/misc";
import { cn } from "@/lib/format";
import { delay, sectionX } from "./common";
import { PilotForm } from "./pilot-form";

const questions = [
  {
    q: "D’où viennent les informations sur les entreprises ?",
    a: "De sources publiques : fiches d’établissements et pages publiques de leur site. Chaque information utilisée affiche sa source et sa date.",
  },
  {
    q: "Les e-mails partent-ils de CloseBy ?",
    a: "Non. Ils partent de votre propre boîte Gmail ou Outlook, connectée de façon sécurisée, et seulement après votre accord.",
  },
  {
    q: "L’IA peut-elle inventer des choses ?",
    a: "L’agent rédige à partir des faits trouvés, chacun relié à sa source. Un élément sans source est signalé, et vous relisez toujours avant l’envoi.",
  },
  {
    q: "La prospection par e-mail est-elle autorisée ?",
    a: "Entre professionnels, elle est encadrée : le message doit concerner l’activité du destinataire, qui doit pouvoir s’opposer facilement. CloseBy intègre la désinscription, mais vous restez responsable de vos campagnes.",
  },
  {
    q: "Que se passe-t-il si un prospect ne veut plus être contacté ?",
    a: "Il est ajouté immédiatement à votre liste d’exclusion et ne peut plus être ciblé par vos campagnes.",
  },
  {
    q: "Qu’est-ce qu’un crédit ?",
    a: "Un crédit correspond à un prospect analysé pour lequel un e-mail est rédigé. Les régénérations sont incluses, et une recherche sans résultat ne coûte rien.",
  },
  {
    q: "Puis-je mettre une campagne en pause ?",
    a: "Oui, à tout moment et en un clic. Les envois en attente sont suspendus aussitôt.",
  },
];

export function Faq() {
  return (
    <section id="faq" className={cn("bg-paper py-24 lg:py-35", sectionX)} aria-labelledby="faq-title">
      <div className="mx-auto grid max-w-[1312px] gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-24">
        <div className="flex flex-col gap-6">
          <p data-reveal style={delay(0)} className="font-mono text-[13px] tracking-[0.06em] text-graphite uppercase">
            Questions fréquentes
          </p>
          <h2
            data-reveal
            style={delay(1)}
            id="faq-title"
            className="font-condensed text-[clamp(44px,4.5vw,64px)] leading-[0.98] font-semibold tracking-[-0.045em] text-balance"
          >
            Vous vous demandez <span className="font-serif font-medium tracking-[-0.03em] italic">peut-être…</span>
          </h2>
          <p data-reveal style={delay(2)} className="text-lg text-graphite">
            Une autre question ?{" "}
            <a href="mailto:contact@closeby.fr" className="font-semibold text-ink underline underline-offset-4">
              Écrivez-nous
            </a>
            .
          </p>
        </div>
        <div className="border-t border-rule">
          {questions.map((item, i) => (
            <details key={item.q} name="faq" open={i === 0} data-reveal="fade" style={delay(i)} className="faq-item group border-b border-rule">
              <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-6 py-4 text-[21px] font-semibold tracking-[-0.01em] [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-desk transition-colors group-open:bg-ink group-open:text-paper">
                  <PlusIcon size={18} className="transition-transform group-open:rotate-45" />
                </span>
              </summary>
              <p className="max-w-[640px] pb-7 text-lg leading-[1.6] text-graphite">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PilotCta() {
  return (
    <section id="pilote" className={cn("border-t border-rule bg-paper pt-28 pb-24 lg:pt-40 lg:pb-35", sectionX)} aria-labelledby="pilot-title">
      <div className="mx-auto flex max-w-[1312px] flex-col gap-16">
        <h2
          data-reveal
          id="pilot-title"
          className="text-[clamp(64px,10.4vw,150px)] leading-[0.88] font-semibold tracking-[-0.055em] text-balance [font-stretch:80%]"
        >
          Votre prochain client est à deux{" "}
          <span data-sweep style={delay(0, 1000)} className="hl-strong pr-3 pl-1 font-serif font-medium tracking-[-0.04em] italic">
            rues.
          </span>
        </h2>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-end lg:gap-16">
          <p data-reveal style={delay(2)} className="max-w-[540px] text-[22px] leading-normal text-pretty text-body">
            Rejoignez le programme pilote : laissez votre e-mail professionnel, nous vous aidons à lancer votre première
            campagne.
          </p>
          <div data-reveal style={delay(3)}>
            <PilotForm />
          </div>
        </div>
      </div>
    </section>
  );
}

const footerColumns = [
  {
    title: "Produit",
    links: [
      { href: "#fonctionnalites", label: "Fonctionnalités" },
      { href: "#comment", label: "Comment ça marche" },
      { href: "#tarifs", label: "Tarifs" },
      { href: "#demo", label: "Démo" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { href: "#pilote", label: "Programme pilote" },
      { href: "mailto:contact@closeby.fr", label: "Contact" },
    ],
  },
  {
    title: "Compte",
    links: [
      { href: "/connexion", label: "Connexion" },
      { href: "/inscription", label: "Créer un compte" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className={cn("flex flex-col gap-18 overflow-hidden bg-ink pt-24 text-paper", sectionX)}>
      <div className="mx-auto grid w-full max-w-[1312px] gap-12 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
        <div data-reveal className="flex flex-col gap-4.5">
          <Wordmark onDark className="text-[26px]" />
          <p className="max-w-[320px] leading-normal text-night-muted">
            L’agent qui trouve vos prochains clients près de chez vous, et vous laisse le dernier mot.
          </p>
        </div>
        {footerColumns.map((column, i) => (
          <nav key={column.title} data-reveal style={delay(i + 1)} aria-label={column.title} className="flex flex-col gap-3.5 text-[15px]">
            <p className="font-mono text-[11px] tracking-[0.08em] text-night-muted uppercase">{column.title}</p>
            {column.links.map((link) =>
              link.href.startsWith("/") ? (
                <Link key={link.label} href={link.href} className="text-night-text hover:text-paper">
                  {link.label}
                </Link>
              ) : (
                <a key={link.label} href={link.href} className="text-night-text hover:text-paper">
                  {link.label}
                </a>
              ),
            )}
          </nav>
        ))}
      </div>
      <div className="mx-auto flex w-full max-w-[1312px] items-center justify-between gap-4 border-t border-night-rule pt-6 text-sm text-night-muted">
        <span>© 2026 CloseBy</span>
        <span>Fait pour les indépendants et les petites équipes</span>
      </div>
      <p
        aria-hidden="true"
        data-reveal
        style={delay(2)}
        className="mx-auto -mb-[0.1em] w-full max-w-[1312px] text-[clamp(96px,24vw,348px)] leading-[0.74] font-bold tracking-[-0.075em] whitespace-nowrap"
      >
        Close<span className="text-marker">By</span>
      </p>
    </footer>
  );
}
