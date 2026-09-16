import "server-only";
import type { Place } from "./places";

// Business search with the Google Places API (New). Unlike OpenStreetMap it
// also returns businesses without a website, with their phone and rating.
// Requires GOOGLE_MAPS_API_KEY with "Places API (New)" enabled.
// Pricing: Text Search with website/phone fields is billed per request
// (a monthly free allowance applies); see Google Maps Platform pricing.

const SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";

const PLACE_FIELDS = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.addressComponents",
  "places.websiteUri",
  "places.nationalPhoneNumber",
  "places.googleMapsUri",
  "places.businessStatus",
  "places.primaryTypeDisplayName",
  "places.rating",
  "places.userRatingCount",
];

interface GooglePlace {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  addressComponents?: Array<{ longText: string; types: string[] }>;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  googleMapsUri?: string;
  businessStatus?: string;
  primaryTypeDisplayName?: { text: string };
  rating?: number;
  userRatingCount?: number;
}

export const googlePlacesEnabled = () => Boolean(process.env.GOOGLE_MAPS_API_KEY);

export class GooglePlacesError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
  }
}

async function searchText(body: Record<string, unknown>, fields: string[]) {
  const response = await fetch(SEARCH_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": process.env.GOOGLE_MAPS_API_KEY ?? "",
      "x-goog-fieldmask": fields.join(","),
    },
    body: JSON.stringify({ languageCode: "fr", regionCode: "FR", ...body }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new GooglePlacesError(`Places ${response.status}: ${detail}`, response.status === 429 || response.status >= 500);
  }
  return (await response.json()) as { places?: GooglePlace[]; nextPageToken?: string };
}

const cityOf = (place: GooglePlace) =>
  place.addressComponents?.find((c) => c.types.includes("locality"))?.longText ??
  place.addressComponents?.find((c) => c.types.includes("postal_town"))?.longText;

export async function geocodeWithGoogle(zone: string) {
  const { places } = await searchText({ textQuery: zone, pageSize: 1 }, ["places.location", "places.addressComponents", "places.displayName"]);
  const hit = places?.[0];
  if (!hit?.location) return null;
  return { lat: hit.location.latitude, lon: hit.location.longitude, city: cityOf(hit) ?? hit.displayName?.text ?? zone };
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const rad = Math.PI / 180;
  const h =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lon2 - lon1) * rad) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** Up to 60 operating businesses matching the target, nearest first. Websites are optional. */
export async function searchGooglePlaces({
  target,
  lat,
  lon,
  radiusKm,
}: {
  target: string;
  lat: number;
  lon: number;
  radiusKm: number;
}): Promise<Place[]> {
  const base = {
    textQuery: target,
    pageSize: 20,
    locationBias: { circle: { center: { latitude: lat, longitude: lon }, radius: Math.min(radiusKm * 1000, 50_000) } },
  };

  const found: GooglePlace[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < 3; page++) {
    const result = await searchText(pageToken ? { ...base, pageToken } : base, [...PLACE_FIELDS, "nextPageToken"]);
    found.push(...(result.places ?? []));
    pageToken = result.nextPageToken;
    if (!pageToken) break;
  }

  const places: Place[] = [];
  const seen = new Set<string>();
  for (const place of found) {
    if (!place.displayName?.text || !place.location || seen.has(place.id)) continue;
    if (place.businessStatus && place.businessStatus !== "OPERATIONAL") continue;
    const distance = distanceKm(lat, lon, place.location.latitude, place.location.longitude);
    // locationBias is only a preference: enforce the radius here.
    if (distance > radiusKm) continue;
    seen.add(place.id);
    places.push({
      sourceRef: `google:${place.id}`,
      source: "Google Maps",
      name: place.displayName.text,
      website: place.websiteUri,
      address: place.formattedAddress,
      city: cityOf(place),
      distanceKm: Math.round(distance * 10) / 10,
      phone: place.nationalPhoneNumber,
      mapsUrl: place.googleMapsUri,
      category: place.primaryTypeDisplayName?.text,
      rating: place.rating,
      reviewCount: place.userRatingCount,
    });
  }
  return places.sort((a, b) => a.distanceKm - b.distanceKm);
}
