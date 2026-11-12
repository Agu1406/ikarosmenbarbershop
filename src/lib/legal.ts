/**
 * Datos legales del titular (LSSI art. 10). No se versionan en git.
 *
 * Orden de lectura (el último gana):
 *  1. `src/data/legal.local.json` (local, ignorado en git; plantilla en `legal.example.json`).
 *  2. Variable de entorno `LEGAL_JSON` (hosting: Cloudflare).
 *
 * Si faltan datos quedan vacíos y el build de producción falla (`scripts/check-legal.mjs`).
 */
export type Legal = {
  titular: string;
  nif: string;
  email: string;
  registroMercantil: string | null;
};

const VACIO: Legal = { titular: "", nif: "", email: "", registroMercantil: null };

const locales = import.meta.glob("../data/legal.local.json", {
  eager: true,
  import: "default",
}) as Record<string, Partial<Legal>>;

function desdeEntorno(): Partial<Legal> {
  const crudo = typeof process !== "undefined" ? process.env?.LEGAL_JSON : undefined;
  if (!crudo) return {};
  try {
    return JSON.parse(crudo) as Partial<Legal>;
  } catch {
    throw new Error("LEGAL_JSON no es un JSON válido. Revisa la variable de entorno.");
  }
}

export const legal: Legal = {
  ...VACIO,
  ...(Object.values(locales)[0] ?? {}),
  ...desdeEntorno(),
};
