"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";
import { TextField } from "@/components/ui/misc";
import { requestReset, resetPassword, signIn, signUp, type FormState } from "@/lib/actions/auth";

function AuthCard({ title, children, footer }: { title: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex w-full max-w-[400px] flex-col gap-7">
      <h1 className="text-[40px] leading-[1.05] font-semibold tracking-[-0.03em]">{title}</h1>
      {children}
      {footer && <p className="flex flex-wrap gap-1.5 text-[15px] text-graphite">{footer}</p>}
    </div>
  );
}

function Alert({ state }: { state: FormState }) {
  if (!state?.error) return null;
  return (
    <p role="alert" className="rounded-[10px] bg-danger-soft px-4 py-3 text-[15px] leading-snug text-danger">
      {state.error}
    </p>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="flex items-start gap-2.5 rounded-[10px] bg-desk px-4.5 py-4 text-base leading-snug">
      <CheckIcon className="mt-0.5 shrink-0 text-success" strokeWidth={2.4} />
      <span>{children}</span>
    </p>
  );
}

const footerLink = "font-semibold text-ink underline underline-offset-3";

export function LoginForm({ next, notice, canResetPassword }: { next?: string; notice?: string; canResetPassword: boolean }) {
  const [state, action, pending] = useActionState(signIn, undefined);

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
      {notice && <Notice>{notice}</Notice>}
      <form action={action} className="flex flex-col gap-6">
        {next && <input type="hidden" name="suite" value={next} />}
        <Alert state={state} />
        <div className="flex flex-col gap-4">
          <TextField
            id="email"
            name="email"
            type="email"
            label="E-mail"
            placeholder="vous@entreprise.fr"
            autoComplete="email"
            defaultValue={state?.email}
            required
          />
          <TextField id="password" name="password" type="password" label="Mot de passe" autoComplete="current-password" required />
          {canResetPassword && (
            <Link href="/mot-de-passe-oublie" className="self-start text-sm text-graphite underline underline-offset-3 hover:text-ink">
              Mot de passe oublié ?
            </Link>
          )}
        </div>
        <Button type="submit" className="h-13" disabled={pending}>
          {pending ? "Connexion…" : "Se connecter"}
        </Button>
      </form>
    </AuthCard>
  );
}

export function SignupForm() {
  const [state, action, pending] = useActionState(signUp, undefined);

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
      <form action={action} className="flex flex-col gap-6">
        <Alert state={state} />
        <div className="flex flex-col gap-4">
          <TextField
            id="email"
            name="email"
            type="email"
            label="E-mail professionnel"
            placeholder="vous@entreprise.fr"
            autoComplete="email"
            defaultValue={state?.email}
            required
          />
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
        <Button type="submit" className="h-13" disabled={pending}>
          {pending ? "Création du compte…" : "Créer mon compte"}
        </Button>
      </form>
    </AuthCard>
  );
}

export function ResetRequestForm() {
  const [state, action, pending] = useActionState(requestReset, undefined);

  return (
    <AuthCard
      title="Mot de passe oublié"
      footer={
        <Link href="/connexion" className={footerLink}>
          Retour à la connexion
        </Link>
      }
    >
      {state?.done ? (
        <Notice>
          Si un compte existe pour {state.email}, un lien pour choisir un nouveau mot de passe vient d’être envoyé.
        </Notice>
      ) : (
        <form action={action} className="flex flex-col gap-6">
          <Alert state={state} />
          <TextField
            id="email"
            name="email"
            type="email"
            label="E-mail"
            placeholder="vous@entreprise.fr"
            autoComplete="email"
            defaultValue={state?.email}
            required
          />
          <Button type="submit" className="h-13" disabled={pending}>
            {pending ? "Envoi…" : "Envoyer le lien"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}

export function NewPasswordForm({ token }: { token?: string }) {
  const [state, action, pending] = useActionState(resetPassword, undefined);

  if (!token) {
    return (
      <AuthCard title="Lien expiré">
        <p className="text-lg leading-normal text-graphite">Ce lien n’est plus valable. Demandez-en un nouveau pour choisir votre mot de passe.</p>
        <Link href="/mot-de-passe-oublie" className="self-start font-semibold underline underline-offset-4">
          Recevoir un nouveau lien
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Nouveau mot de passe">
      <form action={action} className="flex flex-col gap-6">
        <input type="hidden" name="token" value={token} />
        <Alert state={state} />
        <div className="flex flex-col gap-4">
          <TextField
            id="password"
            name="password"
            type="password"
            label="Nouveau mot de passe"
            placeholder="8 caractères minimum"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <TextField id="confirm" name="confirm" type="password" label="Confirmer le mot de passe" autoComplete="new-password" required />
        </div>
        <Button type="submit" className="h-13" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </AuthCard>
  );
}
