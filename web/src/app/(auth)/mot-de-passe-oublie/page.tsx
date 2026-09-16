import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResetRequestForm } from "@/components/auth/auth-forms";
import { emailFlowsEnabled } from "@/lib/auth-config";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ResetPasswordPage() {
  // Password reset relies on email; unavailable until a provider is configured.
  if (!emailFlowsEnabled) redirect("/connexion");
  return <ResetRequestForm />;
}
