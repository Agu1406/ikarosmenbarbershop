// Lee el PIM de STMNT (xlsx) y genera src/data/stmnt.json.
// Uso: node scripts/import-stmnt.mjs [ruta.xlsx]
import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const xlsx =
  process.argv[2] ?? join(root, "src", "data", "PIM - Descirpciones y PVPR STMNT.xlsx");
const out = join(root, "src", "data", "stmnt.json");

const GROUP_ORDER = [
  { id: "afeitado", title: "Afeitado", icon: "drop", segments: ["Shaving"] },
  {
    id: "limpieza",
    title: "Limpieza y cuidado",
    icon: "shower",
    segments: ["Shampoo", "Wash-Out", "Serum"],
  },
  { id: "barba", title: "Barba", icon: "leaf", segments: ["Oil"] },
  {
    id: "peinado",
    title: "Peinado y textura",
    icon: "wind",
    segments: ["Texture", "Powder", "Pomade", "Cream", "Paste/Clay", "Hold", "Gel", "Finish"],
  },
];

function colIndex(col) {
  let n = 0;
  for (const ch of col) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

function parseXlsx(path) {
  const tmp = mkdtempSync(join(tmpdir(), "stmnt-"));
  try {
    const zip = join(tmp, "p.zip");
    cpSync(path, zip);
    execFileSync("tar", ["-xf", zip, "-C", tmp], { windowsHide: true });
    const strings = [];
    const ss = new TextDecoder("utf8").decode(readFileSync(join(tmp, "xl", "sharedStrings.xml")));
    for (const si of ss.split(/<si[ >]/).slice(1)) {
      const texts = [...si.matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map((m) => decodeXml(m[1]));
      strings.push(texts.join(""));
    }
    const sheet = readFileSync(join(tmp, "xl", "worksheets", "sheet1.xml"), "utf8");
    const rows = new Map();
    for (const cell of sheet.matchAll(/<c r="([A-Z]+)(\d+)"([^>]*)>([\s\S]*?)<\/c>/g)) {
      const col = cell[1];
      const r = Number(cell[2]);
      const attrs = cell[3];
      const inner = cell[4];
      let value = "";
      if (/\st="s"/.test(attrs)) {
        const v = inner.match(/<v>(\d+)<\/v>/);
        value = v ? strings[Number(v[1])] ?? "" : "";
      } else {
        const v = inner.match(/<v>([^<]*)<\/v>/);
        value = v ? v[1] : "";
      }
      if (!rows.has(r)) rows.set(r, []);
      rows.get(r)[colIndex(col)] = value;
    }
    const ordered = [...rows.entries()].sort((a, b) => a[0] - b[0]).map(([, cells]) => cells);
    const header = ordered[0];
    return ordered.slice(1).map((cells) => {
      const row = {};
      header.forEach((key, i) => {
        row[key] = cells[i] ?? "";
      });
      return row;
    });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

function decodeXml(text) {
  return text
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function plain(text) {
  return String(text ?? "")
    .replaceAll("\u2014", ". ")
    .replaceAll("\u2013", ", ")
    .replaceAll("\u00a0", " ")
    .replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

// Precio de venta en el local: PVPR + 30 %, y siempre hacia arriba hasta acabar en ,99.
const MARKUP = 1.3;

function euro(raw) {
  const pvprCents = Math.round(Number(raw) * 100);
  if (!Number.isFinite(pvprCents)) throw new Error(`PVPR no numérico: ${raw}`);
  const raised = Math.round(pvprCents * MARKUP);
  const cents = raised % 100 === 99 ? raised : raised + (99 - (raised % 100));
  const n = (cents / 100).toFixed(2).replace(".", ",");
  return `${n} €`;
}

function titleEs(text) {
  const lower = text.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function splitName(full) {
  let work = plain(full)
    .replace(/^STMNT\s+/i, "")
    .replace(/GROOMING GOODS\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
  const sizeMatch = work.match(
    /(\d+(?:[.,]\d+)?\s*(?:ml|g|oz)(?:\s*\/\s*\d+(?:[.,]\d+)?\s*(?:ml|g|oz))?)/i,
  );
  let size = "";
  if (sizeMatch) {
    const ml = sizeMatch[1].match(/(\d+(?:[.,]\d+)?)\s*ml/i);
    const grams = sizeMatch[1].match(/(\d+(?:[.,]\d+)?)\s*g\b/i);
    if (ml) size = `${ml[1]} ml`;
    else if (grams) size = `${grams[1]} g`;
    else size = sizeMatch[1].replace(/\s+/g, " ").trim();
    work = work.replace(sizeMatch[0], "").replace(/\/\s*$/, "").trim();
  }
  return { name: titleEs(work), size };
}

function groupId(segment) {
  const found = GROUP_ORDER.find((g) => g.segments.includes(segment));
  if (!found) throw new Error(`Segmento STMNT sin grupo: ${segment}`);
  return found.id;
}

const rows = parseXlsx(xlsx);
const grouped = Object.fromEntries(GROUP_ORDER.map((g) => [g.id, []]));

for (const row of rows) {
  const { name, size } = splitName(row["Full Length Product Name"]);
  const item = {
    id: String(row["GTIN Number - EA"] || row["IDH number"]),
    name,
    size,
    price: euro(row["PVPR 09.26"]),
    summary: plain(row["Product Description Short"]),
    use: plain(row["How To Use/Apply"]),
    warning: plain(row["Warnings On The Product"]),
  };
  grouped[groupId(row["PSV Market Segment"])].push(item);
}

const catalog = {
  brand: "STMNT",
  manufacturer: "Henkel AG & Co. KGaA",
  source: "PIM STMNT, PVPR 09.2026, más 30 % y redondeo al alza a ,99",
  groups: GROUP_ORDER.map((g) => ({
    id: g.id,
    title: g.title,
    icon: g.icon,
    items: grouped[g.id],
  })),
};

const missing = catalog.groups.filter((g) => g.items.length === 0).map((g) => g.title);
if (missing.length) throw new Error(`Grupos vacíos: ${missing.join(", ")}`);

writeFileSync(out, `${JSON.stringify(catalog, null, 2)}\n`);
const count = catalog.groups.reduce((n, g) => n + g.items.length, 0);
console.log(`ok ${count} productos -> ${out}`);
