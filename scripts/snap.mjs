// Capturas del sitio propio para comparar antes/despues. Uso: node scripts/snap.mjs <carpeta> <etiqueta> [url]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const [outDir, label, url = "http://localhost:4399/"] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
for (const [kind, viewport, mobile] of [
  ["escritorio", { width: 1440, height: 900 }, false],
  ["movil", { width: 390, height: 844 }, true],
]) {
  const ctx = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(outDir, `${label}-${kind}-hero.png`) });
  await page.screenshot({ path: join(outDir, `${label}-${kind}-full.png`), fullPage: true });
  await ctx.close();
}
await browser.close();
console.log("ok", outDir, label);
