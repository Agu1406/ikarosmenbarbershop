# Reglas de diseño, código y ley

Documento para copiar a otro proyecto. Recoge lo que este repo exige de verdad: `IGNORAR.md`, las reglas de Cursor, `DESIGN.md` y lo que el código aplica.

Si un punto no encaja en el proyecto nuevo, se dice y no se fuerza. Si choca con la ley española o europea (RGPD, LOPDGDD, LSSI-CE), gana la ley. Después mandan estas reglas, luego el diseño concreto del proyecto, luego el código.

Antes de diseñar o de escribir un dato, leer el contexto del negocio de ese proyecto. No inventar precios, horarios, reseñas, notas, accesos ni afirmaciones.

---

## 1. Código

- **KISS.** La solución más simple que cumple. Si un Singleton o una abstracción no ahorra trabajo, no está.
- **YAGNI.** No construir cuentas, pagos, tienda, 3D o analítica por si acaso. Se añade cuando hace falta, con la legalidad delante.
- **Separación de datos y presentación.** Una fuente de verdad (un `data.ts`, un CMS, una API) y pantallas que solo leen.
- **Fallar en voz alta.** Dato legal vacío, precio mal puesto o secreto en el repo: el build o el test fallan. No publicar en silencio.
- **Composición antes que herencia.** Piezas pequeñas (botón, enlace externo, fachada del mapa), no una clase base gigante.
- **Idempotencia.** Un mismo clic, webhook o reintento no crea dos citas, dos cobros ni dos bajas.

### SOLID

- **S.** Una responsabilidad por módulo, componente o función.
- **O.** Ampliar con código nuevo, no reescribiendo lo que ya cumple.
- **L.** Una implementación sustituye a su contrato sin romper a quien la usa.
- **I.** Tipos estrechos. No mezclar reservas, legal y analítica en el mismo contrato.
- **D.** Depender de datos y contratos, no de detalles internos.

### DRY

No duplicar precios, horarios, contacto, copy legal ni lógica de negocio. Una sola fuente de verdad. Extraer solo cuando haya repetición real.

### Singleton

Una sola instancia compartida para clientes, configuración o estado global (mapa, vídeo, menú). No convertir un Singleton en un almacén de todo el programa.

### Qué no meter por defecto

- CQRS, microservicios, event sourcing o DDD completo.
- Lenis, GSAP o Three.js, salvo que se pidan.
- shadcn/UI sin tocar.
- Iconos cargados desde una API en cada visita. Si hacen falta, van en el build.

---

## 2. Datos, bajas y ley

- **Minimización.** Recoger solo lo necesario (artículo 5 del RGPD).
- **Privilegio mínimo.** La web pública no ve facturas. El panel no ve contraseñas en claro.
- **Auditoría, no chismorreo.** Quién dio de baja, cuándo y por qué.
- **Secretos fuera del repo.** `.env` local, variables en el alojamiento, nunca tokens en git.
- **Copias y restauración.** Un backup no sirve si no se ha restaurado nunca.

### CRUD y la D

- **C / R / U:** crear, leer y actualizar con normalidad.
- **D (Delete):** inactivar. No borrar a ciegas.

Flujo de una baja o de una petición de supresión:

1. Inactivar siempre (`active: false`, `deactivatedAt`). El dato deja de usarse. El histórico se conserva.
2. ¿Hay base legal para conservar? (privacidad, RGPD / LOPDGDD, LSSI-CE, fiscal o mercantil).
   - **No:** suprimir o anonimizar de forma irreversible.
   - **Sí:** conservar solo lo cubierto por esa base y avisar qué se guarda, por qué y hasta cuándo.
3. Al cumplir el plazo: suprimir o anonimizar.

En duda: no borrar. Inactivar y señalar el choque.

Plazos de partida (vivir en un solo sitio, por ejemplo `RETENTION`, y mostrarse en la privacidad, sin copiarlos a mano):

| Dato | Plazo | Desde | Base |
|---|---|---|---|
| Citas, consultas y contacto | 5 años | el fin de la cita o de la última comunicación | art. 1964 del Código Civil |
| Facturas y obligaciones tributarias | 4 años | el fin del plazo de presentación del impuesto | art. 66 de la Ley General Tributaria |
| Documentación mercantil | 6 años | el último asiento | art. 30 del Código de Comercio |
| Registros técnicos del servidor (IP, fecha, página, navegador) | el tiempo estrictamente necesario | la seguridad del servicio | art. 6.1.f del RGPD |

```ts
// MAL: borrar sin mirar si hay base
await db.accounts.delete({ id });

// BIEN: baja y después decidir
await db.accounts.update({ id, active: false, deactivatedAt: new Date() });
if (!hasLegalBasis(record)) {
  await purgeOrAnonymize(record);
} else {
  notifyRetention(record, RETENTION);
}
```

---

## 3. Lista legal (España)

Comprobar cada punto. Si falta un dato humano (titular, NIF, email), el build de producción falla. No inventar el dato.

1. Política de privacidad.
2. Términos de servicio (aviso legal).
3. Política de reembolsos solo si hay cobros. Si no se cobra en la web, no inventar una.
4. Política de cookies.
5. Banner de consentimiento solo si hay cookies no esenciales. Si no las hay, no hay banner.
6. Revisar los consentimientos de los formularios.
7. No recoger datos innecesarios.
8. Auditar los SDK de terceros. No cargarlos al abrir la página si se puede esperar al clic (mapa, calendario, vídeo).
9. Quitar patrones oscuros.
10. Quitar tarifas ocultas. Los precios llevan el IVA y se dice.
11. Quitar reseñas falsas. Si se citan, son literales y enlazan a la ficha de origen.
12. Quitar afirmaciones sin respaldo (campeón, notas, accesos, «sin amoniaco»). Verificar o no publicar.
13. Accesibilidad: todo el texto.
14. Contraste de color corregido.
15. Navegación por teclado.
16. Datos del titular en un solo archivo (nombre, NIF, email). El domicilio y el teléfono salen de la fuente de negocio, no se duplican.
17. Las citas o los datos de menores los gestiona el padre, la madre o el tutor. La web no recoge datos de menores por su cuenta.
18. Enlace para darse de baja en los correos, si se envían correos.
19. Licenciar las fuentes y las imágenes. Autoalojar las fuentes. No cargar Google Fonts.
20. Vía para pedir acceso, rectificación y borrado. La baja inactiva. La supresión sigue el flujo de la sección 2.

### Terceros

- Un iframe, un script o un píxel de un tercero no se carga al abrir la web.
- Abrir WhatsApp, Maps o la ficha de reservas en otra pestaña es un enlace. El aviso de «se abre en nueva pestaña» va en el nombre accesible.
- Si más adelante hay analítica o cookies no necesarias, primero el banner con Aceptar y Rechazar, y se actualiza la política antes de activarlo.
- El calendario de reservas, si se incrusta, se abre al pulsar Reservar. Sin JavaScript, el enlace sigue llevando a la ficha.

### Medios y personas

- No publicar una foto o un vídeo del local hasta confirmar que es el local actual y que quienes salen han dado permiso.
- Marcar los medios dudosos como provisionales. Una foto real del sitio tiene prioridad sobre el vídeo.
- Si una foto es de una campaña o de un banco y salen personas, el pie lo dice. Esas personas no son el equipo ni el interior del negocio.
- No presentar imágenes generadas como si fueran el local.

---

## 4. Producto e interfaz

- **Mejora progresiva.** Sin JavaScript se lee, se usa lo esencial (llamar, escribir, reservar por enlace) y se ve el aviso legal. El movimiento es extra.
- **Accesibilidad de base.** Contraste AA como mínimo. Objetivos táctiles de 44 px. Foco visible de 3 px. Skip link. `lang` correcto. Un solo `h1`. Enlaces con texto claro.
- **Estados reales.** Vacío, error, carga y «aún no hay fotos» se diseñan. Si hay espera, hay un estado de carga de verdad, no un hueco.
- **URLs estables.** `/privacidad` y `/aviso-legal` no se cambian a la ligera. Si se mueven, redirección.
- **Precios en la carta, no en el párrafo.** Nombre, guía, precio, duración o tamaño. Lo que ponga «desde» o «consultar» se cierra antes de hacerlo.
- **Opiniones como citas**, con la fuente, no como tarjetas de marketing.
- **Un icono por grupo**, pocos, en línea. No una fila de tres cajas con icono.

---

## 5. Lo que no debe parecer hecho con IA

No usar estos patrones. Si ya están, quitarlos.

1. Degradado de morado a azul.
2. Texto del hero con degradado.
3. Emojis en los titulares.
4. La fuente Inter en todas partes.
5. Tarjetas con borde de color.
6. Tarjetas con glassmorphism.
7. Modo oscuro de bajo contraste.
8. Tres cajas con icono en fila.
9. Badge encima del titular.
10. Iconos Lucide en todas partes.
11. shadcn/UI sin tocar.
12. Fade-in al hacer scroll. Si hay una entrada, es una sola, corta, y con `prefers-reduced-motion` no se oculta nada.
13. Botones que se desvanecen al pasar el cursor.
14. Espaciado inconsistente. Solo una escala.
15. Guiones largos (em dash) en el copy.
16. Copy genérico de palabras de moda.
17. Acentos en serif cursiva.
18. Haz de luz que sigue al cursor.
19. La pareja Space Grotesk + Instrument Serif como uniforme de plantilla.
20. Grano sobre un degradado.
21. Degradados duros.
22. Iconos Lucide (repetido a propósito: no colarlos «solo en los botones»).
23. Fondo blanco puro.
24. Coloreado arcoíris.
25. Sombras proyectadas.
26. Tres tarjetas de características en fila.
27. Emojis.
28. Liquid glass.
29. Guiones largos otra vez. Tampoco el punto y coma en el copy visible: frase corta y punto.
30. Inter, Geist o Space Grotesk por defecto.
31. Franja de color a la izquierda de una tarjeta.
32. Testimonios falsos.
33. Rejillas bento.
34. Ventana de terminal como adorno.
35. La fórmula «No es X, es Y».
36. Viñetas con check.
37. Tres tarifas en columnas.
38. Una web sin nada real del producto o del local (precios, dirección, horario, fotos de verdad).
39. Esquinas muy redondas y botones pastilla. Un radio mínimo de 2 px es un filete, no una esquina blanda.
40. Morado y negro como paleta por defecto.
41. Pantallas de carga sin estado real.
42. Orbes radiales.
43. Rejillas de puntos.
44. Iconos de destello.
45. Flechas animadas de adorno. Una flecha de CTA puede moverse 2 px. No es un destello.
46. Publicar sin términos o sin aviso legal.
47. Publicar sin política de privacidad.
48. Animaciones al pasar el cursor, fuera de las pocas ya definidas (subrayado, precio, flecha de 2 px).
49. Colores neón.
50. Colores pastel básicos.

El único degradado que este proyecto se permitió es una capa oscura encima del vídeo de cabecera en el móvil, para que el título se lea. No es decoración. En otro proyecto, mismo criterio: degradado solo si sin él el texto no se lee.

---

## 6. Diseño visual de este proyecto

Sirve tal cual si el otro proyecto quiere la misma voz. Si no, se cambian los hex y las familias, y se mantienen las secciones 1 a 5.

La web se parece a una carta: tipografía seria, mucho aire, fotos reales, precios claros.

### Color

| Token | Valor | Uso |
|---|---|---|
| `--ink` | `#182c48` | Fondo principal |
| `--ink-soft` | `#121212` | Franjas oscuras, texto del botón primario |
| `--brass` | `#c5a059` | Acento, botón primario, filetes (5,7:1 sobre `--ink`) |
| `--brass-bright` | `#d4b06e` | Hover y foco |
| `--brass-ink` | `#7a5f2c` | Latón sobre crema (4,7:1) |
| `--brass-dim` | `#8f7340` | Solo decorativo. No usarlo para texto |
| `--cream` | `#eae4d8` | Texto sobre oscuro y fondo de la carta |
| `--cream-muted` | `#b7b0a3` | Texto secundario sobre oscuro |

No es negro con dorado de plantilla, ni morado, ni blanco puro. El ritmo de fondos alterna tinta y crema. No hace falta un modo oscuro aparte: la página ya es oscura y la carta es clara.

### Tipo

- Display: Cormorant Garamond, pesos 600 y 700, solo desde 24 px. Sin cursiva.
- Cuerpo: Manrope, pesos 400 a 800.
- Autoalojadas (Fontsource, licencia OFL). Nada de Google Fonts en runtime.
- El nombre de la marca manda en el primer pantallazo. Los titulares de sección pueden llegar a 4,5 rem. Una línea de latón corta antes del sobretítulo.

### Espacio, forma, iconos

Escala única:

| Token | Valor |
|---|---|
| `--s1` | 0,25 rem |
| `--s2` | 0,5 rem |
| `--s3` | 1 rem |
| `--s4` | 1,5 rem |
| `--s5` | 2 rem |
| `--s6` | 3 rem |
| `--s7` | 4,5 rem |
| `--s8` | 7 rem |

- Radio: 2 px.
- Sin sombras.
- Filetes de 1 px con el color de línea, no un marco de lámina ni un borde de color por tarjeta.
- Iconos Phosphor, pocos, metidos en el build. Aquí, cuatro, uno por grupo de la carta.
- El CTA principal lleva flecha diagonal. Al pasar el cursor se desplaza 2 px. Nada más.

### Composición

- Móvil: la imagen o el vídeo de cabecera a sangre, con la capa oscura bajo el texto.
- Escritorio: texto a la izquierda, imagen a la derecha, a altura completa y pegada al borde. Si el vídeo es vertical y pequeño, no se estira a todo el ancho. Tope de 44 vw.
- No desenfocar el vídeo para «arreglarlo». No ponerle un marco. Si hace falta nitidez, una foto horizontal ancha sustituye al vídeo.
- Sin tarjetas en el primer viewport.
- La carta de servicios es una lista: nombre, puntos, precio, duración.
- Las fotos de campaña van a ancho de sección, cada una seguida de los productos que le corresponden. No se apilan dos fotos sin lista en medio. Versión ancha y versión alta, para que el titular no baje de un tamaño legible en 320–412 px y la página no haga scroll horizontal.
- `object-fit: contain` en esos banners. No recortarlos con un aspecto fijo.

### Movimiento (nivel medio)

Permitido, y nada más:

- Entrada del hero, 0,7 s. La línea de latón se dibuja. El fondo hace un zoom lento de 20 s.
- Vídeo de fondo con botón de pausa. No arranca con `prefers-reduced-motion` ni con Save-Data. El vídeo secundario no se descarga hasta acercarse.
- Al hacer scroll, una entrada suave (opacidad y 12 px, una vez) en cabeceras, grupos y reseñas. Solo se oculta lo que está bajo la pantalla al cargar. Sin JavaScript, o con reduced-motion, todo se ve.
- El menú marca la sección visible (`aria-current`). El subrayado de los enlaces crece. El precio de una fila se resalta al pasar.
- Todo se apaga con `prefers-reduced-motion`.

### Copy

- Español de España. Frases cortas. Concretas. Sin punto y coma.
- Tuteo en esta web. En otro negocio, el tratamiento que use de verdad.
- Nombrar el sitio y los servicios reales. Sin superlativos que no se puedan comprobar.
- Sin eslóganes de marca traducidos («tu imprescindible», «arma secreta», «haz tu declaración»). El texto dice qué es el producto y dónde se compra.
- Lo que diga el envase manda sobre el resumen.

### Fotos

Nombres estables en `src/assets/photos/`. Se optimizan solas. El texto alternativo vive junto a los datos, no suelto en cada pantalla.

| Archivo | Dónde | Formato |
|---|---|---|
| `hero` | Cabecera | Horizontal, 2400 px de ancho |
| `about` | El local | Vertical 4:5 |
| `jose` (o la persona) | Trayectoria | Vertical 4:5 |
| `trabajo-1`, `trabajo-2`… | Galería | Mínimo 1200 px |

---

## 7. Cómo mirar otras webs

Inspiran estructura, ritmo y movimiento. No se copia código, ni fotos, ni paleta, ni efectos.

Referencias que se miraron:

- [lenis.dev](https://lenis.dev)
- [basement.studio](https://basement.studio)
- [shadergradient.co](https://shadergradient.co)
- [unicorn.studio](https://unicorn.studio)

Design DNA (`zanwei/design-dna`): sacar de un sitio de referencia la estructura, la escala, el espacio y la composición. Descartar sus colores y su dimensión de efectos. No guardar en el repo las capturas de terceros.

En este proyecto se midieron Premium Barbershop, Heritage, Barber & Co y Louivver. De ahí salió el aire, la carta de precios y el titular grande. No salió el negro con dorado ni el grano.

Otras skills, solo si el proyecto las pide. Se instalan una vez. No son un prompt que se repite:

1. Design DNA, primero.
2. GSAP (`GreenSock/gsap-skills`), si se pide movimiento de timeline.
3. Motion Design (`LottieFiles/motion-design-skill`), si hay Lottie o SVG animado.
4. Three.js (`CloudAl-X/threejs-skills`), si se pide una escena 3D.
5. Genjutsu (`Athevon/genjutsu`), como pase final de dirección.

Herramientas para revisar, no para decorar: Taste Skill, web-design-guidelines, awasome-design-md, imagen a código, y Playwright (pruebas de punta a punta, axe y capturas).

---

## 8. Orden al aplicarlas en un proyecto nuevo

1. Contexto real del negocio. Sin eso no hay precios, ni horario, ni frases.
2. Titular, NIF y email. Si faltan, el build de producción no pasa.
3. Aviso legal, privacidad y cookies, con los terceros que de verdad se usen.
4. Una fuente de datos. Las pantallas leen.
5. Paleta, tipo y escala de la sección 6, o las equivalentes del proyecto nuevo, escritas en un `DESIGN.md`.
6. La lista de la sección 5 como filtro antes de dar una pantalla por buena.
7. Pruebas de lo que no puede romperse: un precio, el aviso legal, que un tercero no se cargue solo, el contraste y el teclado.
