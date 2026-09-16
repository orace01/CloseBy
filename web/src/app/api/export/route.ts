import { eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { campaign, creditLedger, fact, message, prospect, suppression, workspaceMember } from "@/db/schema";
import { auth } from "@/lib/auth";

/** Downloads everything stored for the signed-in user's workspace, as JSON. */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response(null, { status: 401 });

  const membership = await db.query.workspaceMember.findFirst({
    where: eq(workspaceMember.userId, session.user.id),
    with: { workspace: true },
  });
  if (!membership) return new Response(null, { status: 404 });
  const workspaceId = membership.workspaceId;

  const prospects = await db.select().from(prospect).where(eq(prospect.workspaceId, workspaceId));
  const ids = prospects.map((p) => p.id);
  const data = {
    exportedAt: new Date().toISOString(),
    user: { name: session.user.name, email: session.user.email, createdAt: session.user.createdAt },
    workspace: membership.workspace,
    campaigns: await db.select().from(campaign).where(eq(campaign.workspaceId, workspaceId)),
    prospects,
    facts: ids.length ? await db.select().from(fact).where(inArray(fact.prospectId, ids)) : [],
    messages: ids.length ? await db.select().from(message).where(inArray(message.prospectId, ids)) : [],
    exclusions: await db.select().from(suppression).where(eq(suppression.workspaceId, workspaceId)),
    credits: await db.select().from(creditLedger).where(eq(creditLedger.workspaceId, workspaceId)),
  };

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="closeby-export-${data.exportedAt.slice(0, 10)}.json"`,
    },
  });
}
