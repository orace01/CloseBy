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
  address?: string;
  website?: string;
  phone?: string;
  mapsUrl?: string;
  rating?: number;
  reviewCount?: number;
  email?: string;
  emailSource?: string;
  nafCode?: string;
  source: string;
  collectedAt: string;
  status: ProspectStatus;
  facts: Fact[];
  draft?: DraftEmail;
  /** The user's rewrite of the draft, if any. */
  editedBody?: string;
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
  /** Message from the agent when it stopped early or is waiting. */
  note?: string;
  /** False while the agent is still searching for businesses. */
  sourced: boolean;
  toReview: number;
  /** Businesses found without a website: leads worth calling. */
  withoutWebsite: number;
}


export interface Plan {
  id: PlanId;
  name: string;
  priceEur: number;
  credits: number;
  tagline: string;
  features: string[];
}


