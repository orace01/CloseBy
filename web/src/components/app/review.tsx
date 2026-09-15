"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { EmailBody } from "@/components/app/page-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { CheckIcon, SendIcon } from "@/components/ui/icons";
import { cn, plural } from "@/lib/format";
import { account } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import type { DraftEmail, Prospect, ProspectStatus } from "@/lib/types";

const REVIEWABLE: ProspectStatus[] = ["to_review", "approved", "rejected"];

function toPlainText(draft: DraftEmail) {
  return draft.paragraphs.map((paragraph) => paragraph.map((segment) => segment.text).join("")).join("\n\n");
}

export function Review({ campaignId, initialProspectId }: { campaignId: string; initialProspectId?: string }) {
  const router = useRouter();
  const { state, dispatch } = useAppStore();
  const campaign = state.campaigns.find((c) => c.id === campaignId);
  const queue = state.prospects.filter(
    (p): p is Prospect & { draft: DraftEmail } =>
      p.campaignId === campaignId && Boolean(p.draft) && REVIEWABLE.includes(p.status),
  );

  const [selectedId, setSelectedId] = useState(
    () => queue.find((p) => p.id === initialProspectId)?.id ?? queue.find((p) => p.status === "to_review")?.id ?? queue[0]?.id,
  );
  const [editing, setEditing] = useState(false);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (confirmOpen && !dialog.open) dialog.showModal();
    if (!confirmOpen && dialog.open) dialog.close();
  }, [confirmOpen]);

  const current = queue.find((p) => p.id === selectedId) ?? queue[0];
  const toReviewCount = queue.filter((p) => p.status === "to_review").length;
  const approvedCount = queue.filter((p) => p.status === "approved").length;

  if (!campaign || !current) {
    return (
      <div className="mx-auto flex max-w-[640px] flex-col items-start gap-6 px-4 py-24">
        <h1 className="text-4xl font-semibold tracking-[-0.03em]">Aucun e-mail à relire</h1>
        <p className="text-lg text-graphite">L’agent n’a pas encore rédigé d’e-mail pour cette campagne.</p>
        <ButtonLink href="/campagnes" variant="secondary">
          Retour aux campagnes
        </ButtonLink>
      </div>
    );
  }

  function saveEdit() {
    const value = editorRef.current?.value;
    if (value !== undefined) setEdits((prev) => ({ ...prev, [current.id]: value }));
    setEditing(false);
  }

  function decide(status: ProspectStatus) {
    if (editing) saveEdit();
    dispatch({ type: "setProspectStatus", id: current.id, status });
    const next = queue.find((p) => p.id !== current.id && p.status === "to_review");
    if (next) setSelectedId(next.id);
  }

  function send() {
    dispatch({ type: "sendApproved", campaignId });
    setConfirmOpen(false);
    router.push("/campagnes");
  }

  const editedText = edits[current.id];

  return (
    <div className="grid flex-1 md:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="flex flex-col gap-6 border-b border-rule px-4 py-6 md:border-r md:border-b-0 md:px-5 md:py-8">
        <div className="flex items-baseline justify-between gap-3 px-3">
          <h1 className="text-[34px] leading-none font-semibold tracking-[-0.03em]">Relecture</h1>
          <span className="font-mono text-[13px] whitespace-nowrap text-graphite">{toReviewCount} à relire</span>
        </div>
        <ul className="flex flex-col gap-0.5">
          {queue.map((prospect) => (
            <li key={prospect.id}>
              <button
                type="button"
                onClick={() => {
                  if (editing) saveEdit();
                  setSelectedId(prospect.id);
                }}
                aria-current={prospect.id === current.id ? "true" : undefined}
                className={cn(
                  "flex h-12.5 w-full items-center justify-between gap-2.5 rounded-lg px-3 text-left text-[15px] transition-colors",
                  prospect.id === current.id ? "bg-desk font-bold" : "font-medium hover:bg-desk/60",
                  prospect.status === "rejected" && "text-graphite",
                )}
              >
                <span className={cn(prospect.status === "rejected" && "line-through decoration-danger")}>{prospect.name}</span>
                {prospect.status === "approved" && <CheckIcon size={16} strokeWidth={2.5} className="text-success" />}
                {prospect.status === "rejected" && <span className="sr-only">Rejeté</span>}
              </button>
            </li>
          ))}
        </ul>
        <Button onClick={() => setConfirmOpen(true)} disabled={approvedCount === 0} className="mt-auto h-12.5 text-[15px]">
          <SendIcon size={16} />
          {approvedCount ? `Envoyer ${plural(approvedCount, "e-mail")}` : "Aucun e-mail approuvé"}
        </Button>
      </aside>

      <section className="flex flex-col items-center justify-center gap-5 bg-desk px-4 py-8 sm:px-10" aria-label="E-mail sélectionné">
        <article
          className={cn(
            "flex w-full max-w-[700px] flex-col gap-5.5 bg-paper px-6 py-9 shadow-[0_1px_2px_rgba(18,17,15,0.08),0_24px_48px_-20px_rgba(18,17,15,0.16)] sm:px-14 sm:py-11.5",
            editing && "outline-2 outline-offset-6 outline-ink outline-dashed",
          )}
        >
          <div className="flex items-center justify-between gap-4 font-mono text-xs tracking-[0.04em] uppercase">
            <span className="text-graphite">
              {current.name} · {current.activity}
            </span>
            {editing && <span>Modification</span>}
          </div>
          <h2 className="font-serif text-[28px] leading-[1.2] font-semibold sm:text-[30px]">{current.draft.subject}</h2>
          {editing ? (
            <textarea
              ref={editorRef}
              aria-label="Texte de l’e-mail"
              defaultValue={editedText ?? toPlainText(current.draft)}
              rows={10}
              className="w-full resize-y rounded-lg border border-rule p-3 font-serif text-lg leading-[1.6]"
            />
          ) : editedText !== undefined ? (
            <div className="flex flex-col gap-3.5 font-serif text-[19px] leading-[1.65]">
              {editedText.split(/\n{2,}/).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <EmailBody draft={current.draft} />
          )}
          <Link
            href={`/prospects/${current.id}`}
            className="flex items-center gap-2 self-start font-mono text-xs text-graphite underline underline-offset-3 hover:text-ink"
          >
            <span className="size-3 bg-marker" aria-hidden="true" />
            {editedText !== undefined ? "Modifié par vous · voir les faits" : "Vérifié sur son site"}
          </Link>
        </article>

        <div className="flex w-full max-w-[700px] flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => decide("rejected")}
            className="h-11.5 px-1 text-[15px] font-semibold text-danger"
          >
            Rejeter
          </button>
          <div className="flex gap-2.5">
            <Button variant="secondary" onClick={() => (editing ? saveEdit() : setEditing(true))}>
              {editing ? "Terminer" : "Modifier"}
            </Button>
            <Button onClick={() => decide("approved")}>
              <CheckIcon size={17} strokeWidth={2.2} />
              Approuver
            </Button>
          </div>
        </div>
      </section>

      <dialog
        ref={dialogRef}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="send-title"
        className="m-auto w-[min(480px,calc(100%-32px))] rounded-2xl bg-paper p-9 text-ink backdrop:bg-ink/40"
      >
        <div className="flex flex-col gap-6">
          <h2 id="send-title" className="text-[28px] leading-[1.1] font-semibold tracking-[-0.03em]">
            Envoyer {plural(approvedCount, "e-mail")} ?
          </h2>
          <dl className="flex flex-col gap-2.5 text-[15px]">
            <div className="flex justify-between gap-4">
              <dt className="text-graphite">Depuis</dt>
              <dd className="font-semibold">{account.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-graphite">Rythme</dt>
              <dd className="font-semibold">1 e-mail toutes les 15 min</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-graphite">Désinscription</dt>
              <dd className="font-semibold">Incluse</dd>
            </div>
          </dl>
          <div className="flex justify-end gap-2.5">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Annuler
            </Button>
            <Button onClick={send}>Envoyer</Button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
