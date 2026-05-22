// Centralized pdf.js loader + rendering helpers.
// Worker is loaded from a CDN that matches the installed pdfjs-dist version,
// which avoids the "fake worker" / module-specifier failures that occur when
// bundlers cannot resolve the .mjs worker entry in production.
import type { StoredFile } from "@/lib/portfolio-store";

type Pdfjs = typeof import("pdfjs-dist");
type PDFDocumentProxy = Awaited<ReturnType<Pdfjs["getDocument"]>["promise"]>;

let pdfjsPromise: Promise<Pdfjs> | null = null;

export async function getPdfjs(): Promise<Pdfjs> {
  if (typeof window === "undefined") throw new Error("pdf.js is client-only");
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs = await import("pdfjs-dist");
      const version = (pdfjs as any).version as string;
      // unpkg serves the exact matching worker for the installed version,
      // both in dev and in production builds (no bundler resolution required).
      pdfjs.GlobalWorkerOptions.workerSrc =
        `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
      return pdfjs;
    })();
  }
  return pdfjsPromise;
}

export interface PdfThumb {
  dataUrl: string;
  pages: number;
}

const thumbCache = new Map<string, PdfThumb>();
const thumbInflight = new Map<string, Promise<PdfThumb>>();
const docCache = new Map<string, Promise<PDFDocumentProxy>>();
// Track active render tasks per-canvas so we can cancel before starting new renders
const renderTasks = new WeakMap<HTMLCanvasElement, { promise: Promise<any>; cancel?: () => void }>();

export function getCachedThumb(file: StoredFile): PdfThumb | null {
  return thumbCache.get(file.id) ?? null;
}

/** Open (and cache) the PDF document for a given stored file. The same
 *  document instance is shared across the thumbnail, page count and all
 *  page renders, which avoids redundant network/parse work. */
function openDoc(file: StoredFile): Promise<PDFDocumentProxy> {
  const hit = docCache.get(file.id);
  if (hit) return hit;
  const p = (async () => {
    const pdfjs = await getPdfjs();
    return pdfjs.getDocument({ url: file.dataUrl, disableAutoFetch: true, disableStream: false })
      .promise;
  })();
  docCache.set(file.id, p);
  p.catch(() => docCache.delete(file.id));
  return p;
}

export function disposeDoc(fileId: string) {
  const p = docCache.get(fileId);
  if (!p) return;
  docCache.delete(fileId);
  p.then((d) => d.destroy()).catch(() => {});
  thumbCache.delete(fileId);
}

export async function getPdfPageCount(file: StoredFile): Promise<number> {
  const doc = await openDoc(file);
  return doc.numPages;
}

export async function generatePdfThumbnail(
  file: StoredFile,
  maxWidth = 360
): Promise<PdfThumb> {
  const hit = thumbCache.get(file.id);
  if (hit) return hit;
  const existing = thumbInflight.get(file.id);
  if (existing) return existing;

  const promise = (async () => {
    const doc = await openDoc(file);
    const page = await doc.getPage(1);
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(1.5, maxWidth / baseViewport.width);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D unavailable");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
    const result: PdfThumb = { dataUrl, pages: doc.numPages };
    thumbCache.set(file.id, result);
    page.cleanup();
    return result;
  })();

  thumbInflight.set(file.id, promise);
  try {
    return await promise;
  } finally {
    thumbInflight.delete(file.id);
  }
}

export async function renderPdfPageToCanvas(
  file: StoredFile,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  targetCssWidth: number
): Promise<void> {
  const doc = await openDoc(file);
  const page = await doc.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssWidth = Math.max(280, Math.floor(targetCssWidth));
  const cssScale = cssWidth / baseViewport.width;
  const viewport = page.getViewport({ scale: cssScale * dpr });

  // If there's an existing render for this canvas, cancel it BEFORE sizing
  const prev = renderTasks.get(canvas);
  if (prev && typeof prev.cancel === "function") {
    try {
      prev.cancel();
    } catch (e) {
      // ignore cancellation errors
    }
    renderTasks.delete(canvas);
  }

  // Initialize canvas backing store and styles AFTER cancellation to avoid
  // race conditions where an old render paints over a new canvas state.
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  // Make the canvas scale responsively: keep high-res backing store
  // but force CSS width to fill the parent and height to auto so it
  // scales down on mobile without cropping.
  canvas.style.width = `100%`;
  canvas.style.maxWidth = `100%`;
  canvas.style.display = `block`;
  try {
    canvas.style.setProperty("height", "auto", "important");
  } catch (e) {}

  // Clear any previous drawing immediately so the canvas never shows
  // duplicated content while a new render starts.
  try {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } catch (e) {}

  const renderTask: any = page.render({ canvasContext: ctx, viewport, canvas } as any);
  // store active task so future renders can cancel it
  renderTasks.set(canvas, renderTask);
  try {
    await renderTask.promise;
  } finally {
    renderTasks.delete(canvas);
    try {
      page.cleanup();
    } catch (e) {
      // ignore cleanup errors
    }
  }
}

/** Cancel any active render task associated with a canvas. Safe to call
 * before starting a new render or when switching pages. */
export function cancelRenderForCanvas(canvas: HTMLCanvasElement | null) {
  if (!canvas) return;
  const t = renderTasks.get(canvas);
  if (!t) return;
  try {
    if (typeof t.cancel === "function") t.cancel();
  } catch (e) {
    // ignore
  }
  renderTasks.delete(canvas);
}
