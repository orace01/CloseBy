import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { Mailboxes } from "@/components/app/mailboxes";
import { db } from "@/db";
import { mailIdentity } from "@/db/schema";
import { requireWorkspace } from "@/lib/dal";

export const metadata: Metadata = { title: "Boîtes mail" };

export default async function MailboxesPage() {
  const { workspace } = await requireWorkspace();
  const mailboxes = await db
    .select({ provider: mailIdentity.provider, email: mailIdentity.email, connected: mailIdentity.connected })
    .from(mailIdentity)
    .where(eq(mailIdentity.workspaceId, workspace.id));
  return <Mailboxes mailboxes={mailboxes} />;
}
