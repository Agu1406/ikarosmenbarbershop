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

  test("la carta STMNT está en /productos y coincide un precio", async ({ page }) => {
    await page.goto("/productos");
    const section = page.locator("#productos");
    await expect(section.getByRole("heading", { level: 1 })).toContainText("STMNT");
    const row = section.locator(".menu-item", { hasText: "Pasta mate" }).first();
    await expect(row.locator(".menu-price")).toHaveText("24,20 €");
    await expect(section.locator("img").first()).toHaveAttribute("alt", /rutina de afeitado/);
    await expect(section.locator("img[alt*='Textura mate']").first()).toBeAttached();
    const alts = await section.locator("img").evaluateAll((imgs) => imgs.map((img) => img.getAttribute("alt") ?? ""));
    for (const alt of alts) {
      expect(alt).not.toMatch(/shop now|make your statement|pioneers|redefined|discover the range/i);
    }
    await expect(page.getByRole("button", { name: /^Añadir/ }).first()).toBeVisible();
    await expect(page.locator('input[name^="qty_"]')).toHaveCount(0);
  });

  test("la cesta muestra el envío de Madrid antes de pagar", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#cesta")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Ver productos" })).toBeVisible();
    await page.goto("/productos");
    expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
    await page.getByRole("button", { name: /^Añadir/ }).first().click();
    await expect(page.locator("[data-cesta-cuenta]").first()).toHaveText("1");
    await expect(page.locator("a.cesta-link")).toHaveAttribute("aria-label", "Cesta, 1 productos");
    await page.goto("/cesta");
    const form = page.locator("#cesta");
    await expect(form).toHaveAttribute("action", "/api/checkout");
    await expect(form).toContainText("5,99 €");
    await expect(form).toContainText("16,90 €");
    await expect(form.getByRole("button", { name: "Pagar con Bizum o tarjeta" })).toBeVisible();
    await expect(page.locator('script[src*="stripe"]')).toHaveCount(0);
    await page.goto("/pago-cancelado");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Pago no completado");
    await page.goto("/cesta");
    await expect(page.locator("#cesta")).toBeVisible();
    await page.goto("/devoluciones");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Devoluciones");
    await expect(page.locator("body")).toContainText("14 días");
    await expect(page.locator("body")).toContainText("precinto");
  });

  test("el PIM de STMNT no se sirve en público", async ({ request }) => {
    const res = await request.get("/PIM%20-%20Descirpciones%20y%20PVPR%20STMNT.xlsx");
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });
});
