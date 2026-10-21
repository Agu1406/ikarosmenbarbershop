import { expect, test } from "@playwright/test";

// Nota: el Chromium de Playwright no incluye el códec H.264, así que no se puede
// comprobar la reproducción real. Se comprueba el comportamiento de los controles
// y qué se descarga en cada caso.

test.describe("vídeo de fondo", () => {
  test("con movimiento normal se pide el vídeo y hay botón de pausa operable con teclado", async ({
    page,
  }) => {
    const requested: string[] = [];
    page.on("request", (r) => {
      if (r.url().endsWith(".mp4")) requested.push(new URL(r.url()).pathname);
    });
    await page.goto("/");

    const toggle = page.locator("#inicio [data-video-toggle]");
    await expect(toggle).toBeVisible();
    await expect.poll(() => requested).toContain("/media/hero-barber.mp4");

    // El botón es alcanzable y su estado coincide con el vídeo.
    await toggle.focus();
    await expect(toggle).toBeFocused();
    const state = async () => ({
      pressed: await toggle.getAttribute("aria-pressed"),
      paused: await page.locator("#inicio video").evaluate((v: HTMLVideoElement) => v.paused),
    });
    await expect.poll(async () => (await state()).pressed === String((await state()).paused)).toBe(
      true,
    );
    await page.keyboard.press("Enter");
    await expect.poll(async () => (await state()).pressed === String((await state()).paused)).toBe(
      true,
    );
  });

  test("con prefers-reduced-motion no arranca solo y no se descarga el vídeo", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const requested: string[] = [];
    page.on("request", (r) => {
      if (r.url().endsWith(".mp4")) requested.push(r.url());
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const toggle = page.locator("#inicio [data-video-toggle]");
    await expect(toggle).toHaveText("Reproducir vídeo de fondo");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(await page.locator("#inicio video").evaluate((v: HTMLVideoElement) => v.paused)).toBe(
      true,
    );
    expect(requested).toEqual([]);
  });

  test("el vídeo de Nosotros no se descarga hasta acercarse", async ({ page }) => {
    const requested: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("about-barber.mp4")) requested.push(r.url());
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(requested).toEqual([]);

    await page.locator("#sobre-nosotros").scrollIntoViewIfNeeded();
    await expect.poll(() => requested.length).toBeGreaterThan(0);
  });

  test("el vídeo decorativo está oculto a lectores de pantalla y fuera del tabulador", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator(".hero-media")).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator("#inicio video")).toHaveAttribute("tabindex", "-1");
    await expect(page.locator("[data-about-video] video")).toHaveAttribute("aria-hidden", "true");
  });
});

test.describe("entrada al scroll", () => {
  test("lo que está bajo la pantalla se oculta y aparece al llegar", async ({ page }) => {
    await page.goto("/");
    const title = page.locator("#opiniones-title");
    await expect(page.locator("#opiniones .section-head")).toHaveClass(/reveal-ready/);
    await title.scrollIntoViewIfNeeded();
    await expect(page.locator("#opiniones .section-head")).toHaveClass(/is-revealed/);
    await expect(title).toBeVisible();
  });

  test("con prefers-reduced-motion nada queda oculto", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator(".reveal-ready")).toHaveCount(0);
  });

  test.describe("sin JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("todo el contenido es visible", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator(".reveal-ready")).toHaveCount(0);
      for (const id of ["servicios-title", "about-title", "opiniones-title", "contacto-title"]) {
        await expect(page.locator(`#${id}`)).toBeVisible();
        expect(
          await page.locator(`#${id}`).evaluate((el) => getComputedStyle(el.parentElement!).opacity),
        ).toBe("1");
      }
    });
  });
});

test.describe("navegación", () => {
  test("scroll-spy marca con aria-current la sección visible", async ({ page }) => {
    await page.goto("/");
    await page.locator("#servicios").scrollIntoViewIfNeeded();
    await page.evaluate(() => document.getElementById("servicios")!.scrollIntoView());
    await expect(page.locator('nav a[aria-current="true"]').first()).toHaveAttribute(
      "href",
      "/#servicios",
    );

    await page.evaluate(() => document.getElementById("contacto")!.scrollIntoView());
    await expect(page.locator('nav a[aria-current="true"]').first()).toHaveAttribute(
      "href",
      "/#contacto",
    );
  });

  test("los grupos de la carta llevan icono decorativo sin peticiones externas", async ({
    page,
  }) => {
    await page.goto("/");
    const icons = page.locator(".menu-group h3 svg");
    await expect(icons).toHaveCount(4);
    await expect(icons.first()).toHaveAttribute("aria-hidden", "true");
  });
});
