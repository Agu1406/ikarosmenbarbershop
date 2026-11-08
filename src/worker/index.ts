/**
 * Cobro en el mismo Worker que publica la web.
 * Secretos (nunca en git): STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY.
 * El correo sale de un dominio verificado en Resend. PEDIDOS_FROM lo cambia si hace falta.
 * El mensajero no se llama desde aquí: el local lo pide en el panel, y solo en horario.
 */
import { LEGAL } from "../lib/data";
import { getOpenStatus } from "../lib/hours";
import { euro, validarPedido, type DatosCompra, type PedidoValido } from "../lib/shop";

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  RESEND_API_KEY?: string;
  PEDIDOS_FROM?: string;
}

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "x-content-type-options": "nosniff",
  "cache-control": "no-store",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/checkout" && request.method === "POST") {
      return checkout(request, env);
    }
    if (url.pathname === "/api/stripe" && request.method === "POST") {
      return webhook(request, env);
    }
    if (url.pathname === "/api/pedido" && request.method === "GET") {
      return resumen(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};

function mismoOrigen(request: Request): boolean {
  const aqui = new URL(request.url).origin;
  const origin = request.headers.get("origin");
  if (origin) return origin === aqui;
  const referer = request.headers.get("referer");
  if (!referer) return false;
  try {
    return new URL(referer).origin === aqui;
  } catch {
    return false;
  }
}

function quiereJson(request: Request): boolean {
  return (request.headers.get("accept") ?? "").includes("application/json");
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function escapar(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function pagina(titulo: string, texto: string, status: number): Response {
  const html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>${escapar(titulo)}</title>
<body style="font-family:Georgia,serif;background:#182c48;color:#eae4d8;padding:2rem">
<h1>${escapar(titulo)}</h1><p>${escapar(texto)}</p>
<p><a style="color:#c5a059" href="/productos">Volver a los productos</a></p></body>`;
  return new Response(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

function fallo(request: Request, texto: string, status: number): Response {
  return quiereJson(request) ? json({ error: texto }, status) : pagina("No se ha podido cobrar", texto, status);
}

async function leerDatos(request: Request): Promise<DatosCompra | null> {
  const tipo = request.headers.get("content-type") ?? "";
  let campos: FormData;
  try {
    if (tipo.includes("application/json")) {
      const body = (await request.json()) as Record<string, unknown>;
      campos = new FormData();
      for (const [key, value] of Object.entries(body)) {
        if (typeof value === "string" || typeof value === "number") campos.set(key, String(value));
      }
    } else {
      campos = await request.formData();
    }
  } catch {
    return null;
  }

  const cantidades: Record<string, number> = {};
  for (const [key, value] of campos) {
    if (!key.startsWith("qty_") || typeof value !== "string") continue;
    if (value.trim() === "") continue;
    cantidades[key.slice(4)] = Number(value);
  }

  return {
    nombre: String(campos.get("nombre") ?? ""),
    email: String(campos.get("email") ?? ""),
    telefono: String(campos.get("telefono") ?? ""),
    direccion: String(campos.get("direccion") ?? ""),
    cp: String(campos.get("cp") ?? ""),
    acepto: String(campos.get("acepto") ?? ""),
    cantidades,
  };
}

const TOPE_PEDIDO = 16_000;

async function cuerpoAcotado(request: Request): Promise<ArrayBuffer | "grande"> {
  const anunciado = Number(request.headers.get("content-length") ?? "");
  if (Number.isFinite(anunciado) && anunciado > TOPE_PEDIDO) return "grande";
  const reader = request.body?.getReader();
  if (!reader) return new ArrayBuffer(0);
  const partes: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > TOPE_PEDIDO) {
      await reader.cancel();
      return "grande";
    }
    partes.push(value);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const parte of partes) {
    out.set(parte, offset);
    offset += parte.byteLength;
  }
  return out.buffer;
}

async function checkout(request: Request, env: Env): Promise<Response> {
  if (!mismoOrigen(request)) return fallo(request, "La petición no viene de esta web.", 403);
  const crudo = await cuerpoAcotado(request);
  if (crudo === "grande") return fallo(request, "El pedido es demasiado grande.", 413);
  const datos = await leerDatos(new Request(request.url, { method: "POST", headers: request.headers, body: crudo }));
  if (!datos) return fallo(request, "No se ha podido leer el pedido.", 400);

  const resultado = validarPedido(datos);
  if (!resultado.ok) return fallo(request, resultado.error, 400);

  if (!env.STRIPE_SECRET_KEY) {
    return fallo(request, "El pago en la web todavía no está activo. Puedes llamar al 915 15 28 44.", 503);
  }

  const origin = new URL(request.url).origin;
  const creada = await crearSesion(env.STRIPE_SECRET_KEY, resultado.pedido, origin, claveIdempotente(request));
  if (!creada.ok) return fallo(request, creada.error, 502);

  if (quiereJson(request)) return json({ url: creada.url });
  return Response.redirect(creada.url, 303);
}

function claveIdempotente(request: Request): string | undefined {
  const header = request.headers.get("idempotency-key") ?? "";
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(header)) return header;
  return undefined;
}

async function stripe(
  secret: string,
  path: string,
  init: RequestInit & { idempotency?: string; expand?: string[] } = {},
): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; error: string }> {
  const headers = new Headers(init.headers);
  headers.set("authorization", `Bearer ${secret}`);
  if (init.idempotency) headers.set("idempotency-key", init.idempotency);
  const url = new URL(`https://api.stripe.com/v1/${path}`);
  for (const campo of init.expand ?? []) url.searchParams.append("expand[]", campo);
  let data: { error?: { message?: string } };
  try {
    const response = await fetch(url, { method: init.method, headers, body: init.body });
    data = (await response.json()) as { error?: { message?: string } };
    if (!response.ok) return { ok: false, error: data.error?.message ?? "Stripe no ha aceptado el cobro." };
  } catch {
    return { ok: false, error: "Stripe no ha respondido." };
  }
  return { ok: true, data: data as Record<string, unknown> };
}

interface LineaStripe {
  description?: string;
  quantity?: number;
  amount_total?: number;
}

function lineasDe(data: Record<string, unknown>): LineaStripe[] {
  const lineas = data.line_items as { data?: LineaStripe[] } | undefined;
  return lineas?.data ?? [];
}

function paramsSesion(pedido: PedidoValido, origin: string, metodos: string[]): URLSearchParams {
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("locale", "es");
  params.set("customer_email", pedido.email);
  params.set("success_url", `${origin}/pedido?session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${origin}/pago-cancelado`);
  params.set("payment_intent_data[receipt_email]", pedido.email);
  params.set("payment_intent_data[shipping][name]", pedido.nombre);
  params.set("payment_intent_data[shipping][phone]", pedido.telefono);
  params.set("payment_intent_data[shipping][address][line1]", pedido.direccion);
  params.set("payment_intent_data[shipping][address][postal_code]", pedido.cp);
  params.set("payment_intent_data[shipping][address][city]", "Madrid");
  params.set("payment_intent_data[shipping][address][country]", "ES");
  params.set("metadata[telefono]", pedido.telefono);
  params.set("metadata[nombre]", pedido.nombre);
  params.set("metadata[direccion]", pedido.direccion);
  params.set("metadata[cp]", pedido.cp);
  const resumen = pedido.lineas.map((linea) => `${linea.qty} x ${linea.name}, ${linea.size}`).join("\n");
  params.set("metadata[resumen]", resumen.slice(0, 500));
  if (resumen.length > 500) params.set("metadata[resumen2]", resumen.slice(500, 1000));
  metodos.forEach((metodo, i) => params.set(`payment_method_types[${i}]`, metodo));

  pedido.lineas.forEach((linea, i) => {
    params.set(`line_items[${i}][quantity]`, String(linea.qty));
    params.set(`line_items[${i}][price_data][currency]`, "eur");
    params.set(`line_items[${i}][price_data][unit_amount]`, String(linea.unitAmount));
    params.set(`line_items[${i}][price_data][product_data][name]`, `${linea.name} STMNT, ${linea.size}`);
  });
  const envio = pedido.lineas.length;
  params.set(`line_items[${envio}][quantity]`, "1");
  params.set(`line_items[${envio}][price_data][currency]`, "eur");
  params.set(`line_items[${envio}][price_data][unit_amount]`, String(pedido.envio));
  params.set(`line_items[${envio}][price_data][product_data][name]`, "Envío en Madrid");
  return params;
}

async function crearSesion(
  secret: string,
  pedido: PedidoValido,
  origin: string,
  idempotency: string | undefined,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const intentar = (metodos: string[], claveExtra: string) =>
    stripe(secret, "checkout/sessions", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: paramsSesion(pedido, origin, metodos)
        .toString()
        .replaceAll("%7BCHECKOUT_SESSION_ID%7D", "{CHECKOUT_SESSION_ID}"),
      idempotency: idempotency ? `${idempotency}-${claveExtra}` : undefined,
    });

  let creada = await intentar(["card", "bizum"], "bizum");
  if (!creada.ok && /bizum/i.test(creada.error)) creada = await intentar(["card"], "tarjeta");
  if (!creada.ok) {
    console.error(creada.error);
    return { ok: false, error: "No se ha podido abrir el pago. Llama al 915 15 28 44." };
  }

  const url = creada.data.url;
  if (typeof url !== "string") return { ok: false, error: "Stripe no ha devuelto la página de pago." };
  return { ok: true, url };
}

async function resumen(request: Request, env: Env): Promise<Response> {
  if (!env.STRIPE_SECRET_KEY) return json({ error: "El pago todavía no está activo." }, 503);
  const id = new URL(request.url).searchParams.get("session_id") ?? "";
  if (!/^cs_(?:test|live)_[A-Za-z0-9]+$/.test(id)) return json({ error: "No hay un pago que mostrar." }, 400);

  const sesion = await stripe(env.STRIPE_SECRET_KEY, `checkout/sessions/${id}`, { expand: ["line_items"] });
  if (!sesion.ok) return json({ error: "No se ha encontrado el pago." }, 404);

  const data = sesion.data;
  const meta = (data.metadata ?? {}) as Record<string, string>;
  const lineas = lineasDe(data).map((linea) => ({
    nombre: linea.description ?? "Producto",
    cantidad: linea.quantity ?? 1,
    importe: euro(linea.amount_total ?? 0),
  }));

  return json({
    pagado: data.payment_status === "paid",
    total: euro(typeof data.amount_total === "number" ? data.amount_total : 0),
    lineas,
    nombre: meta.nombre ?? "",
    direccion: meta.direccion ?? "",
    cp: meta.cp ?? "",
    ciudad: "Madrid",
  });
}

async function webhook(request: Request, env: Env): Promise<Response> {
  if (!env.STRIPE_WEBHOOK_SECRET || !env.STRIPE_SECRET_KEY) {
    return new Response("Faltan las claves de Stripe.", { status: 503 });
  }
  const body = await request.text();
  const firma = request.headers.get("stripe-signature") ?? "";
  if (!(await firmaValida(body, firma, env.STRIPE_WEBHOOK_SECRET))) {
    return new Response("Firma no válida.", { status: 400 });
  }

  let event: { type?: string; data?: { object?: { id?: string; payment_status?: string } } };
  try {
    event = JSON.parse(body) as typeof event;
  } catch {
    return new Response("Cuerpo no válido.", { status: 400 });
  }
  const tipo = event.type ?? "";
  const sesionId = event.data?.object?.id ?? "";
  const estado = event.data?.object?.payment_status;
  const avisar =
    (tipo === "checkout.session.completed" && estado === "paid") ||
    tipo === "checkout.session.async_payment_succeeded";
  if (!avisar) return new Response("ok");
  if (!sesionId.startsWith("cs_")) return new Response("ok");

  const aviso = await avisarUnaVez(env, sesionId);
  if (!aviso.ok) return new Response(aviso.error, { status: 500 });
  return new Response("ok");
}

async function firmaValida(body: string, header: string, secret: string): Promise<boolean> {
  const trozos = header.split(",").map((parte) => parte.split("="));
  const marca = trozos.find(([clave]) => clave === "t")?.[1];
  const firmas = trozos.filter(([clave]) => clave === "v1").map(([, valor]) => valor);
  if (!marca || firmas.length === 0) return false;
  const edad = Math.abs(Date.now() / 1000 - Number(marca));
  if (!Number.isFinite(edad) || edad > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${marca}.${body}`));
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return firmas.some((firma) => firma.length === hex.length && igual(firma, hex));
}

function igual(a: string, b: string): boolean {
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function avisarUnaVez(env: Env, sesionId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const sesion = await stripe(env.STRIPE_SECRET_KEY!, `checkout/sessions/${sesionId}`, {
    expand: ["payment_intent", "line_items"],
  });
  if (!sesion.ok) return { ok: false, error: "No se ha podido leer el pago." };

  const pago = sesion.data.payment_intent as { id?: string; metadata?: Record<string, string> } | string | null;
  const pagoId = typeof pago === "string" ? pago : pago?.id;
  const meta = typeof pago === "object" && pago ? (pago.metadata ?? {}) : {};
  if (meta.pedido_avisado === "1") return { ok: true };
  if (!pagoId) return { ok: false, error: "El pago no tiene identificador." };

  const texto = textoPedido(sesion.data);
  const enviado = await enviarCorreo(env, `Pedido STMNT ${sesionId}`, texto);
  if (!enviado.ok) return enviado;

  const marca = new URLSearchParams();
  marca.set("metadata[pedido_avisado]", "1");
  marca.set("metadata[pedido_sesion]", sesionId);
  const guardado = await stripe(env.STRIPE_SECRET_KEY!, `payment_intents/${pagoId}`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: marca,
  });
  if (!guardado.ok) return { ok: false, error: "El aviso salió, pero no se ha marcado el pedido." };
  return { ok: true };
}

function textoPedido(data: Record<string, unknown>): string {
  const meta = (data.metadata ?? {}) as Record<string, string>;
  const pago = data.payment_intent as { shipping?: { phone?: string } } | string | null;
  const telefono = (typeof pago === "object" && pago?.shipping?.phone) || meta.telefono || "";
  const lineas =
    lineasDe(data)
      .map((linea) => `${linea.quantity ?? 1} × ${linea.description ?? "Producto"} (${euro(linea.amount_total ?? 0)})`)
      .join("\n") || [meta.resumen, meta.resumen2].filter(Boolean).join("");
  const estado = getOpenStatus();
  const mensajero = estado.open
    ? `La barbería está abierta. Pide el mensajero ahora en el panel de Uber Direct o Glovo On-Demand. ${estado.label}.`
    : `No pidas el mensajero ahora. ${estado.label}. El reparto espera a la apertura.`;

  return [
    "Hay un pedido pagado en la web.",
    "",
    lineas,
    `Total: ${euro(typeof data.amount_total === "number" ? data.amount_total : 0)}`,
    "",
    `Nombre: ${meta.nombre ?? ""}`,
    `Teléfono: ${telefono}`,
    `Correo: ${typeof data.customer_email === "string" ? data.customer_email : ""}`,
    `Dirección: ${meta.direccion ?? ""}, ${meta.cp ?? ""} Madrid`,
    "",
    mensajero,
    "El mensajero no sale solo. Hasta tener el contrato, se pide a mano. José no hace el trayecto.",
    "Si no hay stock, devuelve el dinero desde Stripe.",
  ].join("\n");
}

async function enviarCorreo(
  env: Env,
  asunto: string,
  texto: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!LEGAL.email) return { ok: false, error: "Falta el correo del local." };
  if (!env.RESEND_API_KEY) return { ok: false, error: "Falta RESEND_API_KEY. El pedido está pagado y no se ha avisado." };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.PEDIDOS_FROM ?? "Ikaro Men's Barber <pedidos@ikaromenbarbershop.es>",
      to: [LEGAL.email],
      subject: asunto,
      text: texto,
    }),
  });
  if (!response.ok) return { ok: false, error: "No se ha podido avisar al local." };
  return { ok: true };
}
