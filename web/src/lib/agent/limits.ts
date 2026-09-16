// Usage limits that keep the agent within Gemini's free quota, shared by every
// account. Raise them once billing is enabled.

const intFromEnv = (name: string, fallback: number) => {
  const value = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

export const agentLimits = {
  /** Businesses analysed per campaign. Each one with an email costs about 2 AI requests. */
  maxProspectsPerCampaign: intFromEnv("AGENT_MAX_PROSPECTS", 10),
  /** Campaigns a workspace can launch per day. */
  maxCampaignsPerDay: intFromEnv("AGENT_MAX_CAMPAIGNS_PER_DAY", 3),
};
