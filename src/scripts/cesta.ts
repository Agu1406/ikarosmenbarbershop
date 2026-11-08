/**
 * Cesta de esta pestaña. Solo guarda el identificador y la cantidad.
 * El precio lo pone el servidor al cobrar.
 */
const CLAVE = "cesta";
const MAX = 10;

export type Lineas = Record<string, number>;

export function leerCesta(): Lineas {
  try {
    const crudo = sessionStorage.getItem(CLAVE);
    if (!crudo) return {};
    const datos = JSON.parse(crudo) as Record<string, unknown>;
    const lineas: Lineas = {};
    for (const [id, qty] of Object.entries(datos)) {
      if (!/^\d{13}$/.test(id)) continue;
      const n = Number(qty);
      if (!Number.isInteger(n) || n < 1 || n > MAX) continue;
      lineas[id] = n;
    }
    return lineas;
  } catch {
    return {};
  }
}

export function guardarCesta(lineas: Lineas) {
  const limpias: Lineas = {};
  for (const [id, qty] of Object.entries(lineas)) {
    if (/^\d{13}$/.test(id) && Number.isInteger(qty) && qty >= 1 && qty <= MAX) limpias[id] = qty;
  }
  if (Object.keys(limpias).length === 0) sessionStorage.removeItem(CLAVE);
  else sessionStorage.setItem(CLAVE, JSON.stringify(limpias));
  document.dispatchEvent(new CustomEvent("cesta"));
}

export function anadir(id: string) {
  const lineas = leerCesta();
  lineas[id] = Math.min(MAX, (lineas[id] ?? 0) + 1);
  guardarCesta(lineas);
}

export function unidades(): number {
  return Object.values(leerCesta()).reduce((suma, n) => suma + n, 0);
}

function pintarCuenta() {
  const n = unidades();
  const etiqueta = n > 0 ? `Cesta, ${n} productos` : "Cesta";
  for (const el of document.querySelectorAll<HTMLElement>("[data-cesta-cuenta]")) {
    el.textContent = n > 0 ? String(n) : "";
    el.hidden = n === 0;
  }
  for (const el of document.querySelectorAll<HTMLElement>("[data-cesta-enlace]")) {
    el.setAttribute("aria-label", etiqueta);
  }
}

function marcarAnadidos() {
  const lineas = leerCesta();
  for (const boton of document.querySelectorAll<HTMLButtonElement>("[data-anadir]")) {
    const texto = boton.querySelector<HTMLElement>("[data-anadir-texto]");
    if (!texto || !boton.dataset.anadir) continue;
    texto.textContent = lineas[boton.dataset.anadir] ? "En la cesta" : "Añadir";
  }
}

function pintarCesta() {
  pintarCuenta();
  marcarAnadidos();
}

pintarCesta();
document.addEventListener("cesta", pintarCesta);

document.addEventListener("click", (event) => {
  const boton = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>("[data-anadir]");
  const id = boton?.dataset.anadir;
  if (!id) return;
  anadir(id);
});
