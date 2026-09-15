import type { Metadata } from "next";
import { Settings } from "@/components/app/settings";

export const metadata: Metadata = { title: "Réglages" };

export default function SettingsPage() {
  return <Settings />;
}
