import "server-only";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { workspaceMember } from "@/db/schema";
import { auth } from "@/lib/auth";

/** Current session, validated against the database. Memoized per request. */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

/** On guest-only pages (login, sign-up): send signed-in users into the app. */
export async function redirectIfSignedIn() {
  const session = await getSession();
  if (session) redirect(session.user.onboardedAt ? "/tableau-de-bord" : "/bienvenue");
}

/** Signed-in user, or redirect to the login page. */
export const requireUser = cache(async () => {
  const session = await getSession();
  if (!session) redirect("/connexion");
  return session.user;
});

/** Addresses listed in ADMIN_EMAILS can open the admin console. */
export function isAdmin(email: string) {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

/** Admin user, or a 404 for everyone else so the console stays invisible. */
export const requireAdmin = cache(async () => {
  const user = await requireUser();
  if (!isAdmin(user.email)) notFound();
  return user;
});

/** Signed-in user who finished onboarding, with their workspace. */
export const requireWorkspace = cache(async () => {
  const user = await requireUser();
  if (!user.onboardedAt) redirect("/bienvenue");

  const membership = await db.query.workspaceMember.findFirst({
    where: eq(workspaceMember.userId, user.id),
    with: { workspace: true },
  });
  if (!membership) redirect("/bienvenue");

  return { user, workspace: membership.workspace, role: membership.role };
});
