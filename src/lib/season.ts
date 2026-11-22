/** Temporada visual de fiestas: 1 dic → 6 ene (Reyes), Europe/Madrid. */

export const SEASON_NAVIDAD = "navidad" as const;
export type Season = typeof SEASON_NAVIDAD;

const TZ = "Europe/Madrid";

/** Mes (1–12) y día en Madrid, sea cual sea la zona del navegador. */
function madridMonthDay(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  return { month: get("month"), day: get("day") };
}

/** True del 1 de diciembre al 6 de enero inclusive (Madrid). */
export function isNavidadSeason(date: Date = new Date()): boolean {
  const { month, day } = madridMonthDay(date);
  if (month === 12) return day >= 1;
  if (month === 1) return day <= 6;
  return false;
}

/**
 * Vista previa: `?season=navidad` fuerza on, `?season=off` fuerza off.
 * Otros valores (o ausente) → null (usar la ventana de fechas).
 */
export function seasonFromQuery(param: string | null | undefined): Season | "off" | null {
  if (param === SEASON_NAVIDAD) return SEASON_NAVIDAD;
  if (param === "off") return "off";
  return null;
}

/** Atributo `data-season` a aplicar, o null si no hay temporada. */
export function resolveSeason(
  date: Date = new Date(),
  queryParam?: string | null,
): Season | null {
  const forced = seasonFromQuery(queryParam);
  if (forced === "off") return null;
  if (forced === SEASON_NAVIDAD) return SEASON_NAVIDAD;
  return isNavidadSeason(date) ? SEASON_NAVIDAD : null;
}

/**
 * Script síncrono para el `<head>` (misma ventana y query que las funciones de arriba).
 * Se inyecta con `is:inline` para que el adorno no dependa del deploy.
 */
const THEME_INK = "#182c48";
const THEME_NAVIDAD = "#143028";

function bootScriptBody(): string {
  return `(function(){var h=document.documentElement;var t=document.querySelector('meta[name="theme-color"]');var set=function(on){if(on){h.setAttribute("data-season","navidad");if(t)t.setAttribute("content","${THEME_NAVIDAD}");}else{h.removeAttribute("data-season");if(t)t.setAttribute("content","${THEME_INK}");}};var q=new URLSearchParams(location.search).get("season");if(q==="off"){set(false);return;}if(q==="navidad"){set(true);return;}var p=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Madrid",month:"numeric",day:"numeric"}).formatToParts(new Date());var g=function(k){return Number((p.find(function(x){return x.type===k;})||{}).value||0);};var m=g("month"),d=g("day");set(m===12||(m===1&&d<=6));})();`;
}

/**
 * Script síncrono para el `<head>` (misma ventana y query que las funciones de arriba).
 * Se inyecta con `is:inline` para que el adorno no dependa del deploy.
 */
export const SEASON_BOOT_SCRIPT = bootScriptBody();
