import type { ImageMetadata } from "astro";

const files = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/photos/*.{jpg,jpeg,png,webp,avif}",
  { eager: true },
);

const byName = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(files)) {
  const name = path.split("/").pop()!.replace(/\.[^.]+$/, "").toLowerCase();
  byName.set(name, mod.default);
}

/** Foto por nombre de archivo (sin extensión), o undefined si aún no existe. */
export function getPhoto(name: string): ImageMetadata | undefined {
  return byName.get(name);
}

/** Todas las fotos `trabajo-*`, en orden natural. */
export function getGallery(): ImageMetadata[] {
  return [...byName.entries()]
    .filter(([name]) => name.startsWith("trabajo-"))
    .sort(([a], [b]) => a.localeCompare(b, "es", { numeric: true }))
    .map(([, img]) => img);
}
