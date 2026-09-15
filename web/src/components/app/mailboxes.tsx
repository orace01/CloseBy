"use client";

import { PageContainer, PageTitle } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { MailIcon } from "@/components/ui/icons";
import { useAppStore } from "@/lib/store";

export function Mailboxes() {
  const { state, dispatch } = useAppStore();

  return (
    <PageContainer size="sm" className="gap-8 sm:pt-16">
      <div className="flex flex-col gap-3">
        <PageTitle>Boîtes mail</PageTitle>
        <p className="text-lg text-graphite">Vos e-mails partent de votre propre adresse.</p>
      </div>

      <ul className="flex flex-col gap-3">
        {state.mailboxes.map((mailbox) => (
          <li key={mailbox.id} className="flex flex-wrap items-center gap-4.5 rounded-2xl border border-rule px-6 py-5.5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-desk">
              <MailIcon size={22} strokeWidth={1.8} />
            </span>
            <div className="flex min-w-40 flex-1 flex-col gap-1">
              <span className="text-lg font-semibold">{mailbox.label}</span>
              <span className="text-[15px] text-graphite">{mailbox.connected ? mailbox.email : "Non connectée"}</span>
            </div>
            {mailbox.connected && (
              <span className="flex items-center gap-2 text-sm font-semibold text-success">
                <span className="size-2 rounded-full bg-success" aria-hidden="true" />
                Connectée
              </span>
            )}
            <Button
              size="sm"
              variant={mailbox.connected ? "secondary" : "primary"}
              onClick={() => dispatch({ type: "toggleMailbox", id: mailbox.id })}
            >
              {mailbox.connected ? "Déconnecter" : "Connecter"}
            </Button>
          </li>
        ))}
      </ul>

      <p className="text-sm text-graphite">
        La connexion passe par Google ou Microsoft : CloseBy ne voit jamais votre mot de passe.
      </p>
    </PageContainer>
  );
}
