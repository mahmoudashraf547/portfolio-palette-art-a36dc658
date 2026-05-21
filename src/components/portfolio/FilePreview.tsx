import { lazy, Suspense, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { StoredFile } from "@/lib/portfolio-store";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileType, Loader2, X } from "lucide-react";

/* PDF.js worker setup (client-only) */
let workerReady = false;
async function ensurePdfWorker() {
  if (workerReady || typeof window === "undefined") return;
  const { pdfjs } = await import("react-pdf");
  // @ts-expect-error vite worker import
  const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  workerReady = true;
}

const PdfDoc = lazy(async () => {
  await ensurePdfWorker();
  const m = await import("react-pdf");
  return { default: m.Document };
});
const PdfPage = lazy(async () => {
  const m = await import("react-pdf");
  return { default: m.Page };
});

/* ---------------- PDF Thumbnail ---------------- */
export function PdfThumbnail({ file, onClick }: { file: StoredFile; onClick?: () => void }) {
  const [pages, setPages] = useState<number | null>(null);
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-xl border bg-white/70 hover:shadow-xl transition shadow-md"
    >
      <div className="aspect-[3/4] w-full bg-gradient-to-br from-lavender/40 to-skyblue/40 flex items-center justify-center overflow-hidden">
        <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin text-violet" />}>
          <PdfDoc
            file={file.dataUrl}
            loading={<Loader2 className="h-6 w-6 animate-spin text-violet" />}
            onLoadSuccess={(d: any) => setPages(d.numPages)}
            error={<FileText className="h-10 w-10 text-violet" />}
          >
            <PdfPage pageNumber={1} width={240} renderTextLayer={false} renderAnnotationLayer={false} />
          </PdfDoc>
        </Suspense>
      </div>
      <div className="px-3 py-2 text-left">
        <div className="text-xs font-medium truncate">{file.name}</div>
        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
          <FileText className="h-3 w-3" /> PDF{pages ? ` · ${pages} pages` : ""}
        </div>
      </div>
    </button>
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
  useEffect(() => {
    const u = () => setWidth(Math.min(900, window.innerWidth - 80));
    u();
    window.addEventListener("resize", u);
    return () => window.removeEventListener("resize", u);
  }, []);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-5xl w-[95vw] h-[92vh] p-0 overflow-hidden glass-strong"
       
      >
        <DialogTitle className="sr-only">{file?.name || "PDF preview"}</DialogTitle>
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white/60">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-violet shrink-0" />
            <span className="text-sm font-medium truncate">{file?.name}</span>
            {numPages > 0 && (
              <span className="text-xs text-muted-foreground">· {numPages} pages</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {file && (
              <a href={file.dataUrl} download={file.name}>
                <Button size="sm" variant="outline">
                  <Download className="h-3 w-3 mr-1" /> Download
                </Button>
              </a>
            )}
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" /> Close
            </Button>
          </div>
        </div>
        <div className="overflow-auto h-[calc(92vh-56px)] bg-gradient-to-br from-lavender/20 to-skyblue/20 p-4 flex flex-col items-center gap-4">
          {file && (
            <Suspense
              fallback={
                <div className="flex items-center gap-2 text-violet">
                  <Loader2 className="h-5 w-5 animate-spin" /> Loading PDF…
                </div>
              }
            >
              <PdfDoc
                file={file.dataUrl}
                onLoadSuccess={(d: any) => setNumPages(d.numPages)}
                loading={
                  <div className="flex items-center gap-2 text-violet">
                    <Loader2 className="h-5 w-5 animate-spin" /> Loading PDF…
                  </div>
                }
                error={<div className="text-destructive">Failed to load PDF.</div>}
              >
                {Array.from({ length: numPages }, (_, i) => (
                  <div key={i} className="shadow-lg rounded overflow-hidden bg-white">
                    <PdfPage
                      pageNumber={i + 1}
                      width={width}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </div>
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
        const mammoth = await import("mammoth/mammoth.browser");
        const { value } = await (mammoth as any).convertToHtml({ arrayBuffer: buf });
        setHtml(value);
      } catch (e: any) {
        setErr(e?.message || "Failed to preview DOCX");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, file]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-4xl w-[95vw] h-[92vh] p-0 overflow-hidden glass-strong"
       
      >
        <DialogTitle className="sr-only">{file?.name || "Document preview"}</DialogTitle>
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white/60">
          <div className="flex items-center gap-2 min-w-0">
            <FileType className="h-4 w-4 text-violet shrink-0" />
            <span className="text-sm font-medium truncate">{file?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {file && (
              <a href={file.dataUrl} download={file.name}>
                <Button size="sm" variant="outline">
                  <Download className="h-3 w-3 mr-1" /> Download
                </Button>
              </a>
            )}
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" /> Close
            </Button>
          </div>
        </div>
        <div className="overflow-auto h-[calc(92vh-56px)] bg-white p-8">
          {loading && (
            <div className="flex items-center gap-2 text-violet">
              <Loader2 className="h-5 w-5 animate-spin" /> Converting document…
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
        <DialogTitle className="sr-only">{file?.name || "Video"}</DialogTitle>
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
        <div className="px-3 py-2 text-left bg-white/70">
          <div className="text-xs font-medium truncate">{file.name}</div>
          <div className="text-[10px] text-muted-foreground">Image</div>
        </div>
      </button>
    );
  if (file.kind === "video")
    return (
      <button onClick={onClick} className="group relative block w-full overflow-hidden rounded-xl border shadow-md hover:shadow-xl transition">
        <video src={file.dataUrl} className="aspect-[3/4] w-full object-cover bg-black" />
        <div className="px-3 py-2 text-left bg-white/70">
          <div className="text-xs font-medium truncate">{file.name}</div>
          <div className="text-[10px] text-muted-foreground">Video</div>
        </div>
      </button>
    );
  // docx, pptx, other
  return (
    <button onClick={onClick} className="group block w-full overflow-hidden rounded-xl border shadow-md hover:shadow-xl transition bg-white/70">
      <div className="aspect-[3/4] w-full bg-gradient-to-br from-lavender/40 to-skyblue/40 flex flex-col items-center justify-center gap-2">
        <FileType className="h-12 w-12 text-violet" />
        <span className="text-xs font-medium px-3 text-center break-all">{file.name}</span>
      </div>
      <div className="px-3 py-2 text-left">
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
  // other: offer download
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md glass-strong">
        <DialogTitle>{file.name}</DialogTitle>
        <p className="text-sm text-muted-foreground">
          Preview is not available for this file type. You can download it instead.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <a href={file.dataUrl} download={file.name}>
            <Button>
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
