import { useEffect, useRef, useState } from "react";
import { usePortfolio, type TextValue } from "@/lib/portfolio-store";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Palette,
  Type,
} from "lucide-react";

interface Props {
  tkey: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

const FONTS = [
  "Cairo, sans-serif",
  "Tajawal, sans-serif",
  "Inter, sans-serif",
  "Georgia, serif",
  "'Playfair Display', serif",
  "'Courier New', monospace",
];

export function EditableText({
  tkey,
  as: Tag = "p" as any,
  className,
  placeholder,
  multiline = false,
}: Props) {
  const { state, setText } = usePortfolio();
  const { editMode, isAdmin } = useAuth();
  const editable = isAdmin && editMode;
  const val: TextValue = state.texts[tkey] || { text: "" };
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  // Keep DOM text in sync if value changes externally
  useEffect(() => {
    if (ref.current && ref.current.innerText !== val.text) {
      ref.current.innerText = val.text;
    }
  }, [val.text]);

  const style: React.CSSProperties = {
    fontFamily: val.fontFamily,
    fontSize: val.fontSize,
    fontWeight: val.fontWeight as any,
    color: val.color,
    textAlign: val.align,
  };

  const commit = () => {
    const text = ref.current?.innerText ?? "";
    if (text !== val.text) setText(tkey, { text });
  };

  const TagAny = Tag as any;

  return (
    <span className={cn("inline-block", editable && "relative")}>
      <TagAny
        ref={ref as any}
        contentEditable={editable}
        suppressContentEditableWarning
        spellCheck={false}
        onBlur={commit}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (!multiline && e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLElement).blur();
          }
        }}
        className={cn(className, editable && "edit-outline px-1 cursor-text outline-none")}
        style={style}
        data-placeholder={placeholder}
      >
        {val.text || (editable ? placeholder || "Click to edit…" : "")}
      </TagAny>
      {editable && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="absolute -top-3 -right-3 z-20 h-6 w-6 rounded-full glass-strong text-violet shadow flex items-center justify-center hover:scale-110 transition"
              title="Text style"
            >
              <Type className="h-3 w-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 glass-strong">
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-muted-foreground">Font family</label>
                <select
                  value={val.fontFamily || ""}
                  onChange={(e) => setText(tkey, { fontFamily: e.target.value || undefined })}
                  className="w-full mt-1 rounded border px-2 py-1 bg-white"
                >
                  <option value="">Default</option>
                  {FONTS.map((f) => (
                    <option key={f} value={f}>
                      {f.split(",")[0]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground flex-1">Size</label>
                <input
                  type="text"
                  placeholder="1rem"
                  value={val.fontSize || ""}
                  onChange={(e) => setText(tkey, { fontSize: e.target.value || undefined })}
                  className="w-24 rounded border px-2 py-1 bg-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground flex-1">Color</label>
                <input
                  type="color"
                  value={val.color || "#2a2050"}
                  onChange={(e) => setText(tkey, { color: e.target.value })}
                  className="h-8 w-12 rounded border"
                />
                <Palette className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={val.fontWeight === "700" ? "default" : "outline"}
                  onClick={() =>
                    setText(tkey, { fontWeight: val.fontWeight === "700" ? "400" : "700" })
                  }
                >
                  <Bold className="h-3 w-3" />
                </Button>
                <div className="ml-auto flex gap-1">
                  <Button
                    size="sm"
                    variant={val.align === "left" ? "default" : "outline"}
                    onClick={() => setText(tkey, { align: "left" })}
                  >
                    <AlignLeft className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant={val.align === "center" ? "default" : "outline"}
                    onClick={() => setText(tkey, { align: "center" })}
                  >
                    <AlignCenter className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant={val.align === "right" ? "default" : "outline"}
                    onClick={() => setText(tkey, { align: "right" })}
                  >
                    <AlignRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="w-full"
                onClick={() =>
                  setText(tkey, {
                    fontFamily: undefined,
                    fontSize: undefined,
                    fontWeight: undefined,
                    color: undefined,
                    align: undefined,
                  })
                }
              >
                Reset style
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </span>
  );
}
