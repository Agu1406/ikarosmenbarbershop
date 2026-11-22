import { HOURS } from "./data";

const TZ = "Europe/Madrid";
const WEEKDAYS: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};
const DAY_NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

/** Día de la semana y minutos del día en Madrid, sea cual sea la zona del navegador. */
function madridNow(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    weekday: WEEKDAYS[get("weekday")] ?? 0,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");
const time = (h: number, m: number) => `${pad(h)}:${pad(m)}`;

export interface OpenStatus {
  open: boolean;
  /** Texto corto: "Abierto ahora, cierra a las 21:00" o "Cerrado, abre mañana a las 10:00". */
  label: string;
}

export function getOpenStatus(date: Date = new Date()): OpenStatus {
  const { weekday, minutes } = madridNow(date);
  const today = HOURS[weekday] ?? [];

  const current = today.find(
    ([h1, m1, h2, m2]) => minutes >= h1 * 60 + m1 && minutes < h2 * 60 + m2,
  );
  if (current) {
    return {
      open: true,
      label: `Abierto ahora, cierra a las ${time(current[2], current[3])}`,
    };
  }

  // Siguiente apertura: hoy más tarde, o el primer día con franjas.
  const later = today.find(([h1, m1]) => h1 * 60 + m1 > minutes);
  if (later) {
    return { open: false, label: `Cerrado, abre a las ${time(later[0], later[1])}` };
  }
  for (let offset = 1; offset <= 7; offset++) {
    const day = (weekday + offset) % 7;
    const first = (HOURS[day] ?? [])[0];
    if (first) {
      const when = offset === 1 ? "mañana" : `el ${DAY_NAMES[day]}`;
      return { open: false, label: `Cerrado, abre ${when} a las ${time(first[0], first[1])}` };
    }
  }
  return { open: false, label: "Cerrado" };
}

/**
 * Instantánea UTC de la próxima apertura en Madrid (para programar Uber Direct).
 * Si ya está abierto, la recogida es en unos minutos (preparar la bolsa).
 */
export function nextPickupAt(date: Date = new Date()): { at: Date; scheduled: boolean } {
  const estado = getOpenStatus(date);
  if (estado.open) {
    return { at: new Date(date.getTime() + 15 * 60_000), scheduled: false };
  }

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  const y = get("year");
  const mo = get("month");
  const d = get("day");
  const { weekday, minutes } = madridNow(date);
  const today = HOURS[weekday] ?? [];
  const later = today.find(([h1, m1]) => h1 * 60 + m1 > minutes);

  /** Instante UTC cuya hora de pared en Madrid es year-month-day h:m. */
  const toUtc = (year: number, month: number, day: number, h: number, m: number) => {
    const guess = new Date(Date.UTC(year, month - 1, day, h, m));
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(guess);
    const g = (type: string) => Number(fmt.find((p) => p.type === type)?.value ?? "0");
    const asMadrid = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"));
    const want = Date.UTC(year, month - 1, day, h, m);
    return new Date(guess.getTime() + (want - asMadrid));
  };

  if (later) {
    return { at: toUtc(y, mo, d, later[0], later[1]), scheduled: true };
  }

  for (let offset = 1; offset <= 7; offset++) {
    const day = (weekday + offset) % 7;
    const first = (HOURS[day] ?? [])[0];
    if (!first) continue;
    const base = new Date(date.getTime() + offset * 24 * 60 * 60_000);
    const bp = new Intl.DateTimeFormat("en-GB", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(base);
    const by = Number(bp.find((p) => p.type === "year")?.value ?? "0");
    const bm = Number(bp.find((p) => p.type === "month")?.value ?? "0");
    const bd = Number(bp.find((p) => p.type === "day")?.value ?? "0");
    return { at: toUtc(by, bm, bd, first[0], first[1]), scheduled: true };
  }

  return { at: new Date(date.getTime() + 60 * 60_000), scheduled: true };
}
