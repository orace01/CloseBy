import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { TextSegment } from "../lib/types";
import { user } from "./auth-schema";

const id = () => text().primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

export const planId = pgEnum("plan_id", ["starter", "pro", "agency"]);
export const memberRole = pgEnum("member_role", ["owner", "member"]);
export const campaignStatus = pgEnum("campaign_status", ["draft", "running", "paused", "done"]);
export const prospectStatus = pgEnum("prospect_status", [
  "to_review",
  "approved",
  "rejected",
  "sent",
  "replied",
  "no_email",
  "excluded",
]);
export const mailProvider = pgEnum("mail_provider", ["gmail", "outlook"]);
/** Where the agent is with a prospect: waiting, handled, or set aside. */
export const agentStage = pgEnum("agent_stage", ["pending", "done", "skipped"]);

/** A customer account. Every user belongs to at least one workspace. */
export const workspace = pgTable("workspace", {
  id: id(),
  name: text().notNull(),
  planId: planId().notNull().default("starter"),
  creditBalance: integer().notNull().default(150),
  creditsRenewAt: timestamp({ withTimezone: true }),
  offer: text(),
  tone: text().notNull().default("Professionnel"),
  language: text().notNull().default("fr"),
  replyDetection: boolean().notNull().default(true),
  timezone: text().notNull().default("Europe/Paris"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const workspaceMember = pgTable(
  "workspace_member",
  {
    workspaceId: text()
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: memberRole().notNull().default("owner"),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.workspaceId, t.userId] }), index().on(t.userId)],
);

/** A mailbox connected over OAuth and used to send approved emails. */
export const mailIdentity = pgTable(
  "mail_identity",
  {
    id: id(),
    workspaceId: text()
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    provider: mailProvider().notNull(),
    email: text().notNull(),
    connected: boolean().notNull().default(false),
    scopes: text().array(),
    encryptedTokens: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex().on(t.workspaceId, t.provider, t.email)],
);

export const campaign = pgTable(
  "campaign",
  {
    id: id(),
    workspaceId: text()
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    name: text().notNull(),
    brief: text(),
    offer: text().notNull(),
    target: text().notNull(),
    zone: text().notNull(),
    radiusKm: integer().notNull().default(15),
    maxProspects: integer().notNull().default(50),
    tone: text().notNull().default("Professionnel"),
    language: text().notNull().default("fr"),
    status: campaignStatus().notNull().default("draft"),
    found: integer().notNull().default(0),
    sitesRead: integer().notNull().default(0),
    drafted: integer().notNull().default(0),
    sent: integer().notNull().default(0),
    replies: integer().notNull().default(0),
    /** OpenStreetMap tags the agent searched for, e.g. ["amenity=restaurant"]. */
    searchTags: text().array(),
    sourcedAt: timestamp({ withTimezone: true }),
    /** Prevents two agent runs from working on the same campaign at once. */
    lockedUntil: timestamp({ withTimezone: true }),
    /** Short message shown to the user when the agent stopped early. */
    note: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index().on(t.workspaceId)],
);

export const prospect = pgTable(
  "prospect",
  {
    id: id(),
    workspaceId: text()
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    campaignId: text()
      .notNull()
      .references(() => campaign.id, { onDelete: "cascade" }),
    name: text().notNull(),
    activity: text().notNull(),
    city: text().notNull(),
    address: text(),
    distanceKm: real(),
    website: text(),
    phone: text(),
    mapsUrl: text(),
    rating: real(),
    reviewCount: integer(),
    email: text(),
    emailSource: text(),
    nafCode: text(),
    source: text().notNull(),
    sourceRef: text(),
    collectedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    status: prospectStatus().notNull().default("to_review"),
    stage: agentStage().notNull().default("pending"),
    skipReason: text(),
    relevance: integer(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index().on(t.campaignId, t.stage), index().on(t.workspaceId)],
);

/** A public fact read on a prospect's pages, with where it was found. */
export const fact = pgTable(
  "fact",
  {
    id: id(),
    prospectId: text()
      .notNull()
      .references(() => prospect.id, { onDelete: "cascade" }),
    text: text().notNull(),
    /** Exact sentence from the page, checked to appear there. */
    quote: text(),
    source: text().notNull(),
    collectedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.prospectId)],
);

/** The drafted email for a prospect. Segments linked to a fact are highlighted. */
export const message = pgTable(
  "message",
  {
    id: id(),
    prospectId: text()
      .notNull()
      .references(() => prospect.id, { onDelete: "cascade" }),
    subject: text().notNull(),
    paragraphs: jsonb().$type<TextSegment[][]>().notNull(),
    editedBody: text(),
    model: text(),
    version: integer().notNull().default(1),
    approvedAt: timestamp({ withTimezone: true }),
    sentAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex().on(t.prospectId)],
);

export const sendEvent = pgTable(
  "send_event",
  {
    id: id(),
    messageId: text()
      .notNull()
      .references(() => message.id, { onDelete: "cascade" }),
    type: text().notNull(),
    providerMessageId: text(),
    errorCode: text(),
    occurredAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.messageId)],
);

export const creditLedger = pgTable(
  "credit_ledger",
  {
    id: id(),
    workspaceId: text()
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    operation: text().notNull(),
    quantity: integer().notNull(),
    referenceId: text(),
    createdAt: createdAt(),
  },
  (t) => [index().on(t.workspaceId)],
);

/** Addresses or domains that must never be contacted again by this workspace. */
export const suppression = pgTable(
  "suppression",
  {
    id: id(),
    workspaceId: text()
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    value: text().notNull(),
    kind: text().notNull(),
    reason: text(),
    source: text(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex().on(t.workspaceId, t.value)],
);

export const auditEvent = pgTable(
  "audit_event",
  {
    id: id(),
    workspaceId: text().references(() => workspace.id, { onDelete: "set null" }),
    actorId: text().references(() => user.id, { onDelete: "set null" }),
    action: text().notNull(),
    resourceType: text(),
    resourceId: text(),
    metadata: jsonb(),
    createdAt: createdAt(),
  },
  (t) => [index().on(t.workspaceId)],
);

export const workspaceRelations = relations(workspace, ({ many }) => ({
  members: many(workspaceMember),
  campaigns: many(campaign),
  mailIdentities: many(mailIdentity),
}));

export const workspaceMemberRelations = relations(workspaceMember, ({ one }) => ({
  workspace: one(workspace, { fields: [workspaceMember.workspaceId], references: [workspace.id] }),
  user: one(user, { fields: [workspaceMember.userId], references: [user.id] }),
}));

export const campaignRelations = relations(campaign, ({ one, many }) => ({
  workspace: one(workspace, { fields: [campaign.workspaceId], references: [workspace.id] }),
  prospects: many(prospect),
}));

export const prospectRelations = relations(prospect, ({ one, many }) => ({
  campaign: one(campaign, { fields: [prospect.campaignId], references: [campaign.id] }),
  facts: many(fact),
  message: one(message),
}));

export const factRelations = relations(fact, ({ one }) => ({
  prospect: one(prospect, { fields: [fact.prospectId], references: [prospect.id] }),
}));

export const messageRelations = relations(message, ({ one }) => ({
  prospect: one(prospect, { fields: [message.prospectId], references: [prospect.id] }),
}));
