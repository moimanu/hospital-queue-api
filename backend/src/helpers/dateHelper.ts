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
