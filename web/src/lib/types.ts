export type ProspectStatus =
  | "to_review"
  | "approved"
  | "rejected"
  | "sent"
  | "replied"
  | "no_email"
  | "excluded";

export type CampaignStatus = "running" | "paused" | "done";

export type PlanId = "starter" | "pro" | "agency";

export type MailProvider = "gmail" | "outlook";

/** A public fact the agent found about a prospect, with where it was read. */
export interface Fact {
  id: string;
  text: string;
  source: string;
  collectedAt: string;
}

/** A run of email text. Runs linked to a fact are highlighted in the UI. */
export interface TextSegment {
  text: string;
  factId?: string;
}

export interface DraftEmail {
  subject: string;
  paragraphs: TextSegment[][];
}

export interface Prospect {
  id: string;
  campaignId: string;
  name: string;
  activity: string;
  city: string;
  distanceKm: number;
  website?: string;
  email?: string;
  emailSource?: string;
  nafCode?: string;
  source: string;
  collectedAt: string;
  status: ProspectStatus;
  facts: Fact[];
  draft?: DraftEmail;
}

export interface AgentProgress {
  found: number;
  sitesRead: number;
  drafted: number;
}

export interface Campaign {
  id: string;
  name: string;
  offer: string;
  target: string;
  zone: string;
  radiusKm: number;
  maxProspects: number;
  tone: string;
  status: CampaignStatus;
  progress: AgentProgress;
  sent: number;
  replies: number;
}

export interface MailIdentity {
  id: string;
  provider: MailProvider;
  label: string;
  email: string;
  connected: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  priceEur: number;
  credits: number;
  tagline: string;
  features: string[];
}

export interface Account {
  name: string;
  company: string;
  email: string;
  initials: string;
  planId: PlanId;
  credits: { balance: number; renewsOn: string };
  excludedCount: number;
  language: string;
  tone: string;
}

export interface AdminIncident {
  id: string;
  kind: string;
  critical: boolean;
  label: string;
  when: string;
  action: string;
}
