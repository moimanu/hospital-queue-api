const TIMEZONE = process.env.TIMEZONE || "America/Sao_Paulo";

/**
 * Retorna o dia da semana em inglês (Sunday, Monday, etc.),
 * interpretando YYYY-MM-DD como data local no fuso definido.
 */
export function getLocalWeekday(dateInput: string | number | Date = new Date()): string {
  let date: Date;

  if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    // Garante meia-noite no fuso configurado
    console.log("[getLocalWeekday] Recebido string (YYYY-MM-DD):", dateInput);
    date = new Date(dateInput + "T00:00:00");
    console.log("[getLocalWeekday] Construído Date (UTC):", date.toISOString());
  } else {
    console.log("[getLocalWeekday] Recebido outro tipo:", dateInput);
    date = new Date(dateInput);
    console.log("[getLocalWeekday] Construído Date (UTC):", date.toISOString());
  }

  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "long",
  }).format(date);

  console.log("[getLocalWeekday] Formatado para TIMEZONE", TIMEZONE, "=>", weekday);

  return weekday;
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

/**
 * Retorna a data atual no formato YYYY-MM-DD
 */
export function getLocalISODate(dateInput: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(dateInput);
}