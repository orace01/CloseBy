import type { Metadata } from "next";
import { ResetForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ResetPasswordPage() {
  return <ResetForm />;
}
