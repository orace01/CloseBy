import "server-only";
import { lookup, resolveMx } from "node:dns/promises";
import { isIP } from "node:net";
import { USER_AGENT } from "./places";

// Reads a few public pages of a prospect's website and finds a published
// contact address. No AI here: plain fetching and parsing.

const MAX_BYTES = 1_500_000;
export const MAX_PAGE_CHARS = 12_000;
const EXTRA_PAGES = 3;

export interface Page {
  url: string;
  text: string;
}

export interface SiteReading {
  pages: Page[];
  email?: { value: string; source: string };
}

function isPrivateAddress(address: string) {
  if (isIP(address) === 6) {
    const a = address.toLowerCase();
    return a === "::1" || a.startsWith("fc") || a.startsWith("fd") || a.startsWith("fe80") || a.startsWith("::ffff:");
  }
  const [a, b] = address.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

/** Refuses URLs that resolve to internal networks (the URLs come from public data). */
async function assertPublicHost(url: URL) {
  if (!/^https?:$/.test(url.protocol)) throw new Error("unsupported protocol");
  const { address } = await lookup(url.hostname);
  if (isPrivateAddress(address)) throw new Error("private address");
}

export async function fetchText(url: string, accept = "text/html") {
  let current = new URL(url);
  for (let hop = 0; hop < 4; hop++) {
    await assertPublicHost(current);
    const response = await fetch(current, {
      headers: { "user-agent": USER_AGENT, accept, "accept-language": "fr,en;q=0.5" },
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });
    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      current = new URL(location, current);
      continue;
    }
    if (!response.ok) return null;
    const type = response.headers.get("content-type") ?? "";
    if (accept === "text/html" && !type.includes("html")) return null;
    const buffer = await response.arrayBuffer();
    return { url: current.toString(), body: new TextDecoder().decode(buffer.slice(0, MAX_BYTES)) };
  }
  return null;
}

/** Minimal robots.txt check for the `*` and CloseBy user agents. */
async function robotsAllows(site: URL) {
  try {
    const robots = await fetchText(new URL("/robots.txt", site).toString(), "text/plain");
    if (!robots) return () => true;
    const rules: string[] = [];
    let applies = false;
    for (const line of robots.body.split(/\r?\n/)) {
      const [field, ...rest] = line.replace(/#.*/, "").split(":");
      const value = rest.join(":").trim();
      const key = field.trim().toLowerCase();
      if (key === "user-agent") applies = value === "*" || /closeby/i.test(value);
      else if (key === "disallow" && applies && value) rules.push(value);
    }
    return (path: string) => !rules.some((rule) => path.startsWith(rule));
  } catch {
    return () => true;
  }
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", eacute: "é", egrave: "è", agrave: "à", ccedil: "ç", ecirc: "ê" };

function decodeEntities(value: string) {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : match;
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

export function htmlToText(html: string) {
  return decodeEntities(
    html
      .replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/section|\/article)[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

const USEFUL_LINK = /(contact|a-propos|apropos|about|qui-sommes|notre-histoire|histoire|equipe|mentions|presentation|services|prestations|carte|menu)/i;

function internalLinks(html: string, base: URL) {
  const links = new Map<string, number>();
  for (const [, href] of html.matchAll(/<a\s[^>]*href=["']([^"'#]+)["']/gi)) {
    try {
      const url = new URL(decodeEntities(href), base);
      if (url.hostname.replace(/^www\./, "") !== base.hostname.replace(/^www\./, "")) continue;
      if (/\.(pdf|jpe?g|png|gif|webp|zip|docx?)$/i.test(url.pathname)) continue;
      const match = url.pathname.match(USEFUL_LINK);
      if (!match) continue;
      url.hash = "";
      url.search = "";
      // Contact and legal pages are the likeliest to publish an address.
      const priority = /contact|mentions/i.test(match[1]) ? 0 : 1;
      if (!links.has(url.toString())) links.set(url.toString(), priority);
    } catch {
      // Ignore malformed links.
    }
  }
  return [...links.entries()].sort((a, b) => a[1] - b[1]).map(([url]) => url);
}

const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const IGNORED_EMAIL = /(\.(png|jpe?g|gif|webp|svg)$|^(no-?reply|donotreply|example|test|user|name|email|votre|your)@|@(example|sentry|wixpress|domain|email)\.)/i;

export function emailsIn(html: string) {
  const decoded = decodeEntities(html).replace(/\s*(\[at\]|\(at\)|\[arobase\])\s*/gi, "@");
  const found = new Set<string>();
  for (const [value] of decoded.matchAll(EMAIL)) {
    const email = value.toLowerCase().replace(/^mailto:/, "").replace(/\.$/, "");
    if (!IGNORED_EMAIL.test(email)) found.add(email);
  }
  return [...found];
}

function rankEmail(email: string, siteHost: string) {
  const [local, domain] = email.split("@");
  let score = 0;
  if (siteHost.endsWith(domain) || domain.endsWith(siteHost)) score += 10;
  if (/^(contact|bonjour|hello|info|infos|accueil|reservation|commercial)$/.test(local)) score += 3;
  if (/^(rgpd|dpo|privacy|webmaster|admin|abuse|compta|factur|jobs|recrutement)/.test(local)) score -= 8;
  return score;
}

export async function hasMailServer(email: string) {
  try {
    const records = await resolveMx(email.split("@")[1]);
    return records.length > 0;
  } catch {
    return false;
  }
}

/** Keeps the first candidate whose domain accepts mail. */
export async function firstDeliverable<T extends { value: string }>(candidates: T[]) {
  for (const candidate of candidates) {
    if (await hasMailServer(candidate.value)) return candidate;
  }
  return undefined;
}

export async function readSite(website: string, knownEmail?: string): Promise<SiteReading> {
  const start = new URL(website);
  const allowed = await robotsAllows(start);
  if (!allowed(start.pathname)) return { pages: [] };

  const home = await fetchText(start.toString());
  if (!home) return { pages: [] };

  const host = new URL(home.url).hostname.replace(/^www\./, "");
  const pages: Page[] = [{ url: home.url, text: htmlToText(home.body).slice(0, MAX_PAGE_CHARS) }];
  const candidates: Array<{ value: string; source: string }> = emailsIn(home.body).map((value) => ({ value, source: home.url }));

  for (const link of internalLinks(home.body, new URL(home.url)).slice(0, EXTRA_PAGES)) {
    if (!allowed(new URL(link).pathname)) continue;
    const page = await fetchText(link).catch(() => null);
    if (!page) continue;
    pages.push({ url: page.url, text: htmlToText(page.body).slice(0, MAX_PAGE_CHARS) });
    for (const value of emailsIn(page.body)) candidates.push({ value, source: page.url });
  }

  if (knownEmail) candidates.push({ value: knownEmail.toLowerCase(), source: "OpenStreetMap" });

  const ranked = candidates
    .filter((candidate, i) => candidates.findIndex((c) => c.value === candidate.value) === i)
    .map((candidate) => ({ ...candidate, score: rankEmail(candidate.value, host) }))
    .filter((candidate) => candidate.score > -5)
    .sort((a, b) => b.score - a.score);

  const email = await firstDeliverable(ranked);
  return email ? { pages, email: { value: email.value, source: email.source } } : { pages };
}
