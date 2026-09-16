import { after } from "next/server";
import { z } from "zod";
import { isValidRunToken, runAndContinue } from "@/lib/agent/runner";

export const maxDuration = 300;

const body = z.object({ campaignId: z.string().min(1), token: z.string().min(1), blockedRuns: z.number().int().min(0).max(10) });

/** Internal hand-off: the agent calls this to continue a campaign in a new invocation. */
export async function POST(request: Request) {
  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isValidRunToken(parsed.data.campaignId, parsed.data.token)) {
    return new Response(null, { status: 403 });
  }
  const { campaignId, blockedRuns } = parsed.data;
  after(() => runAndContinue(campaignId, blockedRuns));
  return new Response(null, { status: 202 });
}
