import "server-only";
import { appBaseUrl } from "@/lib/auth-config";

// Business search on OpenStreetMap: Nominatim turns the zone into coordinates,
// Overpass lists the establishments around it. Both are free and keyless, but
// ask for an identifying User-Agent and moderate use.

export const USER_AGENT = `CloseBy/0.1 (prospecting agent; ${appBaseUrl ?? "https://closeby.app"})`;

// Public Overpass servers are often overloaded (504/429): try again, then fall back.
const OVERPASS_ATTEMPTS = [
  "https://overpass-api.de/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

/** The public map servers are overloaded; trying again in a moment usually works. */
export class PlacesUnavailable extends Error {}

/** OSM keys the agent may search on. Anything else from the model is ignored. */
export const ALLOWED_TAG_KEYS = ["amenity", "shop", "craft", "office", "tourism", "leisure", "healthcare"];

/** A business found by a search source, before the agent reads anything about it. */
export interface Place {
  /** Stable id from the source, e.g. "osm:node/123" or "google:ChIJ…". */
  sourceRef: string;
  source: "OpenStreetMap" | "Google Maps";
  name: string;
  website?: string;
  email?: string;
  address?: string;
  city?: string;
  distanceKm: number;
  phone?: string;
  mapsUrl?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
}

export interface Geocoded {
  lat: number;
  lon: number;
  label: string;
  city: string;
}

export async function geocode(zone: string): Promise<Geocoded | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.search = new URLSearchParams({ q: zone, format: "jsonv2", limit: "1", countrycodes: "fr", addressdetails: "1" }).toString();
  const response = await fetch(url, {
    headers: { "user-agent": USER_AGENT, "accept-language": "fr" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new PlacesUnavailable(`Nominatim ${response.status}`);
  const [hit] = (await response.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
    name?: string;
    address?: Record<string, string>;
  }>;
  if (!hit) return null;
  const a = hit.address ?? {};
  return {
    lat: Number(hit.lat),
    lon: Number(hit.lon),
    label: hit.display_name,
    city: a.city ?? a.town ?? a.village ?? a.municipality ?? hit.name ?? zone,
  };
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

function normalizeWebsite(value: string | undefined) {
  if (!value) return null;
  const raw = value.split(";")[0].trim();
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!/^https?:$/.test(url.protocol) || !url.hostname.includes(".")) return null;
    // Social profiles and directories are not the business's own site.
    if (/(^|\.)(facebook|instagram|linktr|tripadvisor|google|pagesjaunes|yelp|thefork|lafourchette|ubereats|deliveroo)\./i.test(url.hostname)) {
      return null;
    }
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Establishments matching any of the tags within the radius, nearest first.
 * Businesses without a website are kept when they can be reached (phone or street address).
 */
export async function searchPlaces({
  tags,
  lat,
  lon,
  radiusKm,
}: {
  tags: string[];
  lat: number;
  lon: number;
  radiusKm: number;
}): Promise<Place[]> {
  const radius = Math.round(radiusKm * 1000);
  const selectors = tags
    .map((tag) => tag.split("="))
    .filter(([key, value]) => ALLOWED_TAG_KEYS.includes(key) && /^[a-z0-9_;:-]+$/i.test(value ?? ""))
    .map(([key, value]) => `nwr["${key}"="${value}"](around:${radius},${lat},${lon});`);
  if (selectors.length === 0) return [];

  const query = `[out:json][timeout:25];(${selectors.join("")});out center tags 2000;`;

  let elements: Array<{ type: string; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }> = [];
  let lastError: unknown;
  for (const [attempt, endpoint] of OVERPASS_ATTEMPTS.entries()) {
    if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 3000));
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "user-agent": USER_AGENT, accept: "application/json", "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(35_000),
      });
      if (!response.ok) throw new Error(`Overpass ${response.status}`);
      elements = ((await response.json()) as { elements: typeof elements }).elements;
      lastError = undefined;
      break;
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError) throw new PlacesUnavailable(`Overpass unavailable: ${(lastError as Error).message}`);

  const seenHosts = new Set<string>();
  const places: Place[] = [];
  for (const element of elements) {
    const t = element.tags ?? {};
    const website = normalizeWebsite(t.website ?? t["contact:website"] ?? t.url);
    const position = element.center ?? (element.lat !== undefined ? { lat: element.lat, lon: element.lon! } : null);
    if (!t.name || !position) continue;

    const street = [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" ");
    const phone = (t.phone ?? t["contact:phone"])?.split(";")[0].trim() || undefined;
    if (website) {
      const host = new URL(website).hostname.replace(/^www\./, "");
      if (seenHosts.has(host)) continue;
      seenHosts.add(host);
    } else if (!phone && !street) {
      continue;
    }

    places.push({
      sourceRef: `osm:${element.type}/${element.id}`,
      source: "OpenStreetMap",
      name: t.name,
      website: website ?? undefined,
      mapsUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
      email: (t.email ?? t["contact:email"])?.split(";")[0].trim() || undefined,
      address: [street, t["addr:postcode"], t["addr:city"]].filter(Boolean).join(", ") || undefined,
      city: t["addr:city"],
      phone,
      distanceKm: Math.round(distanceKm(lat, lon, position.lat, position.lon) * 10) / 10,
    });
  }
  return places.sort((a, b) => a.distanceKm - b.distanceKm);
}
