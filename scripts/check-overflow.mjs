// Comprueba que no hay desbordamiento horizontal en anchos de movil habituales.
// Uso: node scripts/check-overflow.mjs [url]
import { chromium } from "@playwright/test";

const url = process.argv[2] ?? "http://localhost:4399/";
const browser = await chromium.launch();
let failed = false;
for (const width of [320, 360, 375, 390, 412, 768]) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 }, isMobile: width < 700, hasTouch: width < 700 });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  const result = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const bad = [...document.querySelectorAll("body *")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > vw + 1 || r.left < -1) && !el.closest("[hidden]");
      })
      .slice(0, 4)
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 30)} right=${Math.round(el.getBoundingClientRect().right)}`);
    return { scrollW: document.documentElement.scrollWidth, vw, bad };
  });
  // Cuenta solo el desbordamiento real de la pagina (lo recortado con overflow:hidden no scrollea)
  const ok = result.scrollW <= result.vw;
  if (!ok) failed = true;
  console.log(`${width}px: ${ok ? "ok" : "DESBORDA"} ${ok ? "" : JSON.stringify(result)}`);
  await ctx.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
