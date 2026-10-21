// Extrae un fotograma del vídeo del hero para usarlo como póster (coherente con el vídeo).
// Uso: node scripts/extract-poster.mjs [segundos]   (por defecto 0.5)
// Requiere Chromium de Playwright (npx playwright install chromium) y sharp.
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const seconds = Number(process.argv[2] ?? 0.5);
const video = readFileSync(new URL("../public/media/hero-barber.mp4", import.meta.url));

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent("<video id=v muted playsinline></video>");
const dataUrl = await page.evaluate(
  async ({ b64, t }) => {
    const v = document.getElementById("v");
    v.src = `data:video/mp4;base64,${b64}`;
    await new Promise((res, rej) => {
      v.onloadeddata = res;
      v.onerror = () => rej(new Error("No se pudo decodificar el vídeo"));
    });
    v.currentTime = t;
    await new Promise((res) => (v.onseeked = res));
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    return { url: c.toDataURL("image/png"), w: v.videoWidth, h: v.videoHeight };
  },
  { b64: video.toString("base64"), t: seconds },
);
await browser.close();

const png = Buffer.from(dataUrl.url.split(",")[1], "base64");
const out = new URL("../src/assets/media/hero-poster.webp", import.meta.url);
writeFileSync(out, await sharp(png).webp({ quality: 82 }).toBuffer());
console.log(`Póster generado desde ${seconds}s (${dataUrl.w}x${dataUrl.h}).`);
