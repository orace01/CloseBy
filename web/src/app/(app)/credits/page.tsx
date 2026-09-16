import type { Metadata } from "next";
import { Credits } from "@/components/app/credits";
import { requireWorkspace } from "@/lib/dal";

export const metadata: Metadata = { title: "Crédits" };

export default async function CreditsPage() {
  const { workspace } = await requireWorkspace();
  return (
    <Credits
      balance={workspace.creditBalance}
      planId={workspace.planId}
      renewsOn={workspace.creditsRenewAt?.toISOString() ?? null}
    />
  );
}
