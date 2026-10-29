/**
 * Única fuente de verdad del negocio. Ver CONTEXT.md para el origen de cada dato.
 * Cualquier cambio de precios, horario o contacto se hace solo aquí.
 */
import legal from "../data/legal.json";
import stmntCatalog from "../data/stmnt.json";

export const SITE = {
  name: "Ikaro Men's Barber",
  shortName: "Ikaro",
  tagline: "Barbería de caballeros en Las Rozas",
  description:
    "Barbería de caballeros en Calle Severo Ochoa 8, Las Rozas. Cortes, barba y afeitado tradicional. Reserva online en Booksy.",
  locale: "es_ES",
  claim: "Cortes, barba y el trato de siempre.",
} as const;

export const CONTACT = {
  phoneDisplay: "697 27 04 34",
  phoneHref: "tel:+34697270434",
  phoneE164: "+34697270434",
  whatsapp: "https://wa.me/34697270434",
  booksy:
    "https://booksy.com/es-es/169010_ikaro-men-s-barber_barberia_39013_las-rozas-de-madrid",
  /** Calendario de la ficha 169010. Se carga al pulsar Reservar, no al abrir la web. */
  booksyWidget:
    "https://booksy.com/widget/index.html?id=169010&lang=es&country=es&mode=dialog&theme=default",
  googleReviews:
    "https://www.google.com/maps/search/?api=1&query=Ikaro+Men%27s+Barber+Calle+Severo+Ochoa+8+Las+Rozas",
} as const;

export const ADDRESS = {
  street: "Calle Severo Ochoa, 8, Loc 6",
  postalCode: "28232",
  city: "Las Rozas de Madrid",
  region: "Madrid",
  country: "ES",
  lat: 40.5213568,
  lng: -3.8969313,
  full: "Calle Severo Ochoa, 8, Loc 6, 28232 Las Rozas de Madrid, Madrid",
  mapsLink:
    "https://www.google.com/maps/search/?api=1&query=40.5213568,-3.8969313",
  mapsEmbed:
    "https://maps.google.com/maps?q=40.5213568,-3.8969313&ll=40.5213568,-3.8969313&z=18&hl=es&output=embed",
} as const;

/**
 * VERIFICAR antes de publicar: las notas cambian con el tiempo.
 * Son datos de las fichas públicas de Google y Booksy (ver CONTEXT.md).
 */
export const RATINGS = [
  {
    source: "Google",
    score: "4,9",
    count: 47,
    url: CONTACT.googleReviews,
  },
  {
    source: "Booksy",
    score: "5,0",
    count: 43,
    url: CONTACT.booksy,
  },
] as const;

/** Franja: [hora inicio, minuto inicio, hora fin, minuto fin]. */
export type Slot = readonly [number, number, number, number];

export const HOURS: Record<number, readonly Slot[]> = {
  0: [],
  1: [[10, 0, 14, 0], [16, 0, 21, 0]],
  2: [[10, 0, 14, 0], [16, 0, 21, 0]],
  3: [[10, 0, 14, 0], [16, 0, 21, 0]],
  4: [[10, 0, 14, 0], [16, 0, 21, 0]],
  5: [[10, 0, 14, 0], [16, 0, 21, 0]],
  6: [[10, 0, 14, 0], [16, 0, 20, 0]],
};

/** Texto mostrado en la web (coherente con HOURS). */
export const HOURS_DISPLAY = [
  { days: "Lunes a viernes", hours: "10:00 a 14:00 y de 16:00 a 21:00" },
  { days: "Sábado", hours: "10:00 a 14:00 y de 16:00 a 20:00" },
  { days: "Domingo", hours: "Cerrado" },
] as const;

export const TEAM = [
  { name: "José Sotelo", role: "Fundador" },
  { name: "Miguel", role: "Peluquero" },
  { name: "Alex", role: "Peluquero" },
] as const;

export const AMENITIES = [
  "Plaza de aparcamiento",
  "Tarjetas de crédito",
  "Acceso adaptado",
  "Adaptado para niños",
  "Wi-Fi",
  "Programa de fidelidad",
] as const;

export interface Service {
  name: string;
  /** Texto de precio tal cual se muestra. */
  price: string;
  duration: string;
  note?: string;
}

export interface ServiceGroup {
  title: string;
  /** Nombre de icono Phosphor (ver src/components/Icon.astro). */
  icon: string;
  items: readonly Service[];
}

/** Precios y duraciones según la ficha de Booksy. */
export const SERVICE_GROUPS: readonly ServiceGroup[] = [
  {
    title: "Corte",
    icon: "scissors",
    items: [
      { name: "Lavar, cortar y peinar", price: "18 €", duration: "20 min" },
      { name: "Corte joven hasta 21 años", price: "15 €", duration: "20 min" },
      { name: "Corte de niño hasta 7 años", price: "14 €", duration: "20 min" },
      { name: "Corte veterano desde 65 años", price: "14 €", duration: "20 min" },
      { name: "Rapado de cabeza a máquina", price: "13 €", duration: "20 min" },
    ],
  },
  {
    title: "Corte y barba",
    icon: "armchair",
    items: [
      {
        name: "Lavar, cortar y arreglo de barba",
        price: "29 €",
        duration: "40 min",
      },
    ],
  },
  {
    title: "Barba",
    icon: "user",
    items: [
      { name: "Arreglo de barba", price: "17 €", duration: "20 min" },
      { name: "Afeitado tradicional", price: "20 €", duration: "20 min" },
    ],
  },
  {
    title: "Color y textura",
    icon: "paint-brush",
    items: [
      {
        name: "Tinte",
        price: "desde 20 €",
        duration: "20 min",
        note: "Tinte de caballero, natural y sin amoniaco, para disimular las canas.",
      },
      { name: "Tinte de barba", price: "15 €", duration: "20 min" },
      { name: "Mechas", price: "Consultar", duration: "1 h 15 min" },
      { name: "Moldeador", price: "Consultar", duration: "20 min" },
    ],
  },
];

/** Los 3 servicios más pedidos, para el resumen del hero. */
export const POPULAR = [
  "Lavar, cortar y peinar",
  "Lavar, cortar y arreglo de barba",
  "Corte joven hasta 21 años",
] as const;

export interface Review {
  author: string;
  text: string;
  source: "Google" | "Booksy";
  service?: string;
}

/** Reseñas reales copiadas de las fichas públicas de Google y Booksy. No inventar ni editar. */
export const REVIEWS: readonly Review[] = [
  {
    author: "Cristian",
    text: "¡José es un crack! Corte y barba impecables, se nota que sabe lo que hace y le pone ganas de verdad. Te escucha y cuida cada detalle.",
    source: "Booksy",
    service: "Lavar, cortar y arreglo de barba",
  },
  {
    author: "Javi Porteiro",
    text: "Llevo años confiando en José para cortarme el pelo a mí y a mis hijos. Es un auténtico crack.",
    source: "Google",
  },
  {
    author: "Oscar",
    text: "Me corto el pelo y la barba con Álex, muy profesional y educado. Me he sentido como en casa, con muy buenos consejos.",
    source: "Booksy",
    service: "Lavar, cortar y arreglo de barba",
  },
  {
    author: "Patricia",
    text: "Excelente peluquería. Trato inmejorable desde que entras, muy cercanos. Nos atendió José Carlos Sotelo y no puede ser mejor.",
    source: "Google",
  },
  {
    author: "Alejandro",
    text: "¡José es el mejor! Siempre me encantan los cortes de pelo que me hace y la aproximación que tiene conmigo.",
    source: "Booksy",
    service: "Lavar, cortar y peinar",
  },
  {
    author: "Edgar",
    text: "Todo genial, muy buen trato y profesional.",
    source: "Booksy",
    service: "Lavar, cortar y peinar",
  },
];

export const ABOUT = {
  eyebrow: "La barbería",
  title: "Cortes, barba y buen trato",
  paragraphs: [
    "Cortes clásicos y de ahora, arreglo de barba y productos STMNT para el día a día.",
    "José Sotelo y el equipo escuchan lo que buscas y lo trabajan con calma, del corte al afeitado.",
  ],
} as const;

export const JOSE = {
  eyebrow: "Trayectoria",
  title: "José Sotelo, campeón del mundo",
  // VERIFICAR: conseguir la fuente del título (año, campeonato, federación) y citarla aquí.
  paragraphs: [
    "José empezó joven en la barbería. Con 18 años se proclamó campeón del mundo, representando a España en corte de pelo y barba.",
    "En la cita se nota. Escucha, cuida el detalle y deja el resultado a tu medida.",
    "Hoy, en Las Rozas, él y el equipo siguen con ese mismo criterio.",
  ],
  highlights: ["Campeón del mundo", "Representando a España", "Desde los 18 años"],
  /**
   * ID de YouTube del vídeo definitivo. Dejar en null hasta tenerlo:
   * el vídeo provisional (p7mfUclgdm4) muestra el local antiguo y no debe publicarse.
   */
  youtubeId: null as string | null,
} as const;

/**
 * Medios del hero y de "La barbería".
 * PROVISIONALES hasta confirmar dos cosas (poner `provisional: false` cuando estén resueltas):
 *  1. Que los vídeos son del local ACTUAL de Las Rozas (el CONTEXT.md habla de un local antiguo).
 *  2. Que las personas que salen han dado permiso para usar su imagen (RGPD y derecho a la propia imagen).
 * Se tratan como decorativos (sin alt descriptivo).
 *  - Foto real: dejar `hero.jpg` o `about.jpg` en src/assets/photos/ (tienen prioridad sobre el vídeo).
 *  - Otro vídeo: reemplazar los mp4 de public/media/ y regenerar el póster con
 *    `node scripts/extract-poster.mjs` (o apuntar aquí a otro archivo; null = sin vídeo).
 * Ojo con la calidad: el vídeo del hero es vertical y de 526x702, por eso en escritorio va enmarcado.
 */
export const MEDIA = {
  provisional: true,
  heroVideo: "/media/hero-barber.mp4" as string | null,
  aboutVideo: "/media/about-barber.mp4" as string | null,
} as const;

/** Textos alternativos de las fotos. Revisar al sustituir por las fotos reales. */
export const PHOTO_ALT = {
  hero: "Interior de Ikaro Men's Barber en Las Rozas de Madrid",
  about: "Sillones y puestos de trabajo de Ikaro Men's Barber",
  jose: "José Sotelo, fundador de Ikaro Men's Barber",
  stmntGama: "Gama STMNT de champú, barba y peinado. Foto de la marca.",
  stmntAfeitado:
    "La rutina de afeitado. Gel y loción aftershave STMNT. Foto de campaña. La persona no trabaja en Ikaro.",
  stmntRetrato:
    "Cuidado de cada día. Productos STMNT. Foto de campaña. La persona no trabaja en Ikaro.",
  stmntJulius:
    "Peinado STMNT, de mate a brillo. Foto de campaña. La persona no trabaja en Ikaro.",
  stmntPasta: "Textura mate. Pasta mate STMNT, foto de producto de la marca.",
  stmntColeccion:
    "Toda la gama STMNT en la barbería. Foto de campaña. Quienes salen no trabajan en Ikaro.",
} as const;

export const LEGAL = legal;
export const legalComplete = Boolean(legal.titular && legal.nif && legal.email);

/**
 * Plazos de conservación. Fuente única para privacidad, CRUD y respuestas
 * de supresión. Si no hay base, se suprime; si la hay, se avisa de estos plazos.
 */
export const RETENTION = [
  {
    data: "Citas, consultas y datos de contacto",
    years: 5,
    after: "el fin de la cita o de la última comunicación",
    basis: "posible reclamación contractual (artículo 1964 del Código Civil)",
  },
  {
    data: "Facturas y obligaciones tributarias",
    years: 4,
    after: "el fin del plazo de presentación del impuesto",
    basis: "artículo 66 de la Ley General Tributaria",
  },
  {
    data: "Documentación mercantil",
    years: 6,
    after: "el último asiento",
    basis: "artículo 30 del Código de Comercio",
  },
  {
    data: "Registros técnicos del servidor (IP, fecha, página, navegador)",
    years: null,
    after: "el tiempo estrictamente necesario para la seguridad del servicio",
    basis: "interés legítimo (artículo 6.1.f del RGPD)",
  },
] as const;

/** Catálogo STMNT en el local. Precios: PVPR + 30 %, acabados en ,99 (scripts/import-stmnt.mjs). No es tienda online. */
export const STMNT = stmntCatalog;
export const PRODUCT_GROUPS = STMNT.groups;

export const NAV = [
  { href: "#servicios", label: "Servicios" },
  { href: "#productos", label: "Productos" },
  { href: "#sobre-nosotros", label: "La barbería" },
  { href: "#trayectoria", label: "José" },
  { href: "#opiniones", label: "Opiniones" },
  { href: "#contacto", label: "Contacto" },
] as const;
