export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function initialsOf(name: string) {
  const letters = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]);
  return (letters.join("") || "?").toUpperCase();
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count.toLocaleString("fr-FR")} ${count > 1 ? pluralForm : singular}`;
}

export function formatKm(km: number) {
  if (km < 0.1) return "< 100 m";
  return `${km.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} km`;
}

/** "+33 2 41 88 47 20" → "02 41 88 47 20". Other numbers are returned as is. */
export function formatPhone(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  const national = digits.startsWith("+33") ? `0${digits.slice(3)}` : digits.startsWith("0033") ? `0${digits.slice(4)}` : digits;
  return /^0\d{9}$/.test(national) ? national.replace(/(\d{2})(?=\d)/g, "$1 ") : phone;
}

/** Value for a tel: link. */
export function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function formatNumber(value: number) {
  return value.toLocaleString("fr-FR");
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
}

/** "1er octobre", "12 octobre" */
export function formatDayMonth(iso: string) {
  const date = new Date(iso);
  const day = date.getUTCDate();
  const month = date.toLocaleDateString("fr-FR", { month: "long", timeZone: "UTC" });
  return `${day === 1 ? "1er" : day} ${month}`;
}

/** "restaurant.fr/contact" from a full URL; other values are returned as is. */
export function shortUrl(value: string) {
  try {
    const url = new URL(value);
    return `${url.hostname.replace(/^www\./, "")}${url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "")}`;
  } catch {
    return value;
  }
}
