import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Onboarding } from "@/components/auth/onboarding";
import { requireUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Bienvenue" };

export default async function WelcomePage() {
  const user = await requireUser();
  if (user.onboardedAt) redirect("/tableau-de-bord");
  return <Onboarding />;
}
