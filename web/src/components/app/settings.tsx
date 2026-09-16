"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { PageContainer, PageTitle } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { deleteAccount, setReplyDetection } from "@/lib/actions/account";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/format";

export interface SettingsProfile {
  name: string;
  email: string;
  company: string;
  language: string;
  tone: string;
  offer: string | null;
  replyDetection: boolean;
}

const languages: Record<string, string> = { fr: "Français", en: "English" };

export function Settings({ profile, isAdmin }: { profile: SettingsProfile; isAdmin: boolean }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [replyDetection, setReplyDetectionState] = useState(profile.replyDetection);
  const [pending, startTransition] = useTransition();

  function toggleReplyDetection() {
    const next = !replyDetection;
    setReplyDetectionState(next);
    startTransition(() => setReplyDetection(next));
  }

  const rows = [
    { label: "Nom", value: profile.name },
    { label: "E-mail", value: profile.email },
    { label: "Entreprise", value: profile.company },
    { label: "Offre", value: profile.offer ?? "Non renseignée" },
    { label: "Langue des e-mails", value: languages[profile.language] ?? profile.language },
    { label: "Ton par défaut", value: profile.tone },
  ];

  return (
    <PageContainer size="md" className="gap-9">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageTitle>Réglages</PageTitle>
        <form action={signOut}>
          <Button type="submit" variant="secondary" size="sm">
            Se déconnecter
          </Button>
        </form>
      </div>

      <dl className="flex flex-col border-t border-rule">
        {rows.map((row) => (
          <div key={row.label} className="flex min-h-15.5 flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-rule-soft py-3">
            <dt className="text-graphite">{row.label}</dt>
            <dd className="max-w-[460px] text-right font-semibold">{row.value}</dd>
          </div>
        ))}
        <div className="flex min-h-15.5 items-center justify-between gap-6 border-b border-rule-soft py-3">
          <dt id="reply-detection" className="text-graphite">
            Détection des réponses
          </dt>
          <dd>
            <button
              type="button"
              role="switch"
              aria-checked={replyDetection}
              aria-labelledby="reply-detection"
              onClick={toggleReplyDetection}
              className={cn("relative h-7 w-12 rounded-full transition-colors", replyDetection ? "bg-ink" : "bg-rule")}
            >
              <span
                className={cn(
                  "absolute top-[3px] left-[3px] size-5.5 rounded-full bg-paper transition-transform",
                  replyDetection && "translate-x-5",
                )}
              />
            </button>
          </dd>
        </div>
      </dl>

      <section className="flex flex-col gap-3.5" aria-labelledby="privacy">
        <h2 id="privacy" className="text-xl font-semibold">
          Confidentialité
        </h2>
        {confirmDelete ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-danger-soft px-4.5 py-3.5">
            <span className="font-semibold text-danger">Supprimer définitivement le compte et ses données ?</span>
            <div className="flex gap-2.5">
              <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(false)}>
                Annuler
              </Button>
              <Button variant="danger" size="sm" disabled={pending} onClick={() => startTransition(() => deleteAccount())}>
                {pending ? "Suppression…" : "Supprimer"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-x-7 gap-y-3">
            <a href="/api/export" download className="font-semibold">
              Exporter mes données
            </a>
            <button type="button" className="font-semibold text-danger" onClick={() => setConfirmDelete(true)}>
              Supprimer mon compte
            </button>
          </div>
        )}
      </section>

      {isAdmin && (
        <Link href="/admin" className="self-start font-mono text-xs text-graphite underline underline-offset-3 hover:text-ink">
          Console d’administration
        </Link>
      )}
    </PageContainer>
  );
}
