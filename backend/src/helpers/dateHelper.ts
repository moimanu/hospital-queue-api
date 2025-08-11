// helpers/dateHelper.ts
const TIMEZONE = "America/Sao_Paulo";

/**
 * Retorna a data local no formato YYYY-MM-DD
 */
export function getLocalDate(dateInput: string | number | Date = new Date()): string {
  const date = new Date(dateInput);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // "en-CA" retorna no formato YYYY-MM-DD
  return formatter.format(date);
}

/**
 * Retorna o horário local no formato HH:mm:ss
 */
export function getLocalTime(dateInput: string | number | Date = new Date()): string {
  const date = new Date(dateInput);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find(p => p.type === type)?.value || "00";
  return `${get("hour")}:${get("minute")}:${get("second")}`;
}

/**
 * Retorna o dia da semana em inglês (Sunday, Monday, etc.),
 * interpretando YYYY-MM-DD como data local no fuso definido.
 */
export function getLocalWeekday(dateInput: string | number | Date = new Date()): string {
  let date: Date;

  if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const parts = dateInput.split("-").map((p) => parseInt(p, 10));
    const year = parts[0] ?? 0;
    const month = parts[1] ?? 1;
    const day = parts[2] ?? 1;
    date = new Date(year, month - 1, day);
  } else {
    date = new Date(dateInput);
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "long",
  }).format(date);
}
