"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { Wordmark } from "@/components/ui/misc";
import { cn, formatNumber } from "@/lib/format";
import { account } from "@/lib/mock-data";

const tabs = [
  { href: "/tableau-de-bord", label: "Accueil" },
  { href: "/campagnes", label: "Campagnes" },
  { href: "/prospects", label: "Prospects" },
  { href: "/boites-mail", label: "Boîtes mail" },
  { href: "/credits", label: "Crédits" },
];

export function AppBar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper">
      <div className="flex h-16 items-center justify-between gap-6 px-4 sm:px-8">
        <div className="flex items-center gap-9">
          <Link href="/tableau-de-bord" className="text-[21px]" aria-label="CloseBy, accueil">
            <Wordmark />
          </Link>
          <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
            {tabs.map((tab) => {
              const active = isActive(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-9 items-center rounded-lg px-3.5 text-[15px] transition-colors",
                    active ? "bg-desk font-semibold text-ink" : "font-medium text-graphite hover:text-ink",
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/credits" className="hidden font-mono text-[13px] text-graphite hover:text-ink sm:inline">
            {formatNumber(account.credits.balance)} crédits
          </Link>
          <Link
            href="/reglages"
            aria-label="Réglages du compte"
            className="flex size-[34px] items-center justify-center rounded-full bg-ink text-xs font-semibold text-paper"
          >
            {account.initials}
          </Link>
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-lg md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {menuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav id="mobile-nav" aria-label="Navigation principale" className="flex flex-col border-t border-rule px-4 py-2 md:hidden">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => setMenuOpen(false)}
              aria-current={isActive(tab.href) ? "page" : undefined}
              className={cn("py-3 text-base", isActive(tab.href) ? "font-semibold" : "text-graphite")}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
