# Ikaro Men's Barber — Datos de negocio y lógica

Documento de referencia extraído de la demo en `frontend/app/demo/barber-shop/`.  
Fuentes principales: `lib/data.ts`, `lib/hours.ts`, `lib/cookies.ts`, `lib/a11y.ts`, `layout.tsx`, copy de componentes y assets.

---

## 1. Identidad

| Campo | Valor |
|-------|--------|
| Nombre comercial | Ikaro Men's Barber |
| Nombre corto | Ikaro |
| Tagline | Barbería de caballeros en Las Rozas |
| Descripción corta | Cortes clásicos y actuales, barbería experta y un trato cercano en el corazón de Las Rozas de Madrid. |
| Ubicación (eyebrow hero) | Las Rozas de Madrid |
| Claim hero | Cortes con carácter, barba cuidada al detalle y el trato de siempre. |

### Metadata SEO (demo; no indexada)

| Campo | Valor |
|-------|--------|
| Title | Ikaro Men's Barber \| Barbería en Las Rozas de Madrid |
| Description | Barbería de caballeros en Calle Severo Ochoa 8, Las Rozas. Cortes, barba y afeitado tradicional. Reserva online en Booksy. 4,9 en Google. |
| robots | `index: false`, `follow: false` |
| Open Graph title | Ikaro Men's Barber |
| Open Graph description | Cortes con carácter y barba cuidada al detalle en Las Rozas de Madrid. |
| Open Graph locale | es_ES |

### Tipografías

- Display: Cormorant Garamond (400–700)
- Body: Manrope (400–700)

### Paleta (CSS)

| Token | Hex / valor |
|-------|-------------|
| ink | `#182c48` |
| ink-soft | `#121212` |
| ink-elevated | `#1a1a1a` |
| brass | `#c5a059` |
| brass-bright | `#d4b06e` |
| brass-dim | `#8f7340` |
| cream | `#eae4d8` |
| cream-muted | `#b7b0a3` |
| line | `rgba(197, 160, 89, 0.22)` |

---

## 2. Contacto y reserva

| Canal | Valor |
|-------|--------|
| Teléfono (mostrar) | 697 27 04 34 |
| Teléfono (href) | `tel:+34697270434` |
| WhatsApp | `https://wa.me/34697270434` |
| Booksy (reserva) | `https://booksy.com/es-es/169010_ikaro-men-s-barber_barberia_39013_las-rozas-de-madrid` |

**Nota:** no hay backend propio de citas. Toda la reserva online apunta a Booksy (enlace externo / widget no embebido como API).

---

## 3. Dirección y mapa

| Campo | Valor |
|-------|--------|
| Calle | Calle Severo Ochoa, 8, Loc 6 |
| Ciudad | 28232 Las Rozas de Madrid, Madrid |
| Dirección completa | Calle Severo Ochoa, 8, Loc 6, 28232 Las Rozas de Madrid, Madrid |
| Latitud | 40.5213568 |
| Longitud | -3.8969313 |
| Google Maps (enlace) | `https://www.google.com/maps/search/?api=1&query=40.5213568,-3.8969313` |
| Google Maps (embed) | `https://maps.google.com/maps?q=40.5213568,-3.8969313&ll=40.5213568,-3.8969313&z=18&hl=es&output=embed` |

---

## 4. Valoraciones

| Fuente | Nota | Nº opiniones | URL |
|--------|------|--------------|-----|
| Google | 4,9 | 47 | Búsqueda Maps: Ikaro Men's Barber Las Rozas |
| Booksy | 5,0 | 43 | Misma URL de ficha Booksy |

---

## 5. Horario (presentación)

Texto mostrado en la web:

| Día | Horario |
|-----|---------|
| Lunes – Viernes | 10:00 – 14:00 · 16:00 – 21:00 |
| Sábado | 10:00 – 14:00 · 16:00 – 20:00 |
| Domingo | Cerrado |

---

## 6. Lógica “Abierto ahora” / “Cerrado”

Archivo: `lib/hours.ts`  
Timezone: **Europe/Madrid**

### Franjas usadas por el cálculo

| Días | Franjas `[hInicio, mInicio, hFin, mFin]` |
|------|------------------------------------------|
| Lunes–Viernes (weekday 1–5) | 10:00–14:00 y 16:00–21:00 |
| Sábado (weekday 6) | 10:00–14:00 y 16:00–20:00 |
| Domingo (weekday 0) | Siempre cerrado |

### Reglas

1. Se obtiene día/hora actual en Madrid con `Intl.DateTimeFormat`.
2. Si es domingo → `open: false`, label `"Cerrado"`.
3. Si no, se comprueba si los minutos del día caen en alguna franja (`>= inicio` y `< fin`).
4. Resultado:
   - abierto → `{ open: true, label: "Abierto ahora" }`
   - cerrado → `{ open: false, label: "Cerrado" }`
5. El badge en UI se actualiza vía `useSyncExternalStore` (snapshot booleano `open`) y se reevalúa cada minuto.

---

## 7. Equipo

| Nombre | Rol |
|--------|-----|
| José Sotelo | Fundador · Campeón mundial |
| Miguel | Peluquero |
| Alex | Peluquero |

---

## 8. Trayectoria de José (JOSE_STORY)

| Campo | Valor |
|-------|--------|
| Eyebrow | Trayectoria |
| Título | José Sotelo, campeón mundial |
| Lead | Desde los 18 años representando a España en corte de pelo y barba: precisión de competición, traída al día a día en Las Rozas. |
| YouTube ID (provisional) | `p7mfUclgdm4` |
| URL YouTube | `https://www.youtube.com/watch?v=p7mfUclgdm4` |
| Título iframe | Vídeo provisional — espacio reservado para la trayectoria de José Sotelo |
| Nota UI | Contenido provisional · Sustituir por el vídeo definitivo |

### Párrafos

1. José Sotelo no solo dirige Ikaro Men's Barber: es campeón mundial y ha competido representando a España en corte de pelo y barba. Esa exigencia se nota en cada servicio — escucha, técnica y un resultado limpio.
2. Aquí irá, más adelante, el vídeo propio sobre su trayectoria. Mientras tanto, este espacio muestra el tono y la ubicación del contenido.

### Highlights UI

- Campeón mundial
- Representando a España
- Desde los 18 años

### Lógica de embed

- Facade privacy-friendly: no carga YouTube hasta play.
- Al activar: `youtube-nocookie.com/embed/{id}?autoplay=1&rel=0`.

---

## 9. Comodidades (amenities)

- Plaza de aparcamiento
- Tarjetas de crédito
- Acceso adaptado
- Adaptado para niños
- Wi-Fi
- Programa de fidelidad

---

## 10. Servicios

Precios orientativos. CTA de cada servicio → Booksy.

**Lógica de listado:** se ordenan con `popular: true` primero (resto mantiene orden relativo).

| Servicio | Precio | Duración | Popular | Descripción / icono |
|----------|--------|----------|---------|---------------------|
| Lavar, cortar y peinar | 18 € | 20 min | Sí | `ph:scissors` |
| Lavar, cortar y arreglo de barba | 29 € | 40 min | Sí | `game-icons:beard` |
| Corte joven hasta 21 años | 15 € | 20 min | Sí | `ph:user` |
| Arreglo de barba | 17 € | 20 min | | `mdi:mustache` |
| Afeitado tradicional | 20 € | 20 min | | `game-icons:razor` |
| Corte de niño (hasta 7 años) | 14 € | 20 min | | `ph:baby` |
| Corte veterano a partir de 65 años | 14 € | 20 min | | `ph:user-circle` |
| Rapado de cabeza a máquina | 13 € | 20 min | | `tabler:razor-electric` |
| Tinte | desde 20 € | 20 min | | Coloración especial de caballeros, natural y sin amoniaco, pensada para disimular las canas. (`ph:paint-brush`) |
| Tinte de barba | 15 € | 20 min | | `mdi:face-man-shimmer` |
| Mechas | Consultar | 1 h 15 min | | `mdi:hair-dryer` |
| Moldeador | Consultar | 20 min | | `ph:magic-wand` |

Iconos: `@iconify/react`.

---

## 11. Opiniones (reseñas en landing)

| Cliente | Texto | Servicio / contexto | Fuente |
|---------|-------|---------------------|--------|
| Alejandro | ¡José es el mejor! Siempre me encantan los cortes de pelo que me hace y la aproximación que tiene conmigo. | Lavar, cortar y peinar | Booksy |
| Cristian | ¡José es un crack! Corte y barba impecables, se nota que sabe lo que hace y le pone ganas de verdad. Te escucha y cuida cada detalle. | Lavar, cortar y arreglo de barba | Booksy |
| Oscar | Me corto el pelo y la barba con Álex, muy profesional y educado. Me he sentido como en casa, con muy buenos consejos. | Lavar, cortar y arreglo de barba | Booksy |
| Javi Porteiro | Llevo años confiando en José para cortarme el pelo a mí y a mis hijos. Es un auténtico crack. | Google | Google |
| Patricia | Excelente peluquería. Trato inmejorable desde que entras, muy cercanos. Nos atendió José Carlos Sotelo y no puede ser mejor. | Google | Google |
| Edgar | Todo genial, muy buen trato y profesional. | Lavar, cortar y peinar | Booksy |

---

## 12. Copy de secciones (hardcoded en componentes)

### About (`#sobre-nosotros`)

- Eyebrow: La barbería  
- Título: Estilo, precisión y el trato de casa  
- P1: En {SITE.name} elevamos la peluquería de caballeros: cortes clásicos y actuales, barbería experta y productos pensados para el cuidado diario.  
- P2: José Sotelo y su equipo te escuchan, cuidan cada detalle y te dejan salir con un resultado limpio, natural y a tu medida — desde el primer corte hasta el afeitado tradicional.

### Contact (`#contacto`)

- Eyebrow: Visítanos  
- Título: Contacto y horario  
- Texto: Estamos en Las Rozas. Reserva online o escríbenos: te respondemos rápido.

### Cookies (banner demo)

- Texto: Esta demo usa cookies técnicas para recordar tu preferencia de consentimiento.  
- Persistencia: `localStorage` key `ikaro-demo-cookies` = `"1"` tras aceptar.  
- Enlace: `/cookies`

---

## 13. Assets multimedia

| Asset | Ruta pública | Uso |
|-------|--------------|-----|
| Vídeo hero | `/demo/barber-shop/hero-barber.mp4` | Fondo hero (autoplay, muted, loop) |
| Vídeo about | `/demo/barber-shop/about-barber.mp4` | Sección Nosotros (lazy al viewport) |
| YouTube trayectoria | id `p7mfUclgdm4` | Placeholder hasta vídeo propio |

---

## 14. Estructura de la landing / anclas

| ID | Sección |
|----|---------|
| `#inicio` | Hero |
| `#servicios` | Carta de servicios |
| `#sobre-nosotros` | La barbería + equipo |
| `#trayectoria` | Historia de José + YouTube |
| `#opiniones` | Reseñas |
| `#contacto` | Dirección, horario, CTAs, mapa |
| `#contenido-principal` | Skip link → main |

Ruta demo: `/demo/barber-shop`  
Índice demos: slug `barber-shop`, descripción “Landing premium: servicios reales, opiniones y reserva online vía Booksy (demo sin backend).”

---

## 15. Lógica / comportamiento no comercial

| Pieza | Comportamiento |
|-------|----------------|
| Reserva | Enlaces externos a Booksy (nueva pestaña) |
| CTAs secundarios | WhatsApp y teléfono |
| Badge horario | `getOpenStatus()` + Europe/Madrid |
| Servicios | Sort por `popular` |
| Cookies | `COOKIE_KEY = "ikaro-demo-cookies"` |
| A11y enlaces externos | Sufijo “ (se abre en nueva pestaña)” vía `externalLabel()` |
| Demo overlays | CTA móvil “Reservar” + banner cookies apilados |
| robots | Demo no indexable |

---

## 16. Archivos fuente

- `lib/data.ts` — negocio, servicios, reseñas, trayectoria  
- `lib/hours.ts` — abierto/cerrado  
- `lib/cookies.ts` — clave localStorage  
- `lib/a11y.ts` — etiquetas accesibles  
- `layout.tsx` — metadata y fuentes  
- `barber-theme.css` — tokens de color  
- `components/*` — copy de sección y CTAs  
- `public/demo/barber-shop/*` — vídeos propios  


# Ikaro Men's Barber — Datos de negocio

Fuente principal de verdad en código: `src/lib/data.ts`  
Reglas de marca / hechos estrictos: `.cursorrules`

---

## 1. Identidad

| Campo | Valor |
|---|---|
| Nombre comercial | Ikaro Men's Barber |
| Nombre corto (nav) | Ikaro |
| Tipo | Barbería de caballeros |
| Tagline | Barbería de caballeros en Las Rozas |
| Descripción corta | Cortes clásicos y actuales, barbería experta y un trato cercano en el corazón de Las Rozas de Madrid. |
| Idioma UI | Español |
| Estética | Dark / Premium / Vintage Barbershop (alineada al local real) |

### Titular SEO / web
- **Title:** Ikaro Men's Barber \| Barbería en Las Rozas de Madrid
- **Meta description:** Barbería de caballeros en Calle Severo Ochoa 8, Las Rozas. Cortes, barba y afeitado tradicional. Reserva online en Booksy. 4,9 en Google.

### Claim del hero
> Cortes con carácter, barba cuidada al detalle y el trato de siempre.

---

## 2. Ubicación y contacto

| Campo | Valor |
|---|---|
| Dirección completa | Calle Severo Ochoa, 8, Loc 6, 28232 Las Rozas de Madrid, Madrid |
| Calle / local | Calle Severo Ochoa, 8, Loc 6 |
| Ciudad / CP | 28232 Las Rozas de Madrid, Madrid |
| Coordenadas | Lat `40.5213568` · Lng `-3.8969313` |
| Teléfono (mostrar) | 697 27 04 34 |
| Teléfono (E.164) | +34 697 27 04 34 |
| Llamar | `tel:+34697270434` |
| WhatsApp | https://wa.me/34697270434 |
| Google Maps (enlace) | https://www.google.com/maps/search/?api=1&query=40.5213568,-3.8969313 |
| Mapa embed | Google Maps embed centrado en esas coords, zoom 18 |

---

## 3. Reservas y perfiles online

| Canal | URL / dato |
|---|---|
| Booksy (reservas) | https://booksy.com/es-es/169010_ikaro-men-s-barber_barberia_39013_las-rozas-de-madrid |
| Booksy ID | `169010` |
| Google reseñas (búsqueda) | https://www.google.com/maps/search/?api=1&query=Ikaro+Men%27s+Barber+Calle+Severo+Ochoa+8+Las+Rozas |

### Valoraciones usadas en la web
| Fuente | Nota | Nº reseñas |
|---|---|---|
| Google | 4,9 | 47 |
| Booksy | 5,0 | 43 |

---

## 4. Horario

| Día | Horario |
|---|---|
| Lunes – Viernes | 10:00 – 14:00 · 16:00 – 21:00 |
| Sábado | 10:00 – 14:00 · 16:00 – 20:00 |
| Domingo | Cerrado |

---

## 5. Equipo

| Nombre | Rol en la web |
|---|---|
| José Sotelo | Fundador · referente técnico |
| Miguel | Peluquero |
| Alex | Peluquero |

### Notas de identidad de José (copy / conversación con cliente)
- Nombre completo visto en reseñas / Business: **José Carlos Sotelo Jiménez**
- Empezó joven; con **apenas 18 años** campeón mundial representando a **España** en **corte de pelo y barba**
- Referente del negocio en Las Rozas
- Vídeo de trayectoria (placeholder temporal YouTube): https://www.youtube.com/watch?v=p7mfUclgdm4  
  - Embed: `https://www.youtube.com/embed/p7mfUclgdm4`  
  - ID: `p7mfUclgdm4`  
  - Estado: material de referencia; sustituir cuando exista el clip definitivo editado (sin mostrar local antiguo)

### Copy de historia (`JOSE_STORY`)
- **Eyebrow:** El referente  
- **Título:** José Sotelo: oficio, precisión y recorrido internacional  
- **Párrafos:**
  1. José empezó joven en la barbería y, con apenas 18 años, llegó a proclamarse campeón mundial representando a España en corte de pelo y barba.
  2. Esa exigencia de campeonato se nota en cada cita: escucha, detalle y un resultado limpio, natural y a tu medida — desde el primer corte hasta el afeitado tradicional.
  3. Hoy, en Ikaro Men's Barber (Las Rozas), él y su equipo cuidan el estilo de caballeros con el mismo criterio: técnica, trato cercano y cero atajos.

---

## 6. Servicios y precios

Fuente: Booksy del negocio. Mantener sincronizado con `src/lib/data.ts`.

| Servicio | Precio | Duración | Popular | Notas |
|---|---|---|---|---|
| Lavar, cortar y peinar | 18 € | 20 min | Sí | |
| Lavar, cortar y arreglo de barba | 29 € | 40 min | Sí | |
| Arreglo de barba | 17 € | 20 min | | |
| Afeitado tradicional | 20 € | 20 min | | |
| Corte joven hasta 21 años | 15 € | 20 min | Sí | |
| Corte de niño (hasta 7 años) | 14 € | 20 min | | |
| Corte veterano a partir de 65 años | 14 € | 20 min | | |
| Rapado de cabeza a máquina | 13 € | 20 min | | |
| Tinte | desde 20 € | 20 min | | Coloración caballeros, natural, sin amoniaco, para disimular canas |
| Tinte de barba | 15 € | 20 min | | |
| Mechas | Consultar | 1 h 15 min | | |
| Moldeador | Consultar | 20 min | | |

### Lógica de UI servicios
- Por defecto se muestran solo los marcados como **popular** (3).
- El resto se revela con “Ver todos los servicios”.
- Cada servicio enlaza a Booksy (“Agendar”).
- Iconos vía Iconify (tijeras, barba, navaja, etc.).

### Otros servicios vistos en Booksy (no siempre listados en web)
- “Otros servicios” — Variable / 20 min (no está en `SERVICES` actual)

---

## 7. Amenities / comodidades

- Plaza de aparcamiento  
- Tarjetas de crédito  
- Acceso adaptado (personas con capacidad reducida)  
- Adaptado para niños  
- Wi-Fi  
- Programa de fidelidad  

También existe en Booksy la idea de **cupones de sesiones** (compra varios servicios y úsalos cuando quieras) — no está modelado aún en la web.

---

## 8. Reseñas usadas en la web

| Cliente | Fuente | Servicio / contexto | Texto (resumen) |
|---|---|---|---|
| Alejandro | Booksy | Lavar, cortar y peinar | José es el mejor; siempre le encantan los cortes y el trato |
| Cristian | Booksy | Lavar, cortar y arreglo de barba | José es un crack; corte y barba impecables |
| Oscar | Booksy | Lavar, cortar y arreglo de barba | Con Álex; profesional, educado, buenos consejos |
| Javi Porteiro | Google | Google | Años confiando en José para él y sus hijos |
| Patricia | Google | Google | Excelente; José Carlos Sotelo; trato inmejorable |
| Edgar | Booksy | Lavar, cortar y peinar | Todo genial, buen trato y profesional |

---

## 9. Marca visual (design tokens)

| Token | Hex / valor | Uso |
|---|---|---|
| Deep Navy | `#182C48` | Fondo principal / walls |
| Charcoal | `#121212` | Superficies oscuras / counter |
| Elevated | `#1A1A1A` | Superficies elevadas |
| Brass | `#C5A059` | Acentos / logo |
| Brass bright | `#D4B06E` | Hover |
| Brass dim | `#8F7340` | Acento apagado |
| Cream | `#EAE4D8` | Texto |
| Cream muted | `#B7B0A3` | Texto secundario |
| Line | `rgba(197, 160, 89, 0.22)` | Bordes |

### Tipografía
- Display: **Cormorant Garamond**
- Body: **Manrope**

### Reglas de composición
- El nombre de marca domina el hero
- Hero full-bleed; sin badges/chips flotantes sobre la media
- Sin cards en el primer viewport
- Mobile-first
- Copy en español

---

## 10. Lógica de conversión / producto web

| Elemento | Comportamiento |
|---|---|
| CTA principal | Reservar cita → Booksy (nueva pestaña) |
| CTA secundario | WhatsApp / Ver servicios / Llamar |
| Sticky CTA (móvil) | Aparece al salir del hero: Reservar + WhatsApp |
| Trust strip | Bajo el hero: scores Google/Booksy con enlaces |
| Contacto | Dirección, horario, Booksy, WhatsApp, llamar, mapa |
| About | Historia José + YouTube placeholder + amenities + equipo |
| JSON-LD | `BarberShop` con dirección, geo, teléfono, horario, aggregateRating |

### Flujo de página
`Navbar → Hero → TrustStrip → Services → About (José + YT) → Reviews → Contact → Footer`  
(+ Sticky CTA en móvil)

---

## 11. Assets relevantes

| Asset | Uso |
|---|---|
| `public/images/hero-barber.webp` | Still del hero (optimizado) |
| `public/images/hero-barber.png` | Original / poster histórico |
| `public/videos/*` | Mp4 antiguos; **ya no se usan** en el markup |
| YouTube `p7mfUclgdm4` | Placeholder trayectoria José |

---

## 12. Notas / pendientes de negocio

1. Sustituir el YouTube temporal por el vídeo editado de José (tapando local antiguo ~4–8 s).
2. Cuando haya fotos reales del local de Las Rozas, reemplazar stills genéricos/IA.
3. Confirmar si el dominio definitivo sustituye `https://ikaro-mens-barber.vercel.app` en metadata/sitemap/robots/JSON-LD.
4. Valorar embed/widget Booksy in-page más adelante (hoy solo deep-link).
5. Precios: cualquier cambio debe hacerse en `src/lib/data.ts` (y reflejarse aquí).

---

## 13. Distinción importante (otros “Ikaro”)

Existen perfiles Booksy/outlet distintos (p. ej. **Ikaro Barber Shop Las Rozas Style40** / The Style Outlets).  
**Este sitio es solo** el de **Calle Severo Ochoa, 8, Loc 6** (Booksy `169010`).

# Ikaro Men's Barber — Datos de negocio y lógica

Documento de referencia extraído de la demo en `frontend/app/demo/barber-shop/`.  
Fuentes principales: `lib/data.ts`, `lib/hours.ts`, `lib/cookies.ts`, `lib/a11y.ts`, `layout.tsx`, copy de componentes y assets.

---

## 1. Identidad

| Campo | Valor |
|-------|--------|
| Nombre comercial | Ikaro Men's Barber |
| Nombre corto | Ikaro |
| Tagline | Barbería de caballeros en Las Rozas |
| Descripción corta | Cortes clásicos y actuales, barbería experta y un trato cercano en el corazón de Las Rozas de Madrid. |
| Ubicación (eyebrow hero) | Las Rozas de Madrid |
| Claim hero | Cortes con carácter, barba cuidada al detalle y el trato de siempre. |

### Metadata SEO (demo; no indexada)

| Campo | Valor |
|-------|--------|
| Title | Ikaro Men's Barber \| Barbería en Las Rozas de Madrid |
| Description | Barbería de caballeros en Calle Severo Ochoa 8, Las Rozas. Cortes, barba y afeitado tradicional. Reserva online en Booksy. 4,9 en Google. |
| robots | `index: false`, `follow: false` |
| Open Graph title | Ikaro Men's Barber |
| Open Graph description | Cortes con carácter y barba cuidada al detalle en Las Rozas de Madrid. |
| Open Graph locale | es_ES |

### Tipografías

- Display: Cormorant Garamond (400–700)
- Body: Manrope (400–700)

### Paleta (CSS)

| Token | Hex / valor |
|-------|-------------|
| ink | `#182c48` |
| ink-soft | `#121212` |
| ink-elevated | `#1a1a1a` |
| brass | `#c5a059` |
| brass-bright | `#d4b06e` |
| brass-dim | `#8f7340` |
| cream | `#eae4d8` |
| cream-muted | `#b7b0a3` |
| line | `rgba(197, 160, 89, 0.22)` |

---

## 2. Contacto y reserva

| Canal | Valor |
|-------|--------|
| Teléfono (mostrar) | 697 27 04 34 |
| Teléfono (href) | `tel:+34697270434` |
| WhatsApp | `https://wa.me/34697270434` |
| Booksy (reserva) | `https://booksy.com/es-es/169010_ikaro-men-s-barber_barberia_39013_las-rozas-de-madrid` |

**Nota:** no hay backend propio de citas. Toda la reserva online apunta a Booksy (enlace externo / widget no embebido como API).

---

## 3. Dirección y mapa

| Campo | Valor |
|-------|--------|
| Calle | Calle Severo Ochoa, 8, Loc 6 |
| Ciudad | 28232 Las Rozas de Madrid, Madrid |
| Dirección completa | Calle Severo Ochoa, 8, Loc 6, 28232 Las Rozas de Madrid, Madrid |
| Latitud | 40.5213568 |
| Longitud | -3.8969313 |
| Google Maps (enlace) | `https://www.google.com/maps/search/?api=1&query=40.5213568,-3.8969313` |
| Google Maps (embed) | `https://maps.google.com/maps?q=40.5213568,-3.8969313&ll=40.5213568,-3.8969313&z=18&hl=es&output=embed` |

---

## 4. Valoraciones

| Fuente | Nota | Nº opiniones | URL |
|--------|------|--------------|-----|
| Google | 4,9 | 47 | Búsqueda Maps: Ikaro Men's Barber Las Rozas |
| Booksy | 5,0 | 43 | Misma URL de ficha Booksy |

---

## 5. Horario (presentación)

Texto mostrado en la web:

| Día | Horario |
|-----|---------|
| Lunes – Viernes | 10:00 – 14:00 · 16:00 – 21:00 |
| Sábado | 10:00 – 14:00 · 16:00 – 20:00 |
| Domingo | Cerrado |

---

## 6. Lógica “Abierto ahora” / “Cerrado”

Archivo: `lib/hours.ts`  
Timezone: **Europe/Madrid**

### Franjas usadas por el cálculo

| Días | Franjas `[hInicio, mInicio, hFin, mFin]` |
|------|------------------------------------------|
| Lunes–Viernes (weekday 1–5) | 10:00–14:00 y 16:00–21:00 |
| Sábado (weekday 6) | 10:00–14:00 y 16:00–20:00 |
| Domingo (weekday 0) | Siempre cerrado |

### Reglas

1. Se obtiene día/hora actual en Madrid con `Intl.DateTimeFormat`.
2. Si es domingo → `open: false`, label `"Cerrado"`.
3. Si no, se comprueba si los minutos del día caen en alguna franja (`>= inicio` y `< fin`).
4. Resultado:
   - abierto → `{ open: true, label: "Abierto ahora" }`
   - cerrado → `{ open: false, label: "Cerrado" }`
5. El badge en UI se actualiza vía `useSyncExternalStore` (snapshot booleano `open`) y se reevalúa cada minuto.

---

## 7. Equipo

| Nombre | Rol |
|--------|-----|
| José Sotelo | Fundador · Campeón mundial |
| Miguel | Peluquero |
| Alex | Peluquero |

---

## 8. Trayectoria de José (JOSE_STORY)

| Campo | Valor |
|-------|--------|
| Eyebrow | Trayectoria |
| Título | José Sotelo, campeón mundial |
| Lead | Desde los 18 años representando a España en corte de pelo y barba: precisión de competición, traída al día a día en Las Rozas. |
| YouTube ID (provisional) | `p7mfUclgdm4` |
| URL YouTube | `https://www.youtube.com/watch?v=p7mfUclgdm4` |
| Título iframe | Vídeo provisional — espacio reservado para la trayectoria de José Sotelo |
| Nota UI | Contenido provisional · Sustituir por el vídeo definitivo |

### Párrafos

1. José Sotelo no solo dirige Ikaro Men's Barber: es campeón mundial y ha competido representando a España en corte de pelo y barba. Esa exigencia se nota en cada servicio — escucha, técnica y un resultado limpio.
2. Aquí irá, más adelante, el vídeo propio sobre su trayectoria. Mientras tanto, este espacio muestra el tono y la ubicación del contenido.

### Highlights UI

- Campeón mundial
- Representando a España
- Desde los 18 años

### Lógica de embed

- Facade privacy-friendly: no carga YouTube hasta play.
- Al activar: `youtube-nocookie.com/embed/{id}?autoplay=1&rel=0`.

---

## 9. Comodidades (amenities)

- Plaza de aparcamiento
- Tarjetas de crédito
- Acceso adaptado
- Adaptado para niños
- Wi-Fi
- Programa de fidelidad

---

## 10. Servicios

Precios orientativos. CTA de cada servicio → Booksy.

**Lógica de listado:** se ordenan con `popular: true` primero (resto mantiene orden relativo).

| Servicio | Precio | Duración | Popular | Descripción / icono |
|----------|--------|----------|---------|---------------------|
| Lavar, cortar y peinar | 18 € | 20 min | Sí | `ph:scissors` |
| Lavar, cortar y arreglo de barba | 29 € | 40 min | Sí | `game-icons:beard` |
| Corte joven hasta 21 años | 15 € | 20 min | Sí | `ph:user` |
| Arreglo de barba | 17 € | 20 min | | `mdi:mustache` |
| Afeitado tradicional | 20 € | 20 min | | `game-icons:razor` |
| Corte de niño (hasta 7 años) | 14 € | 20 min | | `ph:baby` |
| Corte veterano a partir de 65 años | 14 € | 20 min | | `ph:user-circle` |
| Rapado de cabeza a máquina | 13 € | 20 min | | `tabler:razor-electric` |
| Tinte | desde 20 € | 20 min | | Coloración especial de caballeros, natural y sin amoniaco, pensada para disimular las canas. (`ph:paint-brush`) |
| Tinte de barba | 15 € | 20 min | | `mdi:face-man-shimmer` |
| Mechas | Consultar | 1 h 15 min | | `mdi:hair-dryer` |
| Moldeador | Consultar | 20 min | | `ph:magic-wand` |

Iconos: `@iconify/react`.

---

## 11. Opiniones (reseñas en landing)

| Cliente | Texto | Servicio / contexto | Fuente |
|---------|-------|---------------------|--------|
| Alejandro | ¡José es el mejor! Siempre me encantan los cortes de pelo que me hace y la aproximación que tiene conmigo. | Lavar, cortar y peinar | Booksy |
| Cristian | ¡José es un crack! Corte y barba impecables, se nota que sabe lo que hace y le pone ganas de verdad. Te escucha y cuida cada detalle. | Lavar, cortar y arreglo de barba | Booksy |
| Oscar | Me corto el pelo y la barba con Álex, muy profesional y educado. Me he sentido como en casa, con muy buenos consejos. | Lavar, cortar y arreglo de barba | Booksy |
| Javi Porteiro | Llevo años confiando en José para cortarme el pelo a mí y a mis hijos. Es un auténtico crack. | Google | Google |
| Patricia | Excelente peluquería. Trato inmejorable desde que entras, muy cercanos. Nos atendió José Carlos Sotelo y no puede ser mejor. | Google | Google |
| Edgar | Todo genial, muy buen trato y profesional. | Lavar, cortar y peinar | Booksy |

---

## 12. Copy de secciones (hardcoded en componentes)

### About (`#sobre-nosotros`)

- Eyebrow: La barbería  
- Título: Estilo, precisión y el trato de casa  
- P1: En {SITE.name} elevamos la peluquería de caballeros: cortes clásicos y actuales, barbería experta y productos pensados para el cuidado diario.  
- P2: José Sotelo y su equipo te escuchan, cuidan cada detalle y te dejan salir con un resultado limpio, natural y a tu medida — desde el primer corte hasta el afeitado tradicional.

### Contact (`#contacto`)

- Eyebrow: Visítanos  
- Título: Contacto y horario  
- Texto: Estamos en Las Rozas. Reserva online o escríbenos: te respondemos rápido.

### Cookies (banner demo)

- Texto: Esta demo usa cookies técnicas para recordar tu preferencia de consentimiento.  
- Persistencia: `localStorage` key `ikaro-demo-cookies` = `"1"` tras aceptar.  
- Enlace: `/cookies`

---

## 13. Assets multimedia

| Asset | Ruta pública | Uso |
|-------|--------------|-----|
| Vídeo hero | `/demo/barber-shop/hero-barber.mp4` | Fondo hero (autoplay, muted, loop) |
| Vídeo about | `/demo/barber-shop/about-barber.mp4` | Sección Nosotros (lazy al viewport) |
| YouTube trayectoria | id `p7mfUclgdm4` | Placeholder hasta vídeo propio |

---

## 14. Estructura de la landing / anclas

| ID | Sección |
|----|---------|
| `#inicio` | Hero |
| `#servicios` | Carta de servicios |
| `#sobre-nosotros` | La barbería + equipo |
| `#trayectoria` | Historia de José + YouTube |
| `#opiniones` | Reseñas |
| `#contacto` | Dirección, horario, CTAs, mapa |
| `#contenido-principal` | Skip link → main |

Ruta demo: `/demo/barber-shop`  
Índice demos: slug `barber-shop`, descripción “Landing premium: servicios reales, opiniones y reserva online vía Booksy (demo sin backend).”

---

## 15. Lógica / comportamiento no comercial

| Pieza | Comportamiento |
|-------|----------------|
| Reserva | Enlaces externos a Booksy (nueva pestaña) |
| CTAs secundarios | WhatsApp y teléfono |
| Badge horario | `getOpenStatus()` + Europe/Madrid |
| Servicios | Sort por `popular` |
| Cookies | `COOKIE_KEY = "ikaro-demo-cookies"` |
| A11y enlaces externos | Sufijo “ (se abre en nueva pestaña)” vía `externalLabel()` |
| Demo overlays | CTA móvil “Reservar” + banner cookies apilados |
| robots | Demo no indexable |

---

## 16. Archivos fuente

- `lib/data.ts` — negocio, servicios, reseñas, trayectoria  
- `lib/hours.ts` — abierto/cerrado  
- `lib/cookies.ts` — clave localStorage  
- `lib/a11y.ts` — etiquetas accesibles  
- `layout.tsx` — metadata y fuentes  
- `barber-theme.css` — tokens de color  
- `components/*` — copy de sección y CTAs  
- `public/demo/barber-shop/*` — vídeos propios  
