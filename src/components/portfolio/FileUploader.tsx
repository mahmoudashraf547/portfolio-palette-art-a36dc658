import { useRef, useState } from "react";
import { detectFileKind, type StoredFile } from "@/lib/portfolio-store";
import { cacheObjectUrl, putBlob } from "@/lib/file-storage";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_SIZE = 200 * 1024 * 1024; // 200 MB

interface Props {
  value?: StoredFile;
  onChange: (file: StoredFile | null) => void;
  label?: string;
  accept?: string;
  compact?: boolean;
}

export function FileUploader({ value, onChange, label = "رفع ملف", accept, compact }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const handle = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    const f = files[0];
    if (f.size > MAX_SIZE) {
      setErr(`الملف كبير جداً (الحد الأقصى ${Math.round(MAX_SIZE / 1024 / 1024)} ميجابايت).`);
      return;
    }
    setErr(null);
    setProgress(0);
    try {
      const id = crypto.randomUUID();
      // Persist the raw blob in IndexedDB (no base64 inflation, supports large files)
      await putBlob(id, f);
      setProgress(60);
      const url = cacheObjectUrl(id, f);
      setProgress(100);
      const stored: StoredFile = {
        id,
        name: f.name,
        kind: detectFileKind(f),
        dataUrl: url, // blob: URL (runtime-only; not persisted)
        size: f.size,
      };
      onChange(stored);
    } catch (e: any) {
      setErr(e?.message || "فشل رفع الملف");
    } finally {
      setTimeout(() => setProgress(null), 600);
    }
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
        className={cn(
          "flex items-center justify-center rounded-xl border-2 border-dashed transition cursor-pointer text-sm",
          compact ? "p-3" : "p-6",
          drag ? "border-violet bg-violet/5" : "border-violet/30 bg-white/40 hover:bg-white/70"
        )}
        onClick={() => inputRef.current?.click()}
      >
        <div className="flex items-center gap-2 text-violet">
          <Upload className="h-4 w-4" />
          <span>{value ? `استبدال: ${value.name}` : label}</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handle(e.target.files)}
        />
      </div>
      {progress !== null && (
        <div className="mt-2 h-1.5 w-full bg-violet/10 rounded overflow-hidden">
          <div className="h-full bg-violet transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
      {value && (
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate max-w-[70%]">{value.name}</span>
          <Button size="sm" variant="ghost" onClick={() => onChange(null)}>
            <X className="h-3 w-3 ml-1" /> إزالة
          </Button>
        </div>
      )}
      {err && <p className="text-xs text-destructive mt-1">{err}</p>}
    </div>
  );
}
