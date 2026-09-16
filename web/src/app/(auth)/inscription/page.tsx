import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/auth-forms";
import { redirectIfSignedIn } from "@/lib/dal";

export const metadata: Metadata = { title: "Créer un compte" };

export default async function SignupPage() {
  await redirectIfSignedIn();
  return <SignupForm />;
}
