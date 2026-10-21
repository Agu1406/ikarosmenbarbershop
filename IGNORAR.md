# Instrucciones para la IA

Por favor, lee este archivo **entero** antes de diseñar, programar o cambiar la app.

No es un blog ni una lista de ideas sueltas. Es un encargo: **usa todo su contenido, dentro de lo posible**, en el diseño, el código, el copy y lo legal. Si un punto no aplica a este proyecto, dilo y no lo fuerces. Si un punto choca con la ley española o europea (RGPD, LOPDGDD, LSSI-CE), gana la ley.

Si el proyecto tiene `CONTEXT.md`, `DESIGN.md` u otras notas del negocio, léelas también y no inventes datos, reseñas, precios ni afirmaciones.

---

## 20 cosas que te pido que hagas para que la app no nos lleve a un juicio

Por favor, comprueba y aplica cada punto. Si falta, impléméntalo o deja claro qué dato humano hace falta.

1. Política de privacidad.
2. Términos de servicio.
3. Política de reembolsos.
4. Política de cookies.
5. Banner de consentimiento de cookies.
6. Revisar los consentimientos de los formularios.
7. No recoger datos innecesarios.
8. Auditar los SDK de terceros.
9. Quitar patrones oscuros.
10. Quitar tarifas ocultas.
11. Quitar reseñas falsas.
12. Quitar afirmaciones sin respaldo.
13. Accesibilidad: todo el texto.
14. Corregir el contraste de color.
15. Navegación por teclado.
16. Añadir los datos de la empresa.
17. Consentimiento de edad para datos de menores.
18. Enlace para darse de baja en los correos.
19. Licenciar las fuentes e imágenes que se usen.
20. Formulario de solicitud y de borrado de datos.

---

## Arquitectura y datos: te pido SOLID, DRY, Singleton y CRUD

Por favor, aplícalos siempre: SOLID, DRY, Singleton (solo donde haga falta una instancia compartida) y CRUD.

### SOLID

- S: una responsabilidad por módulo, componente o función.
- O: ampliar con código nuevo, no reescribiendo lo que ya cumple.
- L: una implementación sustituye a su contrato sin romper a quien la usa.
- I: interfaces o tipos estrechos; no mezclar reservas, legal y analítica en el mismo contrato.
- D: depender de datos y contratos (la fuente de verdad del negocio, por ejemplo `src/lib/data.ts`, y las APIs), no de detalles internos.

### DRY

Por favor, no dupliques precios, horarios, contacto, copy legal ni lógica de negocio. Una sola fuente de verdad. Extrae solo cuando haya repetición real.

### Singleton

Usa una sola instancia compartida para clientes, configuración o estado global (mapa, vídeo, menú). No conviertas un Singleton en un almacén de todo el programa.

### CRUD y la D

- C / R / U: crear, leer y actualizar con normalidad.
- D (Delete): inactivar. No borres a ciegas. No contradigas lo legal ya fijado en este archivo ni el derecho español o europeo.

Flujo que te pido ante una baja o una petición de supresión:

1. Inactivar siempre. La cuenta o el dato deja de usarse. El histórico se conserva.
2. ¿Hay base legal para conservar? (privacidad, RGPD / LOPDGDD, LSSI-CE, fiscal o mercantil).
   - No: suprimir o anonimizar de forma irreversible.
   - Sí: conservar solo lo cubierto por esa base y avisar qué se guarda, por qué y hasta cuándo.
3. Al cumplir el plazo: suprimir o anonimizar.

Plazos (si el proyecto tiene `RETENTION` o una política de privacidad, úsalos ahí y no los dupliques a mano):

- Citas, consultas y datos de contacto: 5 años desde el fin de la cita o de la última comunicación (artículo 1964 del Código Civil).
- Facturas y obligaciones tributarias: 4 años desde el fin del plazo de presentación del impuesto (artículo 66 de la Ley General Tributaria).
- Documentación mercantil: 6 años desde el último asiento (artículo 30 del Código de Comercio).
- Registros técnicos del servidor: el tiempo estrictamente necesario para la seguridad del servicio (artículo 6.1.f del RGPD).

En duda: no borres; inactiva y señala el choque.

---

## Principios que te pido en casi cualquier proyecto

### Código

- **KISS.** La solución más simple que cumple. Si un Singleton o una abstracción no ahorra trabajo, no está.
- **YAGNI.** No construyas cuentas, pagos, 3D o analítica «por si acaso». Se añade cuando hace falta, con la legalidad delante.
- **Separación de datos y presentación.** Una fuente de verdad (`data.ts`, un CMS, una API) y pantallas que solo leen. Es DRY aplicado al negocio.
- **Fallar en voz alta.** Un dato legal vacío, un precio mal puesto o un secreto en el repo deben romper el build o el test, no publicarse en silencio.
- **Composición antes que herencia.** Piezas pequeñas que se combinan (botón, enlace externo, fachada del mapa) mejor que una clase base gigante.
- **Idempotencia.** Un mismo clic, webhook o reintento no crea dos citas, dos cobros ni dos bajas.

### Datos, cuentas y ley

- **Minimización.** Recoge solo lo necesario (artículo 5 del RGPD). Encaja con el punto 7 de la lista legal.
- **Privilegio mínimo.** Cada pieza ve solo lo suyo: la web pública no ve facturas; el panel no ve contraseñas en claro.
- **Registro de auditoría, no de chismorreo.** Quién dio de baja, cuándo y por qué. Eso sostiene el CRUD: la D inactiva; la supresión de verdad queda por escrito.
- **Secretos fuera del repo.** `.env` local, variables en el alojamiento, nunca tokens en git.
- **Copias y restauración.** Un backup no sirve si no se ha restaurado nunca.

### Producto e interfaz

- **Mejora progresiva.** Sin JavaScript se lee, se usa lo esencial y se ve el aviso legal. El movimiento es extra.
- **Accesibilidad de base.** Contraste, teclado, un `h1`, textos de enlace claros. Encaja con los puntos 13 a 15 de la lista legal.
- **Estados reales.** Vacío, error, carga y «aún no hay contenido» se diseñan; no se deja un hueco blanco.
- **URLs estables.** Rutas como `/privacidad` y `/aviso-legal` no se cambian a la ligera; si se mueven, redirección.

### Qué te pido que no metas por defecto

- CQRS, microservicios, event sourcing o DDD completo: sirven en sistemas grandes; en el resto hinchan el código.
- Singleton no es universal: solo donde hace falta **una** instancia (cliente HTTP, menú, mapa). Usarlo para todo contradice SOLID.

---

## 50 cosas que te pido que no uses: la app no debe parecer hecha con IA / «vibecoded»

Por favor, evita todos estos patrones en el diseño. Si ya están, quítalos.

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
12. Fade-in al hacer scroll.
13. Botones que se desvanecen al pasar el cursor.
14. Espaciado inconsistente.
15. Guiones largos (em dash) en todas partes.
16. Copy genérico de palabras de moda.
17. Acentos en serif cursiva.
18. Haz de luz que sigue al cursor.
19. Space Grotesk + Instrument Serif.
20. Grano sobre un degradado.
21. Degradados duros.
22. Iconos Lucide.
23. Fondo blanco puro.
24. Coloreado arcoíris.
25. Sombras proyectadas.
26. Tres tarjetas de características en fila.
27. Emojis.
28. Liquid glass.
29. Guiones largos (em dash).
30. Inter / Geist / Space Grotesk.
31. Franja de color a la izquierda.
32. Testimonios falsos.
33. Rejillas bento.
34. Ventana de terminal.
35. «No es X, es Y».
36. Viñetas con check.
37. Tres tarifas.
38. Sin demos reales del producto.
39. Esquinas blandas.
40. Morado y negro.
41. Sin skeleton loaders.
42. Orbes radiales.
43. Rejillas de puntos.
44. Iconos de destello.
45. Flechas animadas.
46. Sin términos de servicio.
47. Sin política de privacidad.
48. Animaciones al pasar el cursor.
49. Colores neón.
50. Colores pastel básicos.

---

## Webs de las que te pido que te inspires

Las webs buenas no esconden nada. Si encajan con esta app, por favor toma inspiración de ellas (estructura, ritmo, movimiento), sin copiar código, fotos ni marca:

- A) [lenis.dev](https://lenis.dev) — scroll suave famoso.
- B) [basement.studio](https://basement.studio) — landing interactiva.
- C) [shadergradient.co](https://shadergradient.co) — fondos 3D animados.
- D) [unicorn.studio](https://unicorn.studio) — sitios de inspiración.

Si hace falta instalar skills, usa los repos públicos de abajo. No hace falta comentar «DESIGN» ni esperar un mensaje privado: los comandos y los repos están aquí.

---

## Skills: te pido que las uses cuando la app se mueva

Claude Code puede instalar skills. Por favor, actívalas si el trabajo lo pide. La mayoría de la gente no activa ni una, y por eso el resultado sigue pareciendo una plantilla por defecto.

Estas son las 5 que merecen la pena si construyes algo que se mueva. Empieza por Design DNA.

### 1. Three.js (`CloudAl-X/threejs-skills`)

Escenas 3D interactivas, controles de cámara, modelos GLTF, iluminación y partículas. Convierte una página plana en algo por lo que puedes moverte.

### 2. GSAP (`greensock/gsap-skills`)

La skill oficial de GreenSock. Animación con timeline, ScrollTrigger, revelado de texto, integración con React.

Si alguna vez te has preguntado por qué las webs buenas se sienten tan suaves, esto es.

### 3. Design DNA (`zanwei/design-dna`)

Apúntala a un sitio que encaje y extrae el diseño como tokens legibles por máquina. Paleta de color, tipografía, layout, espaciado.

Dejas de adivinar por qué algo se ve caro.

### 4. Motion Design (`lottiefiles/motion-design-skill`)

Hecha por el equipo de LottieFiles. Animación Lottie y SVG, keyframes, estados interactivos, y exportación directa a JSON o dotlottie.

### 5. Genjutsu (`AThevon/genjutsu`)

Dirección creativa y el último pase. Patrones de UI premiados, layout moderno, el pulido que separa «publicado» de «bueno».

### Cómo te pido que las uses

Las skills no son prompts. Las instalas una vez y conservas la capacidad, así que no hay que explicar lo mismo en cada sesión.

Si no sabes por dónde empezar, instala Design DNA primero.

Cambia cómo se ve todo lo demás que construyas, y se nota la diferencia enseguida.

Se apilan. Design DNA marca la dirección, GSAP y Motion Design se ocupan de cómo se mueve, Three.js añade profundidad, Genjutsu hace el pase final.

Las 5 son repos públicos. Nada de esto está de pago ni patrocinado.

Comandos / repos de instalación:

- Three.js (`CloudAl-X/threejs-skills`)
- GSAP (`GreenSock/gsap-skills`)
- Design DNA (`zanwei/design-dna`)
- Motion Design (`LottieFiles/motion-design-skill`)
- Genjutsu (`Athevon/genjutsu`)

---

## Cinco herramientas que te pido para que la web parezca de 10.000 €

Por favor, úsalas cuando ayuden, sin inflar el proyecto:

- Taste Skill.
- web-design-guidelines.
- awasome-design-md
- Image to code (¿Github?)
- Playwright, no sé qué de Microsoft.

---

## Contexto

Por favor, lee el contexto del negocio **antes** de diseñar o de ver referencias en vídeo. Si el proyecto tiene `CONTEXT.md`, ábrelo y úsalo como fuente de verdad. No inventes lo que no esté ahí.
