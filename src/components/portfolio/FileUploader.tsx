import { useRef, useState } from "react";
import { detectFileKind, readFileAsDataUrl, type StoredFile } from "@/lib/portfolio-store";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_SIZE = 8 * 1024 * 1024; // 8 MB stored as base64 in localStorage

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

  const handle = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    const f = files[0];
    if (f.size > MAX_SIZE) {
      setErr(`الملف كبير جداً (الحد الأقصى ${MAX_SIZE / 1024 / 1024} ميجابايت).`);
      return;
    }
    setErr(null);
    const dataUrl = await readFileAsDataUrl(f);
    const stored: StoredFile = {
      id: crypto.randomUUID(),
      name: f.name,
      kind: detectFileKind(f),
      dataUrl,
      size: f.size,
    };
    onChange(stored);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handle(e.dataTransfer.files);
        }}
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
      {value && (
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate max-w-[70%]">{value.name}</span>
          <Button size="sm" variant="ghost" onClick={() => onChange(null)}>
            <X className="h-3 w-3 mr-1" /> Remove
          </Button>
        </div>
      )}
      {err && <p className="text-xs text-destructive mt-1">{err}</p>}
    </div>
  );
}
