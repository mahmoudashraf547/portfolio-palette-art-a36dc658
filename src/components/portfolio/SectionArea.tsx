import { useState } from "react";
import { usePortfolio, type CardItem, type Section, type StoredFile } from "@/lib/portfolio-store";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  Plus,
  Trash2,
} from "lucide-react";
import { FilePreviewDialog, FilePreviewRenderer } from "./FilePreview";
import { FileUploader } from "./FileUploader";
import { cn } from "@/lib/utils";

interface Props {
  area: string;
  /** Optional override title (otherwise sections render their own titles) */
  className?: string;
}

export function SectionArea({ area, className }: Props) {
  const { state, addSection, removeSection, duplicateSection, moveSection, updateSection } =
    usePortfolio();
  const { isAdmin, editMode } = useAuth();
  const editable = isAdmin && editMode;
  const sections = state.sections[area] || [];

  return (
    <div className={cn("space-y-8", className)}>
      {sections.map((s, idx) => (
        <SectionBlock key={s.id} area={area} section={s} index={idx} total={sections.length} />
      ))}
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

  function _unused() {
    return { removeSection, duplicateSection, moveSection, updateSection };
  }
}

function SectionBlock({
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
  const {
    addCard,
    updateCard,
    removeCard,
    setCardFile,
    updateSection,
    removeSection,
    duplicateSection,
    moveSection,
  } = usePortfolio();
  const { isAdmin, editMode } = useAuth();
  const editable = isAdmin && editMode;
  const [previewFile, setPreviewFile] = useState<StoredFile | null>(null);

  return (
    <div className="glass-strong rounded-2xl p-6 fade-in-up">
      <div className="flex items-start justify-between gap-4 mb-4">
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
              placeholder="Optional description"
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
                if (confirm("Delete this section?")) removeSection(area, section.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {section.cards.map((card) => (
          <CardBlock
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
          <button
            onClick={() => addCard(area, section.id)}
            className="rounded-xl border-2 border-dashed border-violet/40 bg-white/40 hover:bg-white/70 min-h-[180px] flex flex-col items-center justify-center text-violet transition"
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm mt-1">Add item</span>
          </button>
        )}
        {!editable && section.cards.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground italic">No items yet.</p>
        )}
      </div>

      <FilePreviewDialog file={previewFile} open={!!previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}

function CardBlock({
  card,
  editable,
  onPreview,
  updateCard,
  removeCard,
  setCardFile,
}: {
  area: string;
  sectionId: string;
  card: CardItem;
  editable: boolean;
  onPreview: (f: StoredFile) => void;
  updateCard: (p: Partial<CardItem>) => void;
  removeCard: () => void;
  setCardFile: (f: StoredFile | null) => void;
}) {
  return (
    <div className="rounded-2xl bg-white/80 border border-white shadow-md hover:shadow-xl transition p-4 flex flex-col gap-3">
      {card.file ? (
        <FilePreviewRenderer file={card.file} onClick={() => onPreview(card.file!)} />
      ) : (
        <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-violet/30 bg-gradient-to-br from-lavender/30 to-skyblue/30 flex items-center justify-center text-violet text-sm">
          {editable ? "Upload a file below" : "No file"}
        </div>
      )}

      <div className="flex-1">
        {editable ? (
          <input
            value={card.title}
            onChange={(e) => updateCard({ title: e.target.value })}
            className="w-full font-semibold text-sm bg-transparent border-b border-dashed border-violet/30 focus:outline-none focus:border-violet"
          />
        ) : (
          <h4 className="font-semibold text-sm">{card.title}</h4>
        )}
        {editable ? (
          <textarea
            value={card.description}
            onChange={(e) => updateCard({ description: e.target.value })}
            placeholder="Description"
            className="mt-1 w-full text-xs text-muted-foreground bg-transparent border-b border-dashed border-violet/20 focus:outline-none focus:border-violet/60 resize-none"
            rows={2}
          />
        ) : card.description ? (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-3">{card.description}</p>
        ) : null}
      </div>

      {editable ? (
        <FileUploader value={card.file} onChange={setCardFile} compact label="Upload file" />
      ) : card.file ? (
        <Button size="sm" variant="outline" onClick={() => onPreview(card.file!)}>
          <Eye className="h-3 w-3 mr-1" /> Preview
        </Button>
      ) : null}

      {editable && (
        <Button size="sm" variant="ghost" className="text-destructive" onClick={removeCard}>
          <Trash2 className="h-3 w-3 mr-1" /> Delete
        </Button>
      )}
    </div>
  );
}
