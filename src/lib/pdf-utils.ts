// Centralized pdf.js loader + thumbnail generator with caching.
import type { StoredFile } from "@/lib/portfolio-store";

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;

export async function getPdfjs() {
  if (typeof window === "undefined") throw new Error("pdf.js is client-only");
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs = await import("pdfjs-dist");
      const workerSrc = (
        await import("pdfjs-dist/build/pdf.worker.min.mjs?url" as string)
      ).default as string;
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
      return pdfjs;
    })();
  }
  return pdfjsPromise;
}

export interface PdfThumb {
  dataUrl: string;
  pages: number;
}

const cache = new Map<string, PdfThumb>();
const inflight = new Map<string, Promise<PdfThumb>>();

export function getCachedThumb(file: StoredFile): PdfThumb | null {
  return cache.get(file.id) ?? null;
}

export async function generatePdfThumbnail(
  file: StoredFile,
  maxWidth = 480
): Promise<PdfThumb> {
  const hit = cache.get(file.id);
  if (hit) return hit;
  const existing = inflight.get(file.id);
  if (existing) return existing;

  const promise = (async () => {
    const pdfjs = await getPdfjs();
    const res = await fetch(file.dataUrl);
    const buf = await res.arrayBuffer();
    const doc = await pdfjs.getDocument({ data: buf }).promise;
    const page = await doc.getPage(1);

    const baseViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(2, maxWidth / baseViewport.width);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D unavailable");

    // Fill white background to avoid transparent thumbnails
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
    const result: PdfThumb = { dataUrl, pages: doc.numPages };
    cache.set(file.id, result);
    // free resources
    page.cleanup();
    await doc.cleanup();
    doc.destroy();
    return result;
  })();

  inflight.set(file.id, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(file.id);
  }
}
