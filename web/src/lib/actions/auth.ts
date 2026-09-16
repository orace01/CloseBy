"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { emailFlowsEnabled } from "@/lib/auth-config";

export type FormState = { error?: string; email?: string; done?: boolean } | undefined;

const emailField = z.email("Saisissez une adresse e-mail valide.");
const newPasswordField = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
  .max(128, "Le mot de passe est trop long.");

function messageFor(error: unknown) {
  if (error instanceof APIError) {
    switch (error.body?.code) {
      case "USER_ALREADY_EXISTS":
      case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
        return "Un compte existe déjà avec cette adresse. Connectez-vous ou réinitialisez votre mot de passe.";
      case "INVALID_EMAIL_OR_PASSWORD":
        return "E-mail ou mot de passe incorrect.";
      case "EMAIL_NOT_VERIFIED":
        return "Votre adresse n’est pas encore confirmée. Nous venons de vous renvoyer l’e-mail de confirmation.";
      case "PASSWORD_TOO_SHORT":
        return "Le mot de passe doit contenir au moins 8 caractères.";
      case "INVALID_TOKEN":
        return "Ce lien n’est plus valable. Demandez-en un nouveau.";
    }
  }
  console.error("[auth]", error);
  return "Une erreur est survenue. Réessayez dans un instant.";
}

/** Only allow redirects to paths inside the app. */
function safePath(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : null;
}

export async function signUp(_state: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const parsed = z.object({ email: emailField, password: newPasswordField }).safeParse({ email, password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0].message, email };

  try {
    await auth.api.signUpEmail({
      body: {
        name: parsed.data.email.split("@")[0],
        email: parsed.data.email,
        password: parsed.data.password,
        callbackURL: "/bienvenue",
      },
      headers: await headers(),
    });
  } catch (error) {
    return { error: messageFor(error), email };
  }
  // Without email confirmation, sign-up opens a session right away.
  redirect(emailFlowsEnabled ? `/verifier-email?email=${encodeURIComponent(parsed.data.email)}` : "/bienvenue");
}

export async function signIn(_state: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const parsed = z
    .object({ email: emailField, password: z.string().min(1, "Saisissez votre mot de passe.") })
    .safeParse({ email, password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0].message, email };

  try {
    await auth.api.signInEmail({
      body: { email: parsed.data.email, password: parsed.data.password, callbackURL: "/bienvenue" },
      headers: await headers(),
    });
  } catch (error) {
    return { error: messageFor(error), email };
  }
  redirect(safePath(formData.get("suite")) ?? "/tableau-de-bord");
}

export async function requestReset(_state: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const parsed = emailField.safeParse(email);
  if (!parsed.success) return { error: parsed.error.issues[0].message, email };

  try {
    await auth.api.requestPasswordReset({
      body: { email: parsed.data, redirectTo: "/nouveau-mot-de-passe" },
      headers: await headers(),
    });
  } catch (error) {
    return { error: messageFor(error), email };
  }
  // Same answer whether or not the account exists.
  return { done: true, email };
}

export async function resetPassword(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = z
    .object({ token: z.string().min(1), password: newPasswordField, confirm: z.string() })
    .refine((data) => data.password === data.confirm, { message: "Les deux mots de passe ne correspondent pas." })
    .safeParse({ token: formData.get("token"), password: formData.get("password"), confirm: formData.get("confirm") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await auth.api.resetPassword({ body: { newPassword: parsed.data.password, token: parsed.data.token }, headers: await headers() });
  } catch (error) {
    return { error: messageFor(error) };
  }
  redirect("/connexion?reinitialise=1");
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/connexion");
}
