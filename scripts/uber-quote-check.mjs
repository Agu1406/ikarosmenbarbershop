/**
 * Mide tarifas Uber Direct Las Rozas → destinos Madrid y sugiere ENVIO_MADRID_CENTIMOS.
 * Uso: npx tsx --env-file=.dev.vars scripts/uber-quote-check.mjs
 */
const ENVIO_ACTUAL = 899;
const euro = (c) => `${Math.floor(c / 100)},${String(Math.abs(c % 100)).padStart(2, "0")} €`;

const destinos = [
  { nombre: "Sol", telefono: "+34600000000", direccion: "Puerta del Sol 1", cp: "28013" },
  { nombre: "Chamberí", telefono: "+34600000000", direccion: "Calle de Fuencarral 80", cp: "28004" },
  { nombre: "Salamanca", telefono: "+34600000000", direccion: "Calle de Serrano 45", cp: "28001" },
  { nombre: "Usera", telefono: "+34600000000", direccion: "Avenida de Córdoba 15", cp: "28026" },
];

const pickup = {
  street_address: ["Calle Severo Ochoa, 8, Loc 6"],
  city: "Las Rozas de Madrid",
  state: "Madrid",
  zip_code: "28232",
  country: "ES",
};
const pickupLat = 40.520925;
const pickupLng = -3.8960034;

const customerId = process.env.UBER_CUSTOMER_ID;
const clientId = process.env.UBER_CLIENT_ID;
const clientSecret = process.env.UBER_CLIENT_SECRET;

if (!customerId || !clientId || !clientSecret) {
  console.log("Sin UBER_CUSTOMER_ID / UBER_CLIENT_ID / UBER_CLIENT_SECRET.");
  console.log(`Copia .dev.vars.example → .dev.vars y rellena las claves del panel Uber Direct.`);
  console.log(`Envío cobrado al cliente ahora: ${euro(ENVIO_ACTUAL)} (src/lib/shop.ts).`);
  console.log("Hasta medir quotes reales, 8,99 € cubre mejor el trayecto Las Rozas → Madrid que 5,99 €.");
  process.exit(0);
}

async function token() {
  const response = await fetch("https://auth.uber.com/oauth/v2/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
      scope: "eats.deliveries",
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message ?? `token ${response.status}`);
  return data.access_token;
}

async function quote(access, destino) {
  const dropoff = {
    street_address: [destino.direccion],
    city: "Madrid",
    state: "Madrid",
    zip_code: destino.cp,
    country: "ES",
  };
  const response = await fetch(`https://api.uber.com/v1/customers/${customerId}/delivery_quotes`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${access}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      pickup_address: JSON.stringify(pickup),
      pickup_latitude: pickupLat,
      pickup_longitude: pickupLng,
      dropoff_address: JSON.stringify(dropoff),
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message ?? data.code ?? `quote ${response.status}`);
  return data;
}

const access = await token();
const fees = [];
for (const destino of destinos) {
  try {
    const q = await quote(access, destino);
    fees.push(q.fee);
    console.log(`${destino.nombre} (${destino.cp}): ${euro(q.fee)} (quote ${q.id})`);
  } catch (err) {
    console.log(`${destino.nombre} (${destino.cp}): error ${err.message}`);
  }
}

if (fees.length === 0) {
  console.error("No se ha podido cotizar ningún destino.");
  process.exit(1);
}

const max = Math.max(...fees);
const sugerido = Math.ceil((max * 1.1) / 100) * 100;
console.log("");
console.log(`Máximo medido: ${euro(max)}. Envío actual al cliente: ${euro(ENVIO_ACTUAL)}.`);
console.log(
  sugerido > ENVIO_ACTUAL
    ? `Sugerencia: subir ENVIO_MADRID_CENTIMOS a ${sugerido} (${euro(sugerido)}) en src/lib/shop.ts.`
    : `La tarifa fija ${euro(ENVIO_ACTUAL)} cubre las cotizaciones (con ~10 % sobre el máximo).`,
);
