import { expect, test } from "@playwright/test";
test.describe("maquetación y preguntas frecuentes", () => {
  test("no hay desbordamiento horizontal en anchos de móvil habituales", async ({ page }) => {
    for (const width of [320, 360, 390, 412]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      const { scrollW, clientW } = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
      }));
      expect(scrollW, `desborda a ${width}px`).toBeLessThanOrEqual(clientW);
    }
  });

  test("el botón Menú cabe dentro de la pantalla a 390 px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/");
    const box = await page.locator("[data-menu-toggle]").boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  });

  test("las preguntas frecuentes existen y se abren con teclado", async ({ page }) => {
    await page.goto("/");
    const faq = page.locator("#preguntas");
    await expect(faq.getByRole("heading", { level: 2 })).toBeVisible();
    const first = faq.locator("details").first();
    await expect(first).not.toHaveAttribute("open", "");
    await first.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(first).toHaveAttribute("open", "");
  });

  test("la respuesta de precios coincide con la carta (data.ts)", async ({ page }) => {
    await page.goto("/");
    const row = page.locator(".menu-item", { hasText: "Lavar, cortar y peinar" }).first();
    const price = (await row.locator(".menu-price").innerText()).trim();
    expect(price).toMatch(/€/);
    await page.locator("#preguntas details").first().locator("summary").click();
    await expect(page.locator("#preguntas details").first()).toContainText(price);
  });

  test("las preguntas frecuentes no usan guiones largos", async ({ page }) => {
    await page.goto("/");
    const text = await page.locator("#preguntas").innerText();
    expect(text).not.toContain("\u2014");
  });

  test("la carta STMNT está en la home y coincide un precio", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#productos");
    await expect(section.getByRole("heading", { level: 2 })).toContainText("STMNT");
    const row = section.locator(".menu-item", { hasText: "Pasta mate" }).first();
    await expect(row.locator(".menu-price")).toHaveText("31,99 €");
    await expect(section.locator("img").first()).toHaveAttribute("alt", /rutina de afeitado/);
    await expect(section.locator("img[alt*='Textura mate']").first()).toBeAttached();
    const alts = await section.locator("img").evaluateAll((imgs) => imgs.map((img) => img.getAttribute("alt") ?? ""));
    for (const alt of alts) {
      expect(alt).not.toMatch(/shop now|make your statement|pioneers|redefined|discover the range/i);
    }
    await expect(page.locator('a[href="/#productos"]').first()).toBeAttached();
  });

  test("el PIM de STMNT no se sirve en público", async ({ request }) => {
    const res = await request.get("/PIM%20-%20Descirpciones%20y%20PVPR%20STMNT.xlsx");
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });
});
