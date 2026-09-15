// Rough local reading of a campaign brief. The agent backend will replace this
// with a real analysis; it only has to feel right in the prototype.

export interface ParsedBrief {
  offer: string;
  target: string;
  zone: string;
}

const EXAMPLE = "Je crée des sites web pour les restaurants autour de Lyon";

function capitalize(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed[0].toUpperCase() + trimmed.slice(1) : trimmed;
}

export function parseBrief(input: string): ParsedBrief {
  const brief = (input.trim() || EXAMPLE).replace(/[.!]+$/, "");

  const zoneMatch = brief.match(/\b(?:à|a|autour de|près de|sur|dans)\s+([A-ZÀ-Ý][\p{L}'’-]*(?:\s+[A-ZÀ-Ý][\p{L}'’-]*)*)$/u);
  const zone = zoneMatch?.[1] ?? "Autour de vous";
  const withoutZone = zoneMatch ? brief.slice(0, zoneMatch.index).trim() : brief;

  const [before, after] = withoutZone.split(/\s+pour\s+/i);
  const target = after ? capitalize(after.replace(/^(les|des|la|le|l[’'])\s*/i, "")) : "Entreprises locales";
  const offer = capitalize(
    before.replace(/^(je|j[’'])\s*(crée|créé|fais|propose|réalise|installe|aide|accompagne|vends)\s+(des|les|un|une|de la|du)?\s*/i, ""),
  );

  return { offer: offer || "Votre offre", target, zone };
}
