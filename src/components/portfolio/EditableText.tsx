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
  Italic,
  Palette,
  Sparkles,
  Type,
  Underline,
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
  "'IBM Plex Sans Arabic', sans-serif",
  "Changa, sans-serif",
  "Georgia, serif",
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

  useEffect(() => {
    if (ref.current && ref.current.innerText !== val.text) {
      ref.current.innerText = val.text;
    }
  }, [val.text]);

  const hasGradient = val.gradientFrom && val.gradientTo;
  const style: React.CSSProperties = {
    fontFamily: val.fontFamily,
    fontSize: val.fontSize,
    fontWeight: val.fontWeight as any,
    color: hasGradient ? "transparent" : val.color,
    textAlign: val.align,
    lineHeight: val.lineHeight,
    letterSpacing: val.letterSpacing,
    opacity: val.opacity,
    fontStyle: val.italic ? "italic" : undefined,
    textDecoration: val.underline ? "underline" : undefined,
    backgroundImage: hasGradient
      ? `linear-gradient(135deg, ${val.gradientFrom}, ${val.gradientTo})`
      : undefined,
    WebkitBackgroundClip: hasGradient ? "text" : undefined,
    backgroundClip: hasGradient ? "text" : undefined,
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
        {val.text || (editable ? placeholder || "انقر للتعديل…" : "")}
      </TagAny>
      {editable && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="absolute -top-3 -right-3 z-20 h-6 w-6 rounded-full glass-strong text-violet shadow flex items-center justify-center hover:scale-110 transition"
              title="تنسيق النص"
            >
              <Type className="h-3 w-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 glass-strong max-h-[80vh] overflow-y-auto" dir="rtl">
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-muted-foreground">نوع الخط</label>
                <select
                  value={val.fontFamily || ""}
                  onChange={(e) => setText(tkey, { fontFamily: e.target.value || undefined })}
                  className="w-full mt-1 rounded border px-2 py-1 bg-white"
                >
                  <option value="">افتراضي</option>
                  {FONTS.map((f) => (
                    <option key={f} value={f}>
                      {f.split(",")[0]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">الحجم</label>
                  <input
                    type="text"
                    placeholder="1rem"
                    value={val.fontSize || ""}
                    onChange={(e) => setText(tkey, { fontSize: e.target.value || undefined })}
                    className="w-full mt-1 rounded border px-2 py-1 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">المسافة بين الأسطر</label>
                  <input
                    type="text"
                    placeholder="1.6"
                    value={val.lineHeight || ""}
                    onChange={(e) => setText(tkey, { lineHeight: e.target.value || undefined })}
                    className="w-full mt-1 rounded border px-2 py-1 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">تباعد الأحرف</label>
                  <input
                    type="text"
                    placeholder="0.02em"
                    value={val.letterSpacing || ""}
                    onChange={(e) => setText(tkey, { letterSpacing: e.target.value || undefined })}
                    className="w-full mt-1 rounded border px-2 py-1 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">الشفافية</label>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={val.opacity ?? 1}
                    onChange={(e) => setText(tkey, { opacity: parseFloat(e.target.value) })}
                    className="w-full mt-2"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground flex-1">اللون</label>
                <input
                  type="color"
                  value={val.color || "#2a2050"}
                  onChange={(e) => setText(tkey, { color: e.target.value, gradientFrom: undefined, gradientTo: undefined })}
                  className="h-8 w-12 rounded border"
                />
                <Palette className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="rounded-lg border border-dashed p-2 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3" /> تدرج لوني
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={val.gradientFrom || "#a78bfa"}
                    onChange={(e) => setText(tkey, { gradientFrom: e.target.value })}
                    className="h-7 w-10 rounded border"
                  />
                  <span className="text-xs">←</span>
                  <input
                    type="color"
                    value={val.gradientTo || "#60a5fa"}
                    onChange={(e) => setText(tkey, { gradientTo: e.target.value })}
                    className="h-7 w-10 rounded border"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => setText(tkey, { gradientFrom: undefined, gradientTo: undefined })}
                  >
                    إزالة
                  </Button>
                </div>
              </div>

              <div className="flex gap-1 flex-wrap">
                <Button size="sm" variant={val.fontWeight === "700" ? "default" : "outline"}
                  onClick={() => setText(tkey, { fontWeight: val.fontWeight === "700" ? "400" : "700" })}>
                  <Bold className="h-3 w-3" />
                </Button>
                <Button size="sm" variant={val.italic ? "default" : "outline"}
                  onClick={() => setText(tkey, { italic: !val.italic })}>
                  <Italic className="h-3 w-3" />
                </Button>
                <Button size="sm" variant={val.underline ? "default" : "outline"}
                  onClick={() => setText(tkey, { underline: !val.underline })}>
                  <Underline className="h-3 w-3" />
                </Button>
                <div className="mr-auto flex gap-1">
                  <Button size="sm" variant={val.align === "right" ? "default" : "outline"}
                    onClick={() => setText(tkey, { align: "right" })}>
                    <AlignRight className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant={val.align === "center" ? "default" : "outline"}
                    onClick={() => setText(tkey, { align: "center" })}>
                    <AlignCenter className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant={val.align === "left" ? "default" : "outline"}
                    onClick={() => setText(tkey, { align: "left" })}>
                    <AlignLeft className="h-3 w-3" />
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
                    lineHeight: undefined,
                    letterSpacing: undefined,
                    opacity: undefined,
                    italic: false,
                    underline: false,
                    gradientFrom: undefined,
                    gradientTo: undefined,
                  })
                }
              >
                إعادة تعيين التنسيق
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </span>
  );
}
