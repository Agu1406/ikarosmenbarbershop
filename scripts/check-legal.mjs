// Evita publicar la web con el aviso legal incompleto.
// En local solo avisa; en Cloudflare Pages (CF_PAGES=1) o con STRICT_LEGAL=1 falla el build.
import { readFileSync } from "node:fs";

const legal = JSON.parse(
  readFileSync(new URL("../src/data/legal.json", import.meta.url), "utf8"),
);

// registroMercantil solo aplica a sociedades; es opcional.
const required = ["titular", "nif", "email"];
const missing = required.filter((key) => !legal[key]);

if (missing.length === 0) process.exit(0);

const message = `Aviso legal incompleto en src/data/legal.json: faltan ${missing.join(", ")}.`;
const strict = process.env.CF_PAGES === "1" || process.env.STRICT_LEGAL === "1";

if (strict) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}
console.warn(`AVISO: ${message} (el build en producción fallará hasta completarlo)`);
