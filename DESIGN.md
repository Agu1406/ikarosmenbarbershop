# DESIGN.md: Ikaro Men's Barber

Reglas visuales y de copy para no desviarnos. Los datos del negocio viven en `src/lib/data.ts`.

## Idea

Barbería de oficio en Las Rozas. La web se parece a su carta: tipografía seria, mucho aire, fotos reales y precios claros. Nada que parezca plantilla.

## Color

| Token | Valor | Uso |
|---|---|---|
| `--ink` | `#182c48` | Fondo principal |
| `--ink-soft` | `#121212` | Franjas oscuras, botón primario (texto) |
| `--brass` | `#c5a059` | Acento, botón primario, filetes (5,7:1 sobre `--ink`) |
| `--brass-bright` | `#d4b06e` | Hover, foco |
| `--brass-ink` | `#7a5f2c` | Latón sobre crema (4,7:1) |
| `--brass-dim` | `#8f7340` | Solo decorativo. No usar para texto |
| `--cream` | `#eae4d8` | Texto sobre oscuro, fondo de la carta |
| `--cream-muted` | `#b7b0a3` | Texto secundario sobre oscuro |

Ritmo de fondos: hero azul, carta en crema, barbería azul, José y opiniones en carbón y azul, contacto azul.

## Tipografía

- Display: Cormorant Garamond (600/700), solo desde 24 px. Sin cursiva.
- Cuerpo: Manrope (400 a 800). Autoalojadas con Fontsource (licencia OFL). No cargar Google Fonts.

## Composición

- Hero con el nombre de la marca dominando. Móvil: medio a sangre. Escritorio: texto a la izquierda y la imagen o vídeo a la derecha, a altura completa y pegado al borde (ancho máximo 44vw para no ampliar demasiado un vídeo de 526x702).
- CTA principal con flecha diagonal. Titulares de sección de hasta 4,5rem. Filete de 2,5rem antes del sobretítulo.
- Preguntas frecuentes (`Faq.astro`): las respuestas salen de `data.ts`, no se escriben precios a mano.
- Sin tarjetas en el primer viewport. Sin tres cajas con icono en fila.
- Servicios como carta: nombre, línea de puntos, precio, duración. Un icono Phosphor por grupo (4), en línea desde el build, nunca desde una API.
- Opiniones como citas con filete superior, no como tarjetas.
- Espaciado: solo la escala `--s1` a `--s8`.
- Radio de borde: 2 px.

## Referencias (Design DNA)

El perfil medido de Premium Barbershop, Heritage, Barber & Co y Louivver está en `design/references.dna.json`. Se usó para estructura, escala y composición. No se adoptan sus colores (tres de cuatro son negro con dorado) ni su dimensión de efectos. Para repetir la captura: `node scripts/dna-capture.mjs <carpeta> <urls>`. Las capturas de terceros no se guardan en el repo.

## Prohibido (patrones de web hecha con IA)

Degradados decorativos (también en texto), glassmorphism, sombras difusas, emojis, iconos genéricos en cajas, bento, badges sobre el titular, haz de luz que sigue al cursor, orbes, rejillas de puntos, destellos, grano sobre degradado, guiones largos en el copy, fórmulas "no es X, es Y", reseñas o cifras inventadas, imágenes generadas por IA presentadas como el local.

Excepción acordada: el único degradado permitido es la capa de legibilidad del hero en móvil (`.hero-scrim`), que es funcional.

## Movimiento (nivel medio)

Permitido, y nada más:
- Entrada del hero (0,7 s), línea de latón que se dibuja y zoom lento del fondo (20 s).
- Vídeo de fondo del hero y de La barbería, siempre con botón de pausa, sin arrancar con `prefers-reduced-motion` ni con Save-Data, y con el de La barbería sin descargar hasta acercarse.
- Entrada sutil al scroll (opacidad y 12 px, una vez) en cabeceras, grupos de la carta y reseñas. Solo se oculta lo que está bajo la pantalla al cargar; sin JS o con reduced-motion todo se ve (`src/scripts/reveal.ts`).
- Scroll-spy en el menú (`aria-current`), subrayado que crece en los enlaces, precio que se resalta al pasar por una fila de la carta.
- Todo se desactiva con `prefers-reduced-motion`. No usar GSAP, Lenis ni Three.js.

## Medios provisionales

Los vídeos de `public/media/` y su póster (`src/assets/media/hero-poster.webp`, extraído con `node scripts/extract-poster.mjs`) están marcados como provisionales en `MEDIA` de `src/lib/data.ts`. Antes de publicar: confirmar que son del local actual y que las personas que salen han dado permiso. Las fotos reales de `src/assets/photos/` tienen prioridad sobre el vídeo.

## Accesibilidad

- Contraste AA como mínimo; objetivos táctiles de 44 px; foco visible de 3 px.
- Skip link, `lang="es"`, un solo `h1`, enlaces externos con aviso "se abre en nueva pestaña".
- Todo contenido tiene alternativa por teclado.

## Fotos

Dejar las fotos reales en `src/assets/photos/` con estos nombres (jpg, png o webp). Se optimizan solas y aparecen sin tocar código. Revisar el texto alternativo en `PHOTO_ALT` de `src/lib/data.ts`.

| Archivo | Dónde sale | Formato recomendado |
|---|---|---|
| `hero` | Fondo del hero | Horizontal, 2400 px de ancho |
| `about` | Sección La barbería | Vertical 4:5 |
| `jose` | Sección José | Vertical 4:5 |
| `trabajo-1`, `trabajo-2`... | Galería | Cualquiera, mínimo 1200 px |

## Copy

Español de España, frases cortas y concretas, tuteo. Nombrar siempre el sitio (Las Rozas) y los servicios reales. Sin superlativos que no se puedan comprobar.
