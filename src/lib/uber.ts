/**
 * Uber Direct: quote + create delivery.
 * Secretos (Cloudflare, nunca en git): UBER_CUSTOMER_ID, UBER_CLIENT_ID, UBER_CLIENT_SECRET.
 * @see https://developer.uber.com/docs/deliveries/get-started
 */
import { ADDRESS, CONTACT, SITE } from "./data";

export interface UberEnv {
  UBER_CUSTOMER_ID?: string;
  UBER_CLIENT_ID?: string;
  UBER_CLIENT_SECRET?: string;
}

export interface UberDestino {
  nombre: string;
  telefono: string;
  direccion: string;
  cp: string;
}

export interface UberLinea {
  name: string;
  quantity: number;
}

export interface UberRepartoOk {
  ok: true;
  deliveryId: string;
  trackingUrl: string;
  feeCentimos: number;
  scheduled: boolean;
}

export interface UberRepartoError {
  ok: false;
  error: string;
}

export function uberConfigurado(env: UberEnv): boolean {
  return Boolean(env.UBER_CUSTOMER_ID && env.UBER_CLIENT_ID && env.UBER_CLIENT_SECRET);
}

function direccionEstructurada(calle: string, ciudad: string, cp: string): string {
  return JSON.stringify({
    street_address: [calle],
    city: ciudad,
    state: "Madrid",
    zip_code: cp,
    country: "ES",
  });
}

const recogida = () =>
  direccionEstructurada(ADDRESS.street, ADDRESS.city, ADDRESS.postalCode);

async function tokenUber(env: UberEnv): Promise<string | null> {
  const response = await fetch("https://auth.uber.com/oauth/v2/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.UBER_CLIENT_ID!,
      client_secret: env.UBER_CLIENT_SECRET!,
      grant_type: "client_credentials",
      scope: "eats.deliveries",
    }),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { access_token?: string };
  return typeof data.access_token === "string" ? data.access_token : null;
}

async function uberPost(
  env: UberEnv,
  token: string,
  path: string,
  body: Record<string, unknown>,
): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; error: string }> {
  const response = await fetch(`https://api.uber.com/v1/customers/${env.UBER_CUSTOMER_ID}${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  let data: Record<string, unknown> = {};
  try {
    data = (await response.json()) as Record<string, unknown>;
  } catch {
    /* cuerpo vacío */
  }
  if (!response.ok) {
    const mensaje =
      (typeof data.message === "string" && data.message) ||
      (typeof data.code === "string" && data.code) ||
      `Uber respondió ${response.status}`;
    return { ok: false, error: mensaje };
  }
  return { ok: true, data };
}

/** Quote de tarifa entre el local y un destino (centimos). Para afinar ENVIO_MADRID_CENTIMOS. */
export async function cotizarEnvio(
  env: UberEnv,
  destino: UberDestino,
): Promise<{ ok: true; feeCentimos: number; quoteId: string } | { ok: false; error: string }> {
  if (!uberConfigurado(env)) return { ok: false, error: "Faltan las claves de Uber Direct." };
  const token = await tokenUber(env);
  if (!token) return { ok: false, error: "Uber no ha dado el token." };

  const dropoff = direccionEstructurada(destino.direccion, "Madrid", destino.cp);
  const quote = await uberPost(env, token, "/delivery_quotes", {
    pickup_address: recogida(),
    pickup_latitude: ADDRESS.lat,
    pickup_longitude: ADDRESS.lng,
    dropoff_address: dropoff,
  });
  if (!quote.ok) return quote;
  const fee = quote.data.fee;
  const id = quote.data.id;
  if (typeof fee !== "number" || typeof id !== "string") {
    return { ok: false, error: "Uber no ha devuelto la tarifa." };
  }
  return { ok: true, feeCentimos: fee, quoteId: id };
}

/**
 * Crea el reparto. Si `pickupReady` es futuro, Uber programa la recogida
 * (local cerrado → apertura siguiente).
 */
export async function crearReparto(
  env: UberEnv,
  destino: UberDestino,
  lineas: UberLinea[],
  opts: { externalId: string; pickupReady: Date; scheduled: boolean },
): Promise<UberRepartoOk | UberRepartoError> {
  if (!uberConfigurado(env)) return { ok: false, error: "Faltan las claves de Uber Direct." };
  const token = await tokenUber(env);
  if (!token) return { ok: false, error: "Uber no ha dado el token." };

  const dropoff = direccionEstructurada(destino.direccion, "Madrid", destino.cp);
  const quote = await uberPost(env, token, "/delivery_quotes", {
    pickup_address: recogida(),
    pickup_latitude: ADDRESS.lat,
    pickup_longitude: ADDRESS.lng,
    dropoff_address: dropoff,
  });
  if (!quote.ok) return quote;
  const quoteId = quote.data.id;
  if (typeof quoteId !== "string") return { ok: false, error: "Uber no ha dado quote_id." };

  const ready = opts.pickupReady;
  const deadline = new Date(ready.getTime() + 60 * 60_000);
  const dropoffReady = ready;
  const dropoffDeadline = new Date(ready.getTime() + 4 * 60 * 60_000);

  const body: Record<string, unknown> = {
    quote_id: quoteId,
    pickup_name: SITE.name,
    pickup_business_name: SITE.name,
    pickup_address: recogida(),
    pickup_phone_number: CONTACT.phoneE164,
    pickup_latitude: ADDRESS.lat,
    pickup_longitude: ADDRESS.lng,
    dropoff_name: destino.nombre,
    dropoff_address: dropoff,
    dropoff_phone_number: destino.telefono,
    manifest_items: lineas.map((linea) => ({
      name: linea.name.slice(0, 100),
      quantity: linea.quantity,
      size: "small",
    })),
    external_id: opts.externalId.slice(0, 255),
  };

  if (opts.scheduled || ready.getTime() > Date.now() + 5 * 60_000) {
    body.pickup_ready_dt = ready.toISOString();
    body.pickup_deadline_dt = deadline.toISOString();
    body.dropoff_ready_dt = dropoffReady.toISOString();
    body.dropoff_deadline_dt = dropoffDeadline.toISOString();
  }

  const delivery = await uberPost(env, token, "/deliveries", body);
  if (!delivery.ok) return delivery;

  const id = delivery.data.id;
  const tracking = delivery.data.tracking_url;
  const fee = typeof delivery.data.fee === "number" ? delivery.data.fee : typeof quote.data.fee === "number" ? quote.data.fee : 0;
  if (typeof id !== "string") return { ok: false, error: "Uber no ha dado el id del reparto." };

  return {
    ok: true,
    deliveryId: id,
    trackingUrl: typeof tracking === "string" ? tracking : "",
    feeCentimos: fee,
    scheduled: opts.scheduled,
  };
}
