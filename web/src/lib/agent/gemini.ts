import "server-only";
import type { z } from "zod";

// Thin client for the Gemini REST API. Every call asks for JSON matching a
// schema, then validates it again with zod: the model's output is never trusted.

const API = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Models tried in order. On the free tier each model has its own daily quota,
 * so when one is used up the agent moves on to the next.
 */
export const geminiModels = (process.env.GEMINI_MODELS || process.env.GEMINI_MODEL || "gemini-3.6-flash,gemini-3.5-flash,gemini-3.1-flash-lite,gemini-3.5-flash-lite")
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);

/** Models whose daily quota ran out, with when to try them again (per server instance). */
const exhaustedUntil = new Map<string, number>();
const QUOTA_RETRY_MS = 60 * 60 * 1000;

export class GeminiError extends Error {
  constructor(
    message: string,
    /** True when retrying later may succeed (rate limit, overload, outage). */
    readonly retryable: boolean,
    /** True when the daily request quota is used up: retrying today is pointless. */
    readonly dailyQuota = false,
  ) {
    super(message);
    this.name = "GeminiError";
  }
}

/** OpenAPI-style schema accepted by Gemini's `responseSchema`. */
export type JsonSchema = {
  type: "object" | "array" | "string" | "integer" | "number" | "boolean";
  description?: string;
  enum?: string[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  nullable?: boolean;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string; thought?: boolean }> };
    finishReason?: string;
    groundingMetadata?: { groundingChunks?: Array<{ web?: { uri?: string; title?: string } }> };
  }>;
};

/** One generateContent call on the first model with quota left, with retries on rate limits and outages. */
async function callGemini(request: Record<string, unknown>, attempts = 3): Promise<{ data: GeminiResponse; model: string }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new GeminiError("GEMINI_API_KEY is not set.", false);
  const body = JSON.stringify(request);

  for (const model of geminiModels) {
    if ((exhaustedUntil.get(model) ?? 0) > Date.now()) continue;

    let lastError: GeminiError | undefined;
    let quotaExhausted = false;
    for (let attempt = 0; attempt < attempts; attempt++) {
      if (attempt > 0) await sleep(2000 * 2 ** attempt);

      let response: Response;
      try {
        response = await fetch(`${API}/${model}:generateContent`, {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": key },
          body,
          signal: AbortSignal.timeout(90_000),
        });
      } catch (error) {
        lastError = new GeminiError(`Gemini request failed: ${(error as Error).message}`, true);
        continue;
      }

      if (response.ok) return { data: (await response.json()) as GeminiResponse, model };

      const detail = await response.text();
      if (response.status === 429 && /PerDay/i.test(detail)) {
        exhaustedUntil.set(model, Date.now() + QUOTA_RETRY_MS);
        console.info(`[gemini] daily quota exhausted for ${model}`);
        quotaExhausted = true;
        break;
      }
      const retryable = response.status === 429 || response.status >= 500;
      lastError = new GeminiError(`Gemini ${model} ${response.status}: ${detail.slice(0, 300)}`, retryable);
      if (!retryable) throw lastError;
    }
    if (!quotaExhausted) throw lastError ?? new GeminiError("Gemini failed.", true);
  }
  throw new GeminiError("Gemini daily quota exhausted for every configured model.", false, true);
}

const textOf = (data: GeminiResponse) =>
  data.candidates?.[0]?.content?.parts?.filter((part) => !part.thought).map((part) => part.text ?? "").join("") ?? "";

// Low thinking is ~4x faster; facts are checked against the pages in code anyway.
const thinkingConfig = { thinkingLevel: "low" };

export async function generateJson<T>(options: Parameters<typeof generateJsonWithModel<T>>[0]): Promise<T> {
  return (await generateJsonWithModel(options)).value;
}

/** Same as generateJson, also telling which model answered. */
export async function generateJsonWithModel<T>({
  system,
  prompt,
  schema,
  validate,
  temperature = 0.4,
}: {
  system: string;
  prompt: string;
  schema: JsonSchema;
  validate: z.ZodType<T>;
  temperature?: number;
}): Promise<{ value: T; model: string }> {
  const request = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature, responseMimeType: "application/json", responseSchema: schema, thinkingConfig },
  };

  let lastError: GeminiError | undefined;
  for (let attempt = 0; attempt < 2; attempt++) {
    const { data, model } = await callGemini(request);
    try {
      const parsed = validate.safeParse(JSON.parse(textOf(data)));
      if (parsed.success) return { value: parsed.data, model };
      lastError = new GeminiError(`Gemini returned an unexpected shape: ${parsed.error.issues[0]?.message}`, true);
    } catch {
      lastError = new GeminiError(`Gemini returned invalid JSON (${data.candidates?.[0]?.finishReason ?? "no candidate"}).`, true);
    }
  }
  throw lastError!;
}

/**
 * Asks Gemini to search Google. Returns its text answer and the pages it cited.
 * Search grounding is not part of the free tier: callers must cope with errors.
 */
/** Google Search grounding is not in the free tier: off unless AGENT_WEB_SEARCH=true. */
export const webSearchEnabled = process.env.AGENT_WEB_SEARCH === "true";

export async function searchWithGoogle({ system, prompt }: { system: string; prompt: string }) {
  const { data } = await callGemini(
    {
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
      generationConfig: { temperature: 0.2, thinkingConfig },
    },
    1,
  );
  const sources = (data.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [])
    .map((chunk) => chunk.web)
    .filter((web): web is { uri: string; title?: string } => Boolean(web?.uri));
  return { text: textOf(data), sources };
}
