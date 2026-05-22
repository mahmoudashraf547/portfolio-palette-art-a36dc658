// Centralized pdf.js loader + rendering helpers with one explicit Vite-bundled worker.
import type { StoredFile } from "@/lib/portfolio-store";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;

export async function getPdfjs() {
  if (typeof window === "undefined") throw new Error("pdf.js is client-only");
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
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
const bytesCache = new Map<string, Uint8Array>();
const bytesInflight = new Map<string, Promise<Uint8Array>>();
const pageCountCache = new Map<string, number>();

export function getCachedThumb(file: StoredFile): PdfThumb | null {
  return cache.get(file.id) ?? null;
}

/** Fetch the file's raw bytes once and cache them so every PDF operation uses
 *  a stable buffer instead of reparsing the base64 data URL on each render. */
export async function getPdfBytes(file: StoredFile): Promise<Uint8Array> {
  const hit = bytesCache.get(file.id);
  if (hit) return hit;
  const existing = bytesInflight.get(file.id);
  if (existing) return existing;
  const p = (async () => {
    const res = await fetch(file.dataUrl);
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    bytesCache.set(file.id, bytes);
    return bytes;
  })();
  bytesInflight.set(file.id, p);
  try {
    return await p;
  } finally {
    bytesInflight.delete(file.id);
  }
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
    const bytes = await getPdfBytes(file);
    // pdf.js takes ownership of the buffer; pass a copy so the cached array
    // stays intact for later page-count and canvas rendering.
    const doc = await pdfjs.getDocument({ data: bytes.slice(0) }).promise;
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

export async function getPdfPageCount(file: StoredFile): Promise<number> {
  const hit = pageCountCache.get(file.id);
  if (hit) return hit;
  const pdfjs = await getPdfjs();
  const bytes = await getPdfBytes(file);
  const doc = await pdfjs.getDocument({ data: bytes.slice(0) }).promise;
  const pages = doc.numPages;
  pageCountCache.set(file.id, pages);
  await doc.cleanup();
  doc.destroy();
  return pages;
}

export async function renderPdfPageToCanvas(
  file: StoredFile,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  targetWidth: number
): Promise<void> {
  const pdfjs = await getPdfjs();
  const bytes = await getPdfBytes(file);
  const doc = await pdfjs.getDocument({ data: bytes.slice(0) }).promise;
  const page = await doc.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const outputScale = Math.min(window.devicePixelRatio || 1, 2);
  const cssWidth = Math.max(280, Math.floor(targetWidth));
  const scale = cssWidth / baseViewport.width;
  const viewport = page.getViewport({ scale: scale * outputScale });
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${Math.floor(viewport.height / outputScale)}px`;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
  page.cleanup();
  await doc.cleanup();
  doc.destroy();
}
