import { useState } from "react";
import {
  usePortfolio,
  type CardItem,
  type CardKind,
  type Section,
  type StoredFile,
} from "@/lib/portfolio-store";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove as _arrayMove,
  rectSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  FileText,
  GripVertical,
  Image as ImageIcon,
  Link as LinkIcon,
  Minus,
  Paperclip,
  Plus,
  Trash2,
  Type as TypeIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilePreviewDialog, FilePreviewRenderer } from "./FilePreview";
import { FileUploader } from "./FileUploader";
import { cn } from "@/lib/utils";

interface Props {
  area: string;
  className?: string;
}

export function SectionArea({ area, className }: Props) {
  const { state, addSection, reorderSections } = usePortfolio();
  const { isAdmin, editMode } = useAuth();
  const editable = isAdmin && editMode;
  const sections = state.sections[area] || [];

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    reorderSections(area, String(active.id), String(over.id));
  };

  return (
    <div className={cn("space-y-8", className)}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map((s, idx) => (
            <SortableSection key={s.id} area={area} section={s} index={idx} total={sections.length} />
          ))}
        </SortableContext>
      </DndContext>
      {editable && (
        <Button
          variant="outline"
          className="w-full border-dashed glass"
          onClick={() =>
            addSection(area, {
              id: crypto.randomUUID(),
              title: "قسم جديد",
              cards: [],
            })
          }
        >
          <Plus className="h-4 w-4 ml-1" /> إضافة قسم
        </Button>
      )}
    </div>
  );
}

function SortableSection({
  area,
  section,
  index,
  total,
}: {
  area: string;
  section: Section;
  index: number;
  total: number;
}) {
  const { isAdmin, editMode } = useAuth();
  const editable = isAdmin && editMode;
  const sortable = useSortable({ id: section.id, disabled: !editable });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    opacity: sortable.isDragging ? 0.6 : 1,
  };
  return (
    <div ref={sortable.setNodeRef} style={style}>
      <SectionBlock
        area={area}
        section={section}
        index={index}
        total={total}
        dragHandle={
          editable ? (
            <button
              {...sortable.attributes}
              {...sortable.listeners}
              className="cursor-grab active:cursor-grabbing text-violet/60 hover:text-violet p-1"
              title="اسحب لإعادة الترتيب"
            >
              <GripVertical className="h-5 w-5" />
            </button>
          ) : null
        }
      />
    </div>
  );
}

function SectionBlock({
  area,
  section,
  index,
  total,
  dragHandle,
}: {
  area: string;
  section: Section;
  index: number;
  total: number;
  dragHandle?: React.ReactNode;
}) {
  const {
    addCard,
    updateCard,
    removeCard,
    setCardFile,
    updateSection,
    removeSection,
    duplicateSection,
    moveSection,
    reorderCards,
  } = usePortfolio();
  const { isAdmin, editMode } = useAuth();
  const editable = isAdmin && editMode;
  const [previewFile, setPreviewFile] = useState<StoredFile | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    reorderCards(area, section.id, String(active.id), String(over.id));
  };

  const addBlock = (kind: CardKind) => {
    const titles: Record<CardKind, string> = {
      file: "عنصر جديد",
      text: "نص جديد",
      button: "زر جديد",
      divider: "",
    };
    addCard(area, section.id, { kind, title: titles[kind], description: "" });
  };

  return (
    <div className="glass-strong rounded-2xl p-6 fade-in-up">
      <div className="flex items-start justify-between gap-4 mb-4">
        {dragHandle}
        <div className="flex-1">
          {editable ? (
            <input
              value={section.title}
              onChange={(e) => updateSection(area, section.id, { title: e.target.value })}
              className="w-full text-xl md:text-2xl font-bold gradient-text bg-transparent border-b border-dashed border-violet/40 focus:outline-none focus:border-violet"
            />
          ) : (
            <h3 className="text-xl md:text-2xl font-bold gradient-text">{section.title}</h3>
          )}
          {editable ? (
            <textarea
              value={section.description || ""}
              placeholder="وصف اختياري"
              onChange={(e) => updateSection(area, section.id, { description: e.target.value })}
              className="mt-2 w-full text-sm bg-transparent border-b border-dashed border-violet/20 focus:outline-none focus:border-violet/60 resize-none"
              rows={2}
            />
          ) : section.description ? (
            <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
          ) : null}
        </div>
        {editable && (
          <div className="flex flex-wrap gap-1">
            <Button size="icon" variant="ghost" disabled={index === 0} onClick={() => moveSection(area, section.id, -1)}>
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" disabled={index === total - 1} onClick={() => moveSection(area, section.id, 1)}>
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => duplicateSection(area, section.id)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive"
              onClick={() => {
                if (confirm("حذف هذا القسم؟")) removeSection(area, section.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={section.cards.map((c) => c.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {section.cards.map((card) => (
              <SortableCard
                key={card.id}
                area={area}
                sectionId={section.id}
                card={card}
                onPreview={(f) => setPreviewFile(f)}
                editable={editable}
                updateCard={(p) => updateCard(area, section.id, card.id, p)}
                removeCard={() => removeCard(area, section.id, card.id)}
                setCardFile={(f) => setCardFile(area, section.id, card.id, f)}
              />
            ))}
            {editable && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-xl border-2 border-dashed border-violet/40 bg-white/40 hover:bg-white/70 min-h-[180px] flex flex-col items-center justify-center text-violet transition">
                    <Plus className="h-6 w-6" />
                    <span className="text-sm mt-1">إضافة عنصر</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" dir="rtl">
                  <DropdownMenuItem onClick={() => addBlock("file")}>
                    <Paperclip className="h-4 w-4 ml-2" /> ملف (PDF / صورة / فيديو / DOCX)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock("text")}>
                    <TypeIcon className="h-4 w-4 ml-2" /> كتلة نصية
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock("button")}>
                    <LinkIcon className="h-4 w-4 ml-2" /> زر / رابط
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock("divider")}>
                    <Minus className="h-4 w-4 ml-2" /> فاصل زخرفي
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {!editable && section.cards.length === 0 && (
              <p className="col-span-full text-sm text-muted-foreground italic">لا توجد عناصر بعد.</p>
            )}
          </div>
        </SortableContext>
      </DndContext>

      <FilePreviewDialog file={previewFile} open={!!previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}

function SortableCard(props: {
  area: string;
  sectionId: string;
  card: CardItem;
  editable: boolean;
  onPreview: (f: StoredFile) => void;
  updateCard: (p: Partial<CardItem>) => void;
  removeCard: () => void;
  setCardFile: (f: StoredFile | null) => void;
}) {
  const sortable = useSortable({ id: props.card.id, disabled: !props.editable });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    opacity: sortable.isDragging ? 0.5 : 1,
  };

  const kind: CardKind = props.card.kind || "file";

  if (kind === "divider") {
    return (
      <div ref={sortable.setNodeRef} style={style} className="col-span-full relative group">
        <div className="flex items-center gap-3 py-4">
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-violet/40 to-transparent" />
          <div className="h-2 w-2 rounded-full bg-violet/60" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-violet/40 to-transparent" />
        </div>
        {props.editable && (
          <div className="absolute top-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
            <button {...sortable.attributes} {...sortable.listeners} className="text-violet/60 p-1 cursor-grab">
              <GripVertical className="h-3 w-3" />
            </button>
            <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={props.removeCard}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      className="rounded-2xl bg-white/80 border border-white shadow-md hover:shadow-xl transition p-4 flex flex-col gap-3 relative"
    >
      {props.editable && (
        <button
          {...sortable.attributes}
          {...sortable.listeners}
          className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing text-violet/50 hover:text-violet bg-white/70 rounded p-1"
          title="اسحب"
        >
          <GripVertical className="h-3 w-3" />
        </button>
      )}

      {kind === "file" && (
        <>
          {props.card.file ? (
            <FilePreviewRenderer file={props.card.file} onClick={() => props.onPreview(props.card.file!)} />
          ) : (
            <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-violet/30 bg-gradient-to-br from-lavender/30 to-skyblue/30 flex items-center justify-center text-violet text-sm">
              {props.editable ? "ارفع ملفاً في الأسفل" : "لا يوجد ملف"}
            </div>
          )}
        </>
      )}

      {kind === "text" && (
        <div className="rounded-xl bg-gradient-to-br from-lavender/20 to-skyblue/20 p-4 min-h-[120px]">
          <FileText className="h-5 w-5 text-violet/60 mb-2" />
        </div>
      )}

      {kind === "button" && (
        <div className="flex items-center justify-center p-4">
          <a
            href={props.card.link || "#"}
            target={props.card.link ? "_blank" : undefined}
            rel="noreferrer"
            className="gradient-bg text-white px-6 py-3 rounded-full font-semibold shadow hover:shadow-xl hover:scale-105 transition inline-flex items-center gap-2"
            onClick={(e) => !props.card.link && e.preventDefault()}
          >
            <LinkIcon className="h-4 w-4" />
            {props.card.title || "زر"}
          </a>
        </div>
      )}

      <div className="flex-1">
        {props.editable ? (
          <input
            value={props.card.title}
            onChange={(e) => props.updateCard({ title: e.target.value })}
            className="w-full font-semibold text-sm bg-transparent border-b border-dashed border-violet/30 focus:outline-none focus:border-violet"
            placeholder={kind === "button" ? "نص الزر" : "العنوان"}
          />
        ) : (
          kind !== "button" && <h4 className="font-semibold text-sm">{props.card.title}</h4>
        )}
        {props.editable ? (
          <textarea
            value={props.card.description}
            onChange={(e) => props.updateCard({ description: e.target.value })}
            placeholder={kind === "text" ? "اكتب النص هنا..." : "الوصف"}
            className="mt-1 w-full text-xs text-muted-foreground bg-transparent border-b border-dashed border-violet/20 focus:outline-none focus:border-violet/60 resize-none"
            rows={kind === "text" ? 5 : 2}
          />
        ) : props.card.description ? (
          <p className={cn("mt-1 text-muted-foreground whitespace-pre-wrap", kind === "text" ? "text-sm leading-relaxed" : "text-xs line-clamp-3")}>
            {props.card.description}
          </p>
        ) : null}
        {kind === "button" && props.editable && (
          <input
            value={props.card.link || ""}
            onChange={(e) => props.updateCard({ link: e.target.value })}
            placeholder="https://..."
            className="mt-1 w-full text-xs bg-transparent border-b border-dashed border-violet/30 focus:outline-none focus:border-violet"
            dir="ltr"
          />
        )}
      </div>

      {kind === "file" && (
        <>
          {props.editable ? (
            <FileUploader value={props.card.file} onChange={props.setCardFile} compact label="رفع ملف" />
          ) : props.card.file ? (
            <Button size="sm" variant="outline" onClick={() => props.onPreview(props.card.file!)}>
              <Eye className="h-3 w-3 ml-1" /> معاينة
            </Button>
          ) : null}
        </>
      )}

      {props.editable && (
        <Button size="sm" variant="ghost" className="text-destructive" onClick={props.removeCard}>
          <Trash2 className="h-3 w-3 ml-1" /> حذف
        </Button>
      )}
    </div>
  );
}

// keep import to avoid tree-shake warning
void _arrayMove;
// silence unused import warning for ImageIcon (reserved for future block types)
void ImageIcon;
