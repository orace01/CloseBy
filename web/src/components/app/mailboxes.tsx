import { PageContainer, PageTitle } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { MailIcon } from "@/components/ui/icons";

export interface ConnectedMailbox {
  provider: "gmail" | "outlook";
  email: string;
  connected: boolean;
}

const providers = [
  { id: "gmail", label: "Gmail" },
  { id: "outlook", label: "Outlook" },
] as const;

export function Mailboxes({ mailboxes }: { mailboxes: ConnectedMailbox[] }) {
  return (
    <PageContainer size="sm" className="gap-8 sm:pt-16">
      <div className="flex flex-col gap-3">
        <PageTitle>Boîtes mail</PageTitle>
        <p className="text-lg text-graphite">Vos e-mails partiront de votre propre adresse.</p>
      </div>

      <ul className="flex flex-col gap-3">
        {providers.map((provider) => {
          const mailbox = mailboxes.find((m) => m.provider === provider.id && m.connected);
          return (
            <li key={provider.id} className="flex flex-wrap items-center gap-4.5 rounded-2xl border border-rule px-6 py-5.5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-desk">
                <MailIcon size={22} strokeWidth={1.8} />
              </span>
              <div className="flex min-w-40 flex-1 flex-col gap-1">
                <span className="text-lg font-semibold">{provider.label}</span>
                <span className="text-[15px] text-graphite">{mailbox ? mailbox.email : "Non connectée"}</span>
              </div>
              {/* OAuth connection is the next step to build. */}
              <Button size="sm" variant="secondary" disabled>
                Bientôt disponible
              </Button>
            </li>
          );
        })}
      </ul>

      <p className="text-sm text-graphite">
        La connexion passera par Google ou Microsoft : CloseBy ne verra jamais votre mot de passe.
      </p>
    </PageContainer>
  );
}
