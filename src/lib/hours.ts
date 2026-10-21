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
