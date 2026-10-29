import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = ["/", "/aviso-legal", "/privacidad", "/cookies", "/404"];

test.describe("accesibilidad (axe, WCAG 2.1 AA)", () => {
  for (const path of PAGES) {
    test(`sin violaciones en ${path}`, async ({ page }) => {
      // Sin animaciones: axe mide contraste y no debe pillar la entrada del hero a medias.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(
        results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" | ")}`),
      ).toEqual([]);
    });
  }
});

test.describe("privacidad", () => {
  test("no hay peticiones a terceros, cookies ni localStorage antes de interactuar", async ({
    page,
    context,
  }) => {
    const external: string[] = [];
    page.on("request", (req) => {
      const url = new URL(req.url());
      if (!["localhost", ""].includes(url.hostname) && url.protocol.startsWith("http")) {
        external.push(req.url());
      }
    });

    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForLoadState("networkidle");

    expect(external).toEqual([]);
    expect(await context.cookies()).toEqual([]);
    expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
  });

  test("el mapa solo se carga al pulsar el botón", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("iframe")).toHaveCount(0);
    await page.getByRole("button", { name: "Cargar mapa" }).click();
    await expect(page.locator("iframe")).toHaveCount(1);
    await expect(page.locator("iframe")).toHaveAttribute("src", /maps\.google\.com/);
  });

  test("el calendario de Booksy solo se abre al pulsar Reservar", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#reserva")).toHaveCount(0);
    await page.getByRole("link", { name: "Reservar" }).first().click();
    const frame = page.locator("#reserva iframe");
    await expect(frame).toHaveAttribute("src", /booksy\.com\/widget\/index\.html\?id=169010/);
    await page.getByRole("button", { name: "Cerrar" }).click();
    await expect(page.locator("#reserva")).not.toBeVisible();
  });
});

test.describe("contenido", () => {
  test("estructura básica y CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    for (const id of ["servicios", "productos", "sobre-nosotros", "trayectoria", "opiniones", "contacto"]) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
    const booksy = page.locator('a[href*="booksy.com"]').first();
    await expect(booksy).toHaveAttribute("target", "_blank");
    await expect(booksy).toHaveAttribute("rel", /noopener/);
    await expect(page.locator('a[href^="tel:+34697270434"]').first()).toBeAttached();
  });

  test("no hay guiones largos en el texto visible", async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      const text = await page.locator("body").innerText();
      expect(text, `guion largo en ${path}`).not.toContain("\u2014");
    }
  });

  test("JSON-LD BarberShop sin aggregateRating", async ({ page }) => {
    await page.goto("/");
    const raw = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(raw ?? "{}");
    expect(data["@type"]).toBe("BarberShop");
    expect(data.address.postalCode).toBe("28232");
    expect(data.aggregateRating).toBeUndefined();
    // Lunes a viernes: 2 franjas x 5 días, sábado: 2 franjas, domingo cerrado.
    expect(data.openingHoursSpecification.length).toBe(12);
  });

  test("el estado abierto/cerrado se calcula en hora de Madrid", async ({ page }) => {
    const status = page.locator("[data-open-status]");
    // Octubre 2026 en Madrid es CEST (UTC+2).
    const cases: [string, string][] = [
      // Jueves 11:00 Madrid: abierto, cierra a las 14:00
      ["2026-10-08T09:00:00Z", "Abierto ahora, cierra a las 14:00"],
      // Jueves 14:30 Madrid: cerrado en la pausa, abre a las 16:00
      ["2026-10-08T12:30:00Z", "Cerrado, abre a las 16:00"],
      // Jueves 21:30 Madrid: cerrado, abre mañana
      ["2026-10-08T19:30:00Z", "Cerrado, abre mañana a las 10:00"],
      // Sábado 20:30 Madrid: cerrado, el domingo no abre, abre el lunes
      ["2026-10-10T18:30:00Z", "Cerrado, abre el lunes a las 10:00"],
      // Domingo 12:00 Madrid: abre mañana (lunes)
      ["2026-10-11T10:00:00Z", "Cerrado, abre mañana a las 10:00"],
      // Lunes 08:00 Madrid: abre hoy a las 10:00
      ["2026-10-12T06:00:00Z", "Cerrado, abre a las 10:00"],
    ];
    await page.clock.install({ time: new Date(cases[0][0]) });
    await page.goto("/");
    for (const [iso, expected] of cases) {
      await page.clock.setFixedTime(new Date(iso));
      await page.reload();
      await expect(status, iso).toHaveText(expected);
    }
  });
});

test.describe("teclado", () => {
  test("el primer Tab muestra el skip link y lleva al contenido", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Saltar al contenido" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#contenido-principal$/);
  });

  test("todos los elementos interactivos son alcanzables y muestran foco", async ({ page }) => {
    await page.goto("/");
    const seen = new Set<string>();
    for (let i = 0; i < 80; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const style = getComputedStyle(el);
        const visible = el.getBoundingClientRect().width > 0;
        return {
          key: `${[...document.querySelectorAll("*")].indexOf(el)}:${el.tagName}:${el.textContent?.trim().slice(0, 30)}`,
          visible,
          outline: style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2,
        };
      });
      if (!info) continue;
      if (seen.has(info.key)) break;
      seen.add(info.key);
      expect(info.visible, `elemento invisible con foco: ${info.key}`).toBe(true);
      expect(info.outline, `sin indicador de foco: ${info.key}`).toBe(true);
    }
    expect(seen.size).toBeGreaterThan(10);
  });

  test("el menú móvil se abre, se navega y se cierra con Escape", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "movil", "Solo móvil");
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Menú" });
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("navigation", { name: "Principal" }).last()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
  });
});