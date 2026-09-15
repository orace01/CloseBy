export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count.toLocaleString("fr-FR")} ${count > 1 ? pluralForm : singular}`;
}

export function formatKm(km: number) {
  return `${km.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} km`;
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
