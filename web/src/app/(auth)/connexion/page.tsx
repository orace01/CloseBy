import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/auth-forms";
import { emailFlowsEnabled } from "@/lib/auth-config";
import { redirectIfSignedIn } from "@/lib/dal";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: PageProps<"/connexion">) {
  await redirectIfSignedIn();
  const params = await searchParams;
  const next = typeof params.suite === "string" ? params.suite : undefined;
  const notice = params.reinitialise ? "Mot de passe modifié. Vous pouvez vous connecter." : undefined;
  return <LoginForm next={next} notice={notice} canResetPassword={emailFlowsEnabled} />;
}
