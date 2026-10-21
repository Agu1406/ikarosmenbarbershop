// Captura referencias de diseño para Design DNA: capturas (escritorio y móvil) y métricas CSS medidas.
// Uso: node scripts/dna-capture.mjs <salida> <url1> <url2> ...
// Las capturas NO se guardan en el repo (son webs de terceros): usa una carpeta temporal.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [outDir, ...urls] = process.argv.slice(2);
if (!outDir || urls.length === 0) {
  console.error("uso: node scripts/dna-capture.mjs <carpeta> <url...>");
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const PROPS = [
  "fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "textTransform",
  "color", "backgroundColor", "borderRadius", "borderWidth", "borderColor", "padding",
  "maxWidth", "boxShadow", "textAlign",
];

function measure() {
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
  };
  const pick = (el) => {
    const s = getComputedStyle(el);
    const out = { text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 48) };
    for (const p of ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "textTransform", "color", "backgroundColor", "borderRadius", "borderTopWidth", "borderTopColor", "paddingTop", "paddingRight", "maxWidth", "boxShadow", "textAlign"]) {
      out[p] = s[p];
    }
    const r = el.getBoundingClientRect();
    out.box = { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top + scrollY) };
    return out;
  };
  const first = (sel, n = 3) => [...document.querySelectorAll(sel)].filter(visible).slice(0, n).map(pick);

  // Secciones de primer nivel: altura y padding vertical (ritmo)
  const root = document.querySelector("main") || document.body;
  const blocks = [...root.children].filter(visible).slice(0, 14).map((el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      h: Math.round(r.height),
      pt: s.paddingTop,
      pb: s.paddingBottom,
      bg: s.backgroundColor,
      heading: (el.querySelector("h1,h2,h3")?.textContent || "").trim().replace(/\s+/g, " ").slice(0, 50),
    };
  });

  const buttons = [...document.querySelectorAll("a,button")]
    .filter(visible)
    .filter((el) => /book|reserv|cita|appointment|learn|view|ver/i.test(el.textContent || ""))
    .slice(0, 4)
    .map(pick);

  return {
    title: document.title,
    bodyFont: getComputedStyle(document.body).fontFamily,
    bodySize: getComputedStyle(document.body).fontSize,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    docHeight: document.documentElement.scrollHeight,
    nav: first("header, nav", 2),
    h1: first("h1", 2),
    h2: first("h2", 4),
    h3: first("h3", 3),
    p: first("p", 3),
    buttons,
    images: [...document.querySelectorAll("img")].filter(visible).slice(0, 4).map((el) => ({
      radius: getComputedStyle(el).borderRadius,
      w: Math.round(el.getBoundingClientRect().width),
      h: Math.round(el.getBoundingClientRect().height),
    })),
    blocks,
    videos: document.querySelectorAll("video").length,
    canvases: document.querySelectorAll("canvas").length,
    scripts: [...document.scripts].map((s) => s.src).filter(Boolean).map((u) => new URL(u).hostname).filter((v, i, a) => a.indexOf(v) === i).slice(0, 12),
  };
}

const browser = await chromium.launch();
const report = {};
for (const url of urls) {
  const host = new URL(url).hostname.replace(/^www\./, "").replace(/\W+/g, "-");
  report[host] = { url };
  for (const [kind, viewport, mobile] of [
    ["escritorio", { width: 1440, height: 900 }, false],
    ["movil", { width: 390, height: 844 }, true],
  ]) {
    const ctx = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, locale: "en-US" });
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
      await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
      // Recorre la página para activar animaciones al scroll y cargas diferidas
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(800);
      await page.screenshot({ path: join(outDir, `${host}-${kind}-hero.png`) });
      await page.screenshot({ path: join(outDir, `${host}-${kind}-full.png`), fullPage: true });
      if (!mobile) report[host].metrics = await page.evaluate(measure);
      console.log(`ok ${host} ${kind}`);
    } catch (error) {
      console.log(`FALLO ${host} ${kind}: ${error.message.split("\n")[0]}`);
    }
    await ctx.close();
  }
}
await browser.close();
writeFileSync(join(outDir, "metrics.json"), JSON.stringify(report, null, 2));
console.log("listo:", outDir);
