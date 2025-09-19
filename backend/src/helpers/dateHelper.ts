// helpers/dateHelper.ts
const TIMEZONE = "America/Sao_Paulo";

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

/**
 * Retorna a data/hora atual no fuso configurado (America/Sao_Paulo),
 * em formato ISO (YYYY-MM-DDTHH:mm:ss).
 */
export function getLocalISODateTime(dateInput: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(dateInput)
    .replace(",", "");
    
  return parts.replace(" ", "T");
}
