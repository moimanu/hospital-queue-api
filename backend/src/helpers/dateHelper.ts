const TIMEZONE = process.env.TIMEZONE || "America/Sao_Paulo";

/**
 * Constrói um Date que representa meia-noite no fuso configurado,
 * mesmo que o servidor esteja em outro fuso.
 */
function getDateForLocalMidnight(dateStr: string, timeZone: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);

  // Inicializa com um chute em UTC
  let utc = Date.UTC(y, m - 1, d, 0, 0, 0);

  for (let i = 0; i < 5; i++) {
    const dt = new Date(utc);
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(dt).reduce((acc: Record<string, string>, p) => {
      if (p.type !== "literal") acc[p.type] = p.value;
      return acc;
    }, {});

    const localUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second)
    );

    const offset = utc - localUtc; // diferença em ms
    const desiredLocalUtc = Date.UTC(y, m - 1, d, 0, 0, 0);
    const newUtc = desiredLocalUtc + offset;

    if (Math.abs(newUtc - utc) < 1) {
      utc = newUtc;
      break;
    }
    utc = newUtc;
  }

  return new Date(utc);
}

/**
 * Retorna o dia da semana em inglês (Sunday, Monday, etc.),
 * interpretando YYYY-MM-DD como data local no fuso definido.
 */
export function getLocalWeekday(dateInput: string | number | Date = new Date()): string {
  let date: Date;

  if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    console.log("[getLocalWeekday] Recebido string (YYYY-MM-DD):", dateInput);
    date = getDateForLocalMidnight(dateInput, TIMEZONE);
    console.log("[getLocalWeekday] Construído Date (UTC) para meia-noite no fuso:", date.toISOString());
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
