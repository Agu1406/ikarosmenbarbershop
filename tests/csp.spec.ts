import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

// `astro preview` no aplica public/_headers (eso lo hace Cloudflare Pages),
// así que inyectamos la misma CSP para comprobar que la web funciona con ella.
const headers = readFileSync("public/_headers", "utf8");
const csp = headers.match(/Content-Security-Policy:\s*(.+)/)?.[1]?.trim();

test("la web funciona con la CSP de producción", async ({ page }, testInfo) => {
  expect(csp).toBeTruthy();

  // Solo recursos propios: el iframe de Google se deja pasar sin tocar.
  await page.route(/^http:\/\/localhost:\d+\//, async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: { ...response.headers(), "content-security-policy": csp! },
    });
  });

  const violations: string[] = [];
  page.on("console", (msg) => {
    if (/content security policy/i.test(msg.text())) violations.push(msg.text());
  });

  await page.goto("/");
  // Los scripts de la página siguen funcionando: estado abierto/cerrado y menú.
  await expect(page.locator("[data-open-status]")).toHaveText(/^(Abierto ahora|Cerrado)/);
  if (testInfo.project.name === "movil") {
    await page.getByRole("button", { name: "Menú" }).click();
    await expect(page.getByRole("button", { name: "Menú" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  }
  // El mapa (frame-src de Google) se carga al pedirlo.
  await page.getByRole("button", { name: "Cargar mapa" }).click();
  await expect(page.locator("iframe")).toHaveCount(1);

  expect(violations).toEqual([]);
});
