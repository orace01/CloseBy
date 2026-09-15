"use client";

// In-memory app state for the prototype. Each action maps to a future API call.
import { createContext, useContext, useMemo, useReducer, type Dispatch, type ReactNode } from "react";
import * as seed from "./mock-data";
import type { Campaign, MailIdentity, PlanId, Prospect, ProspectStatus } from "./types";

interface AppState {
  prospects: Prospect[];
  campaigns: Campaign[];
  mailboxes: MailIdentity[];
  planId: PlanId;
  replyDetection: boolean;
}

type Action =
  | { type: "setProspectStatus"; id: string; status: ProspectStatus }
  | { type: "sendApproved"; campaignId: string }
  | { type: "toggleCampaignPause"; id: string }
  | { type: "toggleMailbox"; id: string }
  | { type: "choosePlan"; planId: PlanId }
  | { type: "setReplyDetection"; value: boolean };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "setProspectStatus":
      return {
        ...state,
        prospects: state.prospects.map((p) => (p.id === action.id ? { ...p, status: action.status } : p)),
      };
    case "sendApproved": {
      const approved = state.prospects.filter((p) => p.campaignId === action.campaignId && p.status === "approved");
      return {
        ...state,
        prospects: state.prospects.map((p) =>
          p.campaignId === action.campaignId && p.status === "approved" ? { ...p, status: "sent" } : p,
        ),
        campaigns: state.campaigns.map((c) =>
          c.id === action.campaignId ? { ...c, sent: c.sent + approved.length } : c,
        ),
      };
    }
    case "toggleCampaignPause":
      return {
        ...state,
        campaigns: state.campaigns.map((c) => {
          if (c.id !== action.id || c.status === "done") return c;
          return { ...c, status: c.status === "running" ? "paused" : "running" };
        }),
      };
    case "toggleMailbox":
      return {
        ...state,
        mailboxes: state.mailboxes.map((m) => (m.id === action.id ? { ...m, connected: !m.connected } : m)),
      };
    case "choosePlan":
      return { ...state, planId: action.planId };
    case "setReplyDetection":
      return { ...state, replyDetection: action.value };
  }
}

const StoreContext = createContext<{ state: AppState; dispatch: Dispatch<Action> } | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    prospects: seed.prospects,
    campaigns: seed.campaigns,
    mailboxes: seed.mailboxes,
    planId: seed.account.planId,
    replyDetection: true,
  }));
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useAppStore must be used inside AppStoreProvider");
  return context;
}
