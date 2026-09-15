"use client";

import Link from "next/link";
import { useState } from "react";
import { PageContainer, PageTitle } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { cn, formatNumber } from "@/lib/format";
import { account } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";

export function Settings() {
  const { state, dispatch } = useAppStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [exportRequested, setExportRequested] = useState(false);

  const rows = [
    { label: "Nom", value: account.name },
    { label: "Entreprise", value: account.company },
    { label: "E-mail", value: account.email },
    { label: "Langue des e-mails", value: account.language },
    { label: "Ton par défaut", value: account.tone },
    { label: "Adresses exclues", value: formatNumber(account.excludedCount) },
  ];

  return (
    <PageContainer size="md" className="gap-9">
      <PageTitle>Réglages</PageTitle>

      <dl className="flex flex-col border-t border-rule">
        {rows.map((row) => (
          <div key={row.label} className="flex min-h-15.5 flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-rule-soft py-3">
            <dt className="text-graphite">{row.label}</dt>
            <dd className="font-semibold">{row.value}</dd>
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
              aria-checked={state.replyDetection}
              aria-labelledby="reply-detection"
              onClick={() => dispatch({ type: "setReplyDetection", value: !state.replyDetection })}
              className={cn(
                "relative h-7 w-12 rounded-full transition-colors",
                state.replyDetection ? "bg-ink" : "bg-rule",
              )}
            >
              <span
                className={cn(
                  "absolute top-[3px] left-[3px] size-5.5 rounded-full bg-paper transition-transform",
                  state.replyDetection && "translate-x-5",
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
              <Button variant="danger" size="sm">
                Supprimer
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-x-7 gap-y-3">
            <button type="button" className="font-semibold" onClick={() => setExportRequested(true)}>
              Exporter mes données
            </button>
            <button type="button" className="font-semibold text-danger" onClick={() => setConfirmDelete(true)}>
              Supprimer mon compte
            </button>
          </div>
        )}
        {exportRequested && (
          <p role="status" className="text-sm text-graphite">
            Vous recevrez un lien de téléchargement par e-mail.
          </p>
        )}
      </section>

      <Link href="/admin" className="self-start font-mono text-xs text-graphite underline underline-offset-3 hover:text-ink">
        Console d’administration
      </Link>
    </PageContainer>
  );
}
