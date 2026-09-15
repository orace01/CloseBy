import type { Metadata } from "next";
import { Onboarding } from "@/components/auth/onboarding";

export const metadata: Metadata = { title: "Bienvenue" };

export default function WelcomePage() {
  return <Onboarding />;
}
