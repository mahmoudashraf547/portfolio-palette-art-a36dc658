import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { StoredFile } from "@/lib/portfolio-store";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileType, Loader2, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  generatePdfThumbnail,
  getCachedThumb,
  getPdfPageCount,
  renderPdfPageToCanvas,
} from "@/lib/pdf-utils";

/* ---------------- PDF Thumbnail ---------------- */
export function PdfThumbnail({ file, onClick }: { file: StoredFile; onClick?: () => void }) {
  const cached = getCachedThumb(file);
  const [thumb, setThumb] = useState<string | null>(cached?.dataUrl ?? null);
  const [pages, setPages] = useState<number | null>(cached?.pages ?? null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (thumb) return;
    let cancelled = false;
    generatePdfThumbnail(file)
      .then((res) => {
        if (cancelled) return;
        setThumb(res.dataUrl);
        setPages(res.pages);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [file.id, file.dataUrl, thumb]);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-xl border bg-white/70 hover:shadow-xl transition shadow-md"
    >
      <div className="aspect-[3/4] w-full bg-gradient-to-br from-lavender/40 to-skyblue/40 flex items-center justify-center overflow-hidden relative">
        {thumb ? (
          <img
            src={thumb}
            alt={file.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : error ? (
          <FileText className="h-12 w-12 text-violet/70" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Skeleton className="absolute inset-0 rounded-none bg-white/40" />
            <Loader2 className="h-6 w-6 animate-spin text-violet relative" />
            <span className="text-[10px] text-violet/70 relative">جاري التحضير…</span>
          </div>
        )}
        <span className="absolute top-2 left-2 text-[10px] font-bold tracking-wider bg-red-500 text-white px-2 py-0.5 rounded shadow z-10">
          PDF
        </span>
      </div>
      <div className="px-3 py-2 text-right">
        <div className="text-xs font-medium truncate">{file.name}</div>
        <div className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
          <FileText className="h-3 w-3" /> PDF{pages ? ` · ${pages} صفحة` : ""}
        </div>
      </div>
    </button>
  );
}

/* ---------------- Lazy-rendered single page ---------------- */
function LazyPdfPage({ pageNumber, width }: { pageNumber: number; width: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(pageNumber <= 2); // eager-render first 2

  useEffect(() => {
    if (visible || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  // Maintain space so virtual scroll works
  const placeholderHeight = Math.round(width * 1.41); // A4 ratio approx
  return (
    <div ref={ref} className="shadow-lg rounded overflow-hidden bg-white" style={{ minHeight: visible ? undefined : placeholderHeight, width }}>
      {visible ? (
        <PdfPage
          pageNumber={pageNumber}
          width={width}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          loading={
            <div style={{ height: placeholderHeight }} className="flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-violet" />
            </div>
          }
        />
      ) : (
        <Skeleton className="w-full h-full" style={{ height: placeholderHeight }} />
      )}
    </div>
  );
}

/* ---------------- PDF Modal Viewer ---------------- */
export function PdfPreviewModal({
  file,
  open,
  onClose,
}: {
  file: StoredFile | null;
  open: boolean;
  onClose: () => void;
}) {
  const [numPages, setNumPages] = useState(0);
  const [width, setWidth] = useState(900);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  useEffect(() => {
    const u = () => setWidth(Math.min(900, window.innerWidth - 80));
    u();
    window.addEventListener("resize", u);
    return () => window.removeEventListener("resize", u);
  }, []);

  // Preload bytes once per file id so react-pdf gets a stable reference.
  useEffect(() => {
    if (!open || !file) return;
    setBytes(null);
    setNumPages(0);
    setLoadErr(null);
    let cancelled = false;
    getPdfBytes(file)
      .then((b) => {
        if (!cancelled) setBytes(b);
      })
      .catch((e) => {
        if (!cancelled) setLoadErr(e?.message || "تعذّر تحميل المستند");
      });
    return () => {
      cancelled = true;
    };
  }, [open, file?.id]);

  // react-pdf compares file by reference; memoize the wrapper object.
  const fileProp = useMemo(
    () => (bytes ? { data: bytes.slice(0) } : null),
    [bytes]
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl w-[95vw] h-[92vh] p-0 overflow-hidden glass-strong">
        <DialogTitle className="sr-only">{file?.name || "معاينة PDF"}</DialogTitle>
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white/60">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-violet shrink-0" />
            <span className="text-sm font-medium truncate">{file?.name}</span>
            {numPages > 0 && (
              <span className="text-xs text-muted-foreground">· {numPages} صفحة</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {file && (
              <a href={file.dataUrl} download={file.name}>
                <Button size="sm" variant="outline">
                  <Download className="h-3 w-3 ml-1" /> تحميل
                </Button>
              </a>
            )}
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" /> إغلاق
            </Button>
          </div>
        </div>
        <div className="overflow-auto h-[calc(92vh-56px)] bg-gradient-to-br from-lavender/20 to-skyblue/20 p-4 flex flex-col items-center gap-4">
          {loadErr && (
            <div className="text-destructive text-sm pt-8">{loadErr}</div>
          )}
          {!loadErr && !fileProp && (
            <div className="flex flex-col items-center gap-3 text-violet pt-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">جاري تحميل المستند…</span>
              <Skeleton className="w-[80%] max-w-[600px] h-[800px]" />
            </div>
          )}
          {fileProp && (
            <Suspense
              fallback={
                <div className="flex flex-col items-center gap-3 text-violet pt-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-sm">جاري عرض المستند…</span>
                </div>
              }
            >
              <PdfDoc
                file={fileProp}
                onLoadSuccess={(d: any) => setNumPages(d.numPages)}
                onLoadError={(e: any) =>
                  setLoadErr(e?.message || "تعذّر تحميل المستند")
                }
                loading={
                  <div className="flex flex-col items-center gap-3 text-violet pt-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-sm">جاري عرض المستند…</span>
                  </div>
                }
                error={<div className="text-destructive">تعذّر تحميل المستند.</div>}
              >
                {Array.from({ length: numPages }, (_, i) => (
                  <LazyPdfPage key={i} pageNumber={i + 1} width={width} />
                ))}
              </PdfDoc>
            </Suspense>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- DOCX Modal ---------------- */
export function DocxPreviewModal({
  file,
  open,
  onClose,
}: {
  file: StoredFile | null;
  open: boolean;
  onClose: () => void;
}) {
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !file) return;
    setLoading(true);
    setErr(null);
    setHtml("");
    (async () => {
      try {
        const res = await fetch(file.dataUrl);
        const buf = await res.arrayBuffer();
        const mammoth: any = await import("mammoth");
        const { value } = await (mammoth as any).convertToHtml({ arrayBuffer: buf });
        setHtml(value);
      } catch (e: any) {
        setErr(e?.message || "تعذّر معاينة الملف");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, file]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] h-[92vh] p-0 overflow-hidden glass-strong">
        <DialogTitle className="sr-only">{file?.name || "معاينة المستند"}</DialogTitle>
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white/60">
          <div className="flex items-center gap-2 min-w-0">
            <FileType className="h-4 w-4 text-violet shrink-0" />
            <span className="text-sm font-medium truncate">{file?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {file && (
              <a href={file.dataUrl} download={file.name}>
                <Button size="sm" variant="outline">
                  <Download className="h-3 w-3 ml-1" /> تحميل
                </Button>
              </a>
            )}
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" /> إغلاق
            </Button>
          </div>
        </div>
        <div className="overflow-auto h-[calc(92vh-56px)] bg-white p-8">
          {loading && (
            <div className="flex items-center gap-2 text-violet">
              <Loader2 className="h-5 w-5 animate-spin" /> جاري تحويل المستند…
            </div>
          )}
          {err && <div className="text-destructive">{err}</div>}
          {html && (
            <div
              className="prose prose-slate max-w-none docx-preview"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Video / Image / Generic ---------------- */
export function VideoPreviewModal({
  file,
  open,
  onClose,
}: {
  file: StoredFile | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden glass-strong">
        <DialogTitle className="sr-only">{file?.name || "فيديو"}</DialogTitle>
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white/60">
          <span className="text-sm font-medium truncate">{file?.name}</span>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        {file && (
          <video controls className="w-full max-h-[80vh] bg-black" src={file.dataUrl} />
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Unified Renderer ---------------- */
export function FilePreviewRenderer({
  file,
  onClick,
}: {
  file: StoredFile;
  onClick?: () => void;
}) {
  if (file.kind === "pdf") return <PdfThumbnail file={file} onClick={onClick} />;
  if (file.kind === "image")
    return (
      <button onClick={onClick} className="group block w-full overflow-hidden rounded-xl border shadow-md hover:shadow-xl transition">
        <img src={file.dataUrl} alt={file.name} className="aspect-[3/4] w-full object-cover" />
        <div className="px-3 py-2 text-right bg-white/70">
          <div className="text-xs font-medium truncate">{file.name}</div>
          <div className="text-[10px] text-muted-foreground">صورة</div>
        </div>
      </button>
    );
  if (file.kind === "video")
    return (
      <button onClick={onClick} className="group relative block w-full overflow-hidden rounded-xl border shadow-md hover:shadow-xl transition">
        <video src={file.dataUrl} className="aspect-[3/4] w-full object-cover bg-black" />
        <div className="px-3 py-2 text-right bg-white/70">
          <div className="text-xs font-medium truncate">{file.name}</div>
          <div className="text-[10px] text-muted-foreground">فيديو</div>
        </div>
      </button>
    );
  return (
    <button onClick={onClick} className="group block w-full overflow-hidden rounded-xl border shadow-md hover:shadow-xl transition bg-white/70">
      <div className="aspect-[3/4] w-full bg-gradient-to-br from-lavender/40 to-skyblue/40 flex flex-col items-center justify-center gap-2">
        <FileType className="h-12 w-12 text-violet" />
        <span className="text-xs font-medium px-3 text-center break-all">{file.name}</span>
      </div>
      <div className="px-3 py-2 text-right">
        <div className="text-xs font-medium truncate">{file.name}</div>
        <div className="text-[10px] text-muted-foreground uppercase">{file.kind}</div>
      </div>
    </button>
  );
}

/* ---------------- Preview Dispatcher ---------------- */
export function FilePreviewDialog({
  file,
  open,
  onClose,
}: {
  file: StoredFile | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!file) return null;
  if (file.kind === "pdf") return <PdfPreviewModal file={file} open={open} onClose={onClose} />;
  if (file.kind === "docx") return <DocxPreviewModal file={file} open={open} onClose={onClose} />;
  if (file.kind === "video") return <VideoPreviewModal file={file} open={open} onClose={onClose} />;
  if (file.kind === "image")
    return (
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-5xl p-0 glass-strong overflow-hidden">
          <DialogTitle className="sr-only">{file.name}</DialogTitle>
          <div className="flex items-center justify-between px-4 py-3 border-b bg-white/60">
            <span className="text-sm font-medium truncate">{file.name}</span>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <img src={file.dataUrl} alt={file.name} className="w-full max-h-[85vh] object-contain bg-black/5" />
        </DialogContent>
      </Dialog>
    );
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md glass-strong">
        <DialogTitle>{file.name}</DialogTitle>
        <p className="text-sm text-muted-foreground">
          لا تتوفّر معاينة لهذا النوع من الملفات. يمكنك تحميله بدلاً من ذلك.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            إغلاق
          </Button>
          <a href={file.dataUrl} download={file.name}>
            <Button>
              <Download className="h-4 w-4 ml-1" /> تحميل
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
