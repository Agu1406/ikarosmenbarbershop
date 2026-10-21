/**
 * Vídeo decorativo de fondo con control de pausa (WCAG 2.2.2).
 * Reglas:
 *  - No arranca solo con prefers-reduced-motion ni con Save-Data.
 *  - Con `lazy`, no descarga nada hasta que está cerca de la pantalla.
 *  - Se pausa fuera de pantalla y reanuda al volver, salvo que el usuario lo haya pausado.
 *
 * Marcado esperado dentro de `root`:
 *   <video data-src="/ruta.mp4" muted loop playsinline preload="none">
 *   <button data-video-toggle hidden aria-pressed="false"><span data-video-toggle-label></span></button>
 */
export function initBackgroundVideo(
  root: HTMLElement,
  options: {
    /** No descargar nada hasta estar cerca de la pantalla. */
    lazy: boolean;
    /** Con reduced-motion, cargar solo el primer fotograma (si no hay póster detrás). */
    frameWhenReduced: boolean;
  },
) {
  const video = root.querySelector<HTMLVideoElement>("video[data-src]");
  const toggle = root.querySelector<HTMLButtonElement>("[data-video-toggle]");
  const label = toggle?.querySelector<HTMLElement>("[data-video-toggle-label]");
  if (!video || !toggle || !label || !video.dataset.src) return;

  const src = video.dataset.src;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = Boolean(
    (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData,
  );
  const autoplay = !reduceMotion && !saveData;

  let userPaused = !autoplay;

  const render = () => {
    const paused = video.paused;
    toggle.setAttribute("aria-pressed", String(paused));
    label.textContent = paused ? "Reproducir vídeo de fondo" : "Pausar vídeo de fondo";
  };

  const play = () => {
    video.play().then(
      () => {
        video.classList.add("is-playing");
        render();
      },
      () => render(),
    );
  };

  const begin = () => {
    if (autoplay) {
      video.src = src;
      play();
    } else if (reduceMotion && options.frameWhenReduced) {
      // Solo el primer fotograma, sin movimiento.
      video.preload = "metadata";
      video.src = `${src}#t=0.1`;
      video.addEventListener("loadeddata", () => video.classList.add("is-playing"), {
        once: true,
      });
    }
    render();
  };

  toggle.hidden = false;
  render();

  toggle.addEventListener("click", () => {
    if (!video.getAttribute("src")) video.src = src;
    if (video.paused) {
      userPaused = false;
      play();
    } else {
      userPaused = true;
      video.pause();
      render();
    }
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (!video.getAttribute("src")) {
          begin();
        } else if (!userPaused && video.paused) {
          play();
        }
      } else if (!video.paused) {
        video.pause();
        render();
      }
    },
    { rootMargin: options.lazy ? "200px" : "0px" },
  );
  observer.observe(video);
}
