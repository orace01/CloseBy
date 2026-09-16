import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { appBaseUrl, emailFlowsEnabled, trustedOrigins } from "@/lib/auth-config";
import { sendEmail } from "@/lib/mailer";

export const auth = betterAuth({
  appName: "CloseBy",
  baseURL: appBaseUrl,
  trustedOrigins,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: emailFlowsEnabled,
    minPasswordLength: 8,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Choisir un nouveau mot de passe CloseBy",
        text: `Bonjour,\n\nPour choisir un nouveau mot de passe, ouvrez ce lien (valable 1 heure) :\n${url}\n\nSi vous n’avez rien demandé, ignorez cet e-mail : votre mot de passe reste inchangé.`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: emailFlowsEnabled,
    sendOnSignIn: emailFlowsEnabled,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Confirmez votre adresse e-mail CloseBy",
        text: `Bonjour,\n\nConfirmez votre adresse pour activer votre compte CloseBy :\n${url}\n\nSi vous n’avez pas créé de compte, ignorez cet e-mail.`,
      });
    },
  },
  user: {
    additionalFields: {
      onboardedAt: { type: "date", required: false, input: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Every new account gets its own workspace with the Starter credits.
        after: async (createdUser) => {
          const renewsAt = new Date();
          renewsAt.setMonth(renewsAt.getMonth() + 1);
          const [created] = await db
            .insert(schema.workspace)
            .values({ name: "Mon entreprise", creditsRenewAt: renewsAt })
            .returning({ id: schema.workspace.id });
          await db.insert(schema.workspaceMember).values({ workspaceId: created.id, userId: createdUser.id, role: "owner" });
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
