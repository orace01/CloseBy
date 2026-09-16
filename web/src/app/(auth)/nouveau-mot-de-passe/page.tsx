import type { Metadata } from "next";
import { NewPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default async function NewPasswordPage({ searchParams }: PageProps<"/nouveau-mot-de-passe">) {
  const params = await searchParams;
  const token = typeof params.token === "string" && !params.error ? params.token : undefined;
  return <NewPasswordForm token={token} />;
}
