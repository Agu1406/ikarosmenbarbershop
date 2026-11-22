/**
 * Venta de STMNT. Los importes salen solo del catálogo.
 * El navegador no puede fijar un precio.
 */
import catalog from "../data/stmnt.json";

/**
 * Tarifa única de envío a CP de Madrid ciudad, visible antes de pagar.
 * Recogida en Las Rozas: el suelo público de Uber Direct (~5,20 €) no basta para ese trayecto.
 * Ajustar con `node --env-file=.dev.vars scripts/uber-quote-check.mjs` cuando haya claves.
 */
export const ENVIO_MADRID_CENTIMOS = 899;

export const CANTIDAD_MAX = 10;

export interface ProductoCatalogo {
  id: string;
  name: string;
  size: string;
  price: string;
}

export interface LineaPedido {
  id: string;
  name: string;
  size: string;
  qty: number;
  unitAmount: number;
}

export interface DatosCompra {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  cp: string;
  acepto: string;
  cantidades: Record<string, number>;
}

export interface PedidoValido {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  cp: string;
  lineas: LineaPedido[];
  envio: number;
  total: number;
}

export function euro(centimos: number): string {
  const euros = Math.floor(centimos / 100);
  const cents = Math.abs(centimos % 100);
  return `${euros},${String(cents).padStart(2, "0")} €`;
}

export function eurosACentimos(price: string): number {
  const match = price.match(/^(\d+),(\d{2}) €$/);
  if (!match) throw new Error(`Precio de catálogo mal puesto: ${price}`);
  return Number(match[1]) * 100 + Number(match[2]);
}

export function productosCatalogo(): ProductoCatalogo[] {
  return catalog.groups.flatMap((group) => group.items);
}

/** Ciudad de Madrid. Las Rozas y el resto de la comunidad quedan fuera. */
export function esCodigoMadrid(cp: string): boolean {
  if (!/^\d{5}$/.test(cp)) return false;
  const n = Number(cp);
  if (n >= 28001 && n <= 28055) return true;
  return n === 28070 || n === 28071 || n === 28080;
}

function limpio(value: string, max: number): string {
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

export function validarPedido(datos: DatosCompra): { ok: true; pedido: PedidoValido } | { ok: false; error: string } {
  const catalogo = new Map(productosCatalogo().map((item) => [item.id, item]));
  const lineas: LineaPedido[] = [];

  for (const [id, qty] of Object.entries(datos.cantidades)) {
    if (!Number.isInteger(qty) || qty < 0 || qty > CANTIDAD_MAX) {
      return { ok: false, error: "La cantidad no es válida." };
    }
    if (qty === 0) continue;
    const item = catalogo.get(id);
    if (!item) return { ok: false, error: "Ese producto no está en el catálogo." };
    lineas.push({
      id,
      name: item.name,
      size: item.size,
      qty,
      unitAmount: eurosACentimos(item.price),
    });
  }

  if (lineas.length === 0) return { ok: false, error: "Elige al menos un producto." };

  const nombre = limpio(datos.nombre, 80);
  if (nombre.length < 2) return { ok: false, error: "Escribe tu nombre." };

  const email = datos.email.trim().toLowerCase();
  if (email.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "El correo no es válido." };
  }

  const crudo = datos.telefono.replace(/[^\d+]/g, "");
  if (!/^(?:\+34)?[6-9]\d{8}$/.test(crudo)) {
    return { ok: false, error: "El teléfono no es válido. Usa un móvil de España." };
  }
  const telefono = crudo.startsWith("+34") ? crudo : `+34${crudo}`;

  const direccion = limpio(datos.direccion, 120);
  if (direccion.length < 5) return { ok: false, error: "Escribe la calle y el número." };

  const cp = datos.cp.trim();
  if (!esCodigoMadrid(cp)) {
    return { ok: false, error: "De momento solo enviamos a la ciudad de Madrid." };
  }

  if (datos.acepto !== "si") {
    return { ok: false, error: "Hay que aceptar las condiciones de compra y desistimiento." };
  }

  const productos = lineas.reduce((sum, linea) => sum + linea.unitAmount * linea.qty, 0);
  return {
    ok: true,
    pedido: {
      nombre,
      email,
      telefono,
      direccion,
      cp,
      lineas,
      envio: ENVIO_MADRID_CENTIMOS,
      total: productos + ENVIO_MADRID_CENTIMOS,
    },
  };
}
