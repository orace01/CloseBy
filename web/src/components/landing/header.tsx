import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Wordmark } from "@/components/ui/misc";

const sections = [
  { href: "#produit", label: "Produit" },
  { href: "#comment", label: "Comment ça marche" },
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#usages", label: "Cas d’usage" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <>
      <div className="flex h-10 items-center justify-center gap-3 bg-ink px-4 text-sm text-paper">
        <span className="size-2 bg-marker" aria-hidden="true" />
        <span>Programme pilote ouvert</span>
        <a href="#pilote" className="flex items-center gap-1 font-semibold text-marker hover:underline">
          Rejoindre <ArrowRightIcon size={14} strokeWidth={2.2} />
        </a>
      </div>
      <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-[1440px] items-center justify-between gap-6 px-4 sm:px-8 lg:px-16">
          <Link href="/" className="text-2xl" aria-label="CloseBy, accueil">
            <Wordmark />
          </Link>
          <nav aria-label="Sections de la page" className="hidden items-center gap-7.5 text-[15px] xl:flex">
            {sections.map((section) => (
              <a key={section.href} href={section.href} className="text-body transition-colors hover:text-ink">
                {section.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-5">
            <Link href="/connexion" className="hidden text-[15px] font-medium hover:text-graphite sm:inline">
              Connexion
            </Link>
            <ButtonLink href="/inscription" size="sm" className="h-10.5 text-[15px]">
              Commencer
            </ButtonLink>
          </div>
        </div>
      </header>
    </>
  );
}
