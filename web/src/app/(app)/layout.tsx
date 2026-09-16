import type { ReactNode } from "react";
import { AppBar } from "@/components/app/app-bar";
import { requireWorkspace } from "@/lib/dal";
import { initialsOf } from "@/lib/format";

// Server actions here may start the agent in the background (see lib/agent/runner).
export const maxDuration = 300;

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { user, workspace } = await requireWorkspace();

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <AppBar initials={initialsOf(user.name)} credits={workspace.creditBalance} />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
