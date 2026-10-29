// Tapa el inglés de campaña de los banners STMNT y escribe el texto en español.
// No toca el envase, el logo ni la firma de Julius. Lee los originales.
// Uso: node scripts/stmnt-banners.mjs
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const origenDir = join(root, "src", "data", "stmnt-origen");
const outDir = join(root, "src", "assets", "stmnt");
const font = pathToFileURL(
  join(root, "node_modules", "@fontsource-variable", "manrope", "files", "manrope-latin-wght-normal.woff2"),
).href;
const TINTA = "#111";
const CREMA = "#f4f1ea";

const banners = [
  {
    id: "pasta-mate",
    src: "pasta-mate-original.jpg",
    w: 980,
    h: 352,
    bg: "#bfb9b6",
    foto: "right center",
    plates: [{ left: 36, top: 48, width: 448, height: 272, bg: "#bfb9b6" }],
    titular: "Textura mate.<br>Control sin<br>esfuerzo.",
    linea: "Para un efecto súper mate.",
    boton: "En el local",
    titularSize: 46,
  },
  {
    id: "gama-cuidado",
    src: "gama-cuidado.jpg",
    w: 980,
    h: 352,
    bg: "#d8d8d8",
    foto: "right center",
    plates: [{ left: 0, top: 0, width: 362, height: 324, bg: "#d8d8d8", pad: "36px 28px" }],
    titular: "Cuidado para<br>cada día.",
    linea: "Champú, barba y peinado.",
    boton: "En el local",
    titularSize: 46,
  },
  {
    id: "afeitado",
    src: "_no-usar-afeitado-modelo.jpg",
    w: 1245,
    h: 450,
    bg: "#a4a8ab",
    foto: "right center",
    plates: [
      {
        left: 0,
        top: 0,
        width: 478,
        height: 450,
        bg: "linear-gradient(90deg, rgb(164,168,171) 0%, rgb(184,185,189) 78%, rgb(192,195,200) 100%)",
        pad: "40px 36px",
      },
    ],
    titular: "La rutina<br>de afeitado.",
    linea: "Gel y loción aftershave.",
    boton: "En el local",
    titularSize: 52,
  },
  {
    id: "retrato",
    src: "_no-usar-modelo.jpg",
    w: 1245,
    h: 450,
    bg: "#d9dde0",
    foto: "right center",
    plates: [
      {
        left: 0,
        top: 0,
        width: 430,
        height: 424,
        bg: "linear-gradient(90deg, rgb(217,221,224) 0%, rgb(226,228,232) 70%, rgb(230,231,235) 100%)",
        pad: "40px 36px",
      },
    ],
    titular: "Cuidado de<br>cada día.",
    linea: "",
    boton: "En el local",
    titularSize: 52,
  },
  {
    id: "julius",
    src: "_no-usar-julius.jpg",
    w: 980,
    h: 352,
    bg: "#ffffff",
    foto: "left center",
    fotoSize: "1280px auto",
    fotoHeight: 460,
    plates: [
      { left: 568, top: 78, width: 392, height: 132, bg: "#ffffff", pad: "0 8px" },
      { left: 568, top: 208, width: 392, height: 76, bg: "#ffffff", bare: true },
      { left: 568, top: 292, width: 260, height: 48, bg: TINTA, ink: CREMA, role: "boton" },
    ],
    titular: "Peinado<br>STMNT.",
    linea: "De mate a brillo.",
    boton: "En el local",
    titularSize: 42,
  },
  {
    id: "coleccion",
    src: "_no-usar-grupo.jpg",
    w: 980,
    h: 352,
    bg: "#cbcbcd",
    foto: "center 78%",
    fotoSize: "1500px auto",
    fotoHeight: 250,
    plates: [
      { left: 24, top: 16, width: 320, height: 132, bg: "#cbcbcd" },
      { left: 352, top: 22, width: 204, height: 112, bg: TINTA, ink: CREMA, role: "caja" },
    ],
    titular: "Toda la<br>gama.",
    linea: "",
    boton: "En la barbería.",
    titularSize: 42,
  },
];

function dataUrl(file) {
  const path = join(origenDir, file);
  if (!existsSync(path)) throw new Error(`Falta el original: ${path}`);
  return `data:image/jpeg;base64,${readFileSync(path).toString("base64")}`;
}

function baseCss(bg) {
  return `
    @font-face {
      font-family: Manrope;
      src: url("${font}") format("woff2");
      font-weight: 100 900;
      font-style: normal;
      font-display: block;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { background: ${bg}; }
    body { font-family: Manrope, sans-serif; color: ${TINTA}; }
    .titular { font-weight: 800; line-height: 0.95; letter-spacing: -0.02em; }
    .linea { font-weight: 650; line-height: 1.3; }
    .rule { display: block; background: ${TINTA}; }
    .boton {
      display: inline-block; width: fit-content;
      background: ${TINTA}; color: ${CREMA}; font-weight: 750; letter-spacing: 0.04em;
    }
  `;
}

function copyHtml(banner, wide) {
  const size = wide ? banner.titularSize : 64;
  const linea = banner.linea
    ? `<p class="linea" style="font-size:${wide ? 20 : 28}px">${banner.linea}</p>`
    : "";
  const rule = `<span class="rule" style="width:${wide ? 88 : 112}px;height:${wide ? 3 : 4}px"></span>`;
  const boton = `<span class="boton" style="font-size:${wide ? 18 : 26}px;padding:${wide ? "12px 18px" : "16px 22px"}">${banner.boton}</span>`;
  return { size, linea, rule, boton };
}

function htmlAncho(banner, foto) {
  const { size, linea, rule, boton } = copyHtml(banner, true);
  const plates = banner.plates
    .map((plate, i) => {
      const ink = plate.ink || TINTA;
      const pad = plate.pad ? `padding:${plate.pad};` : "";
      const common = `position:absolute;left:${plate.left}px;top:${plate.top}px;width:${plate.width}px;height:${plate.height}px;background:${plate.bg};color:${ink};${pad}`;
      if (plate.role === "boton") {
        return `<div style="${common}display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:750;letter-spacing:0.04em">${banner.boton}</div>`;
      }
      if (plate.role === "caja") {
        return `<div style="${common}display:flex;align-items:center;justify-content:center;text-align:center;padding:12px;font-size:22px;font-weight:750;line-height:1.15">${banner.boton}</div>`;
      }
      if (plate.bare) return `<div style="${common}"></div>`;
      const extraPad = plate.pad ? "" : "padding:4px 8px;";
      return `<div style="${common}display:flex;flex-direction:column;justify-content:center;gap:12px;${extraPad}">
        <p class="titular" style="font-size:${size}px">${banner.titular}</p>
        ${linea}
        ${rule}
        ${i === 0 && !banner.plates.some((p) => p.role === "boton" || p.role === "caja") ? boton : ""}
      </div>`;
    })
    .join("");
  const titularInPlate = banner.plates.some((p) => !p.bare && !p.role);
  return `<!doctype html>
<meta charset="utf-8" />
<style>
  ${baseCss(banner.bg)}
  body { width: ${banner.w}px; height: ${banner.h}px; overflow: hidden;
    background: ${banner.bg} url("${foto}") center / ${banner.w}px ${banner.h}px no-repeat; }
  ${titularInPlate ? "" : `.titular { font-size: ${size}px; }`}
</style>
<body>${plates}</body>`;
}

function htmlAlto(banner, foto) {
  const { size, linea, rule, boton } = copyHtml(banner, false);
  const height = banner.fotoHeight || 520;
  const sizeCss = banner.fotoSize || "auto 100%";
  return `<!doctype html>
<meta charset="utf-8" />
<style>
  ${baseCss(banner.bg)}
  body { width: 720px; background: ${banner.bg}; }
  .texto { padding: 56px 48px 40px; display: flex; flex-direction: column; gap: 22px; }
  .titular { font-size: ${size}px; }
  .foto {
    width: 720px; height: ${height}px;
    background: ${banner.bg} url("${foto}") ${banner.foto} / ${sizeCss} no-repeat;
  }
</style>
<body>
  <div class="texto">
    <p class="titular">${banner.titular}</p>
    ${linea}
    ${rule}
    ${boton}
  </div>
  <div class="foto"></div>
</body>`;
}

const browser = await chromium.launch();

async function shot(html, path, viewport, fullPage) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const family = await page.evaluate(() => getComputedStyle(document.querySelector(".titular")).fontFamily);
  if (!/manrope/i.test(family)) throw new Error(`Manrope no cargó: ${family}`);
  const box = await page.locator("body").boundingBox();
  await page.screenshot({
    path,
    type: "jpeg",
    quality: 90,
    clip: { x: 0, y: 0, width: viewport.width, height: Math.ceil(box.height) },
  });
  await page.close();
  console.log("ok", path);
}

for (const banner of banners) {
  const foto = dataUrl(banner.src);
  const ancho = join(outDir, `${banner.id}.jpg`);
  const alto = join(outDir, `${banner.id}-movil.jpg`);
  await shot(htmlAncho(banner, foto), ancho, { width: banner.w, height: banner.h }, false);
  await shot(htmlAlto(banner, foto), alto, { width: 720, height: 1100 }, true);
}

await browser.close();
