// Evita publicar la web con el aviso legal incompleto.
// Los datos NO están en git: vienen de LEGAL_JSON (Cloudflare) o de src/data/legal.local.json (local).
// En local solo avisa; en Cloudflare Pages (CF_PAGES=1) o con STRICT_LEGAL=1 falla el build.
import { existsSync, readFileSync } from "node:fs";

function cargarLegal() {
  const local = new URL("../src/data/legal.local.json", import.meta.url);
  const base = existsSync(local) ? JSON.parse(readFileSync(local, "utf8")) : {};
  if (!process.env.LEGAL_JSON) return base;
  try {
    return { ...base, ...JSON.parse(process.env.LEGAL_JSON) };
  } catch {
    console.error("ERROR: LEGAL_JSON no es un JSON válido.");
    process.exit(1);
  }
}

const legal = cargarLegal();

// registroMercantil solo aplica a sociedades; es opcional.
const required = ["titular", "nif", "email"];
const missing = required.filter((key) => !legal[key]);

if (missing.length === 0) process.exit(0);

const message = `Aviso legal incompleto (LEGAL_JSON o src/data/legal.local.json): faltan ${missing.join(", ")}.`;
const strict = process.env.CF_PAGES === "1" || process.env.STRICT_LEGAL === "1";

if (strict) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}
console.warn(`AVISO: ${message} (el build en producción fallará hasta completarlo)`);
