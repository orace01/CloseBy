import type { Metadata } from "next";
import Link from "next/link";
import { MailIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Confirmez votre adresse" };

export default async function VerifyEmailPage({ searchParams }: PageProps<"/verifier-email">) {
  const params = await searchParams;
  const email = typeof params.email === "string" ? params.email : undefined;

  return (
    <div className="flex w-full max-w-[440px] flex-col gap-7">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-desk">
        <MailIcon size={26} strokeWidth={1.8} />
      </span>
      <h1 className="text-[40px] leading-[1.05] font-semibold tracking-[-0.03em]">Vérifiez vos e-mails</h1>
      <p className="text-lg leading-normal text-graphite">
        Nous avons envoyé un lien de confirmation {email ? <>à <strong className="font-semibold text-ink">{email}</strong></> : "à votre adresse"}.
        Ouvrez-le pour activer votre compte et continuer.
      </p>
      {process.env.NODE_ENV !== "production" && (
        <p className="rounded-[10px] bg-desk px-4 py-3 font-mono text-[13px] leading-normal text-graphite">
          En développement, le lien s’affiche dans le terminal du serveur Next.js.
        </p>
      )}
      <p className="text-[15px] text-graphite">
        Déjà confirmé ?{" "}
        <Link href="/connexion" className="font-semibold text-ink underline underline-offset-3">
          Connexion
        </Link>
      </p>
    </div>
  );
}
