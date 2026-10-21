/**
 * Entrada sutil al hacer scroll (opacidad y 12 px), una sola vez.
 * Diseñado para no romper nada:
 *  - Sin JS, o con prefers-reduced-motion, todo se ve desde el principio.
 *  - Solo se ocultan los elementos que ya están por debajo de la pantalla al cargar,
 *    así que nunca hay parpadeo en lo que se ve al entrar.
 */
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion && "IntersectionObserver" in window) {
  const items = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
  const viewportBottom = window.innerHeight;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
  );

  let index = 0;
  for (const el of items) {
    const top = el.getBoundingClientRect().top;
    if (top < viewportBottom) continue; // ya visible al cargar: se deja tal cual
    // Pequeño escalonado entre hermanos consecutivos
    el.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    index++;
    el.classList.add("reveal-ready");
    observer.observe(el);
  }
}
