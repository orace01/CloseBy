import type { Metadata } from "next";
import { Credits } from "@/components/app/credits";

export const metadata: Metadata = { title: "Crédits" };

export default function CreditsPage() {
  return <Credits />;
}
