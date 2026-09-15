"use client";

// No backend yet: forms accept any input and move on to the next screen.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";
import { TextField } from "@/components/ui/misc";

function AuthCard({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="flex w-full max-w-[400px] flex-col gap-7">
      <h1 className="text-[40px] leading-[1.05] font-semibold tracking-[-0.03em]">{title}</h1>
      {children}
      <p className="flex flex-wrap gap-1.5 text-[15px] text-graphite">{footer}</p>
    </div>
  );
}

const footerLink = "font-semibold text-ink underline underline-offset-3";

export function LoginForm() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/tableau-de-bord");
  }

  return (
    <AuthCard
      title="Connexion"
      footer={
        <>
          Pas encore de compte ?
          <Link href="/inscription" className={footerLink}>
            Créer un compte
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <TextField id="email" name="email" type="email" label="E-mail" placeholder="vous@entreprise.fr" autoComplete="email" required />
          <TextField
            id="password"
            name="password"
            type="password"
            label="Mot de passe"
            placeholder="8 caractères minimum"
            autoComplete="current-password"
            minLength={8}
            required
          />
          <Link href="/mot-de-passe-oublie" className="self-start text-sm text-graphite underline underline-offset-3 hover:text-ink">
            Mot de passe oublié ?
          </Link>
        </div>
        <Button type="submit" className="h-13">
          Se connecter
        </Button>
      </form>
    </AuthCard>
  );
}

export function SignupForm() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/bienvenue");
  }

  return (
    <AuthCard
      title="Créer un compte"
      footer={
        <>
          Déjà inscrit ?
          <Link href="/connexion" className={footerLink}>
            Connexion
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <TextField id="email" name="email" type="email" label="E-mail" placeholder="vous@entreprise.fr" autoComplete="email" required />
          <TextField
            id="password"
            name="password"
            type="password"
            label="Mot de passe"
            placeholder="8 caractères minimum"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        <Button type="submit" className="h-13">
          Créer mon compte
        </Button>
      </form>
    </AuthCard>
  );
}

export function ResetForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <AuthCard
      title="Mot de passe oublié"
      footer={
        <Link href="/connexion" className={footerLink}>
          Retour à la connexion
        </Link>
      }
    >
      {sent ? (
        <p role="status" className="flex items-center gap-2.5 rounded-[10px] bg-desk px-4.5 py-4 text-base">
          <CheckIcon className="text-success" strokeWidth={2.4} />
          Lien envoyé. Vérifiez vos e-mails.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <TextField id="email" name="email" type="email" label="E-mail" placeholder="vous@entreprise.fr" autoComplete="email" required />
          <Button type="submit" className="h-13">
            Envoyer le lien
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
