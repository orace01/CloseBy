import type { Metadata } from "next";
import { Settings } from "@/components/app/settings";
import { isAdmin, requireWorkspace } from "@/lib/dal";

export const metadata: Metadata = { title: "Réglages" };

export default async function SettingsPage() {
  const { user, workspace } = await requireWorkspace();
  return (
    <Settings
      isAdmin={isAdmin(user.email)}
      profile={{
        name: user.name,
        email: user.email,
        company: workspace.name,
        language: workspace.language,
        tone: workspace.tone,
        offer: workspace.offer,
        replyDetection: workspace.replyDetection,
      }}
    />
  );
}
