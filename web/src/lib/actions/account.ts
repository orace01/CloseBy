"use server";

import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { user, workspace, workspaceMember } from "@/db/schema";
import { auth } from "@/lib/auth";
import { requireWorkspace } from "@/lib/dal";

export async function setReplyDetection(enabled: boolean) {
  const { workspace: current } = await requireWorkspace();
  await db.update(workspace).set({ replyDetection: enabled }).where(eq(workspace.id, current.id));
  revalidatePath("/reglages");
}

/** Deletes the user, and every workspace they own with its campaigns and prospects. */
export async function deleteAccount() {
  const { user: current } = await requireWorkspace();
  await db.transaction(async (tx) => {
    const owned = await tx
      .select({ id: workspaceMember.workspaceId })
      .from(workspaceMember)
      .where(and(eq(workspaceMember.userId, current.id), eq(workspaceMember.role, "owner")));
    if (owned.length > 0) {
      await tx.delete(workspace).where(inArray(workspace.id, owned.map((row) => row.id)));
    }
    await tx.delete(user).where(eq(user.id, current.id));
  });
  // Sessions were removed with the user; clear the cookie too.
  await auth.api.signOut({ headers: await headers() }).catch(() => undefined);
  redirect("/");
}
