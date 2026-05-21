import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/* ----------------------------- Types ----------------------------- */
export type FileKind = "pdf" | "docx" | "pptx" | "image" | "video" | "other";

export interface StoredFile {
  id: string;
  name: string;
  kind: FileKind;
  dataUrl: string; // base64 data URL
  size: number;
}

export interface CardItem {
  id: string;
  title: string;
  description: string;
  file?: StoredFile;
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  cards: CardItem[];
}

export interface TextValue {
  text: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  align?: "left" | "center" | "right";
}

export type Texts = Record<string, TextValue>;

export interface PortfolioState {
  texts: Texts;
  files: Record<string, StoredFile>; // for hero logo, etc.
  sections: Record<string, Section[]>; // key = tab/area id
}

/* ----------------------------- Defaults ----------------------------- */
const t = (text: string): TextValue => ({ text });

const DEFAULT: PortfolioState = {
  texts: {
    "site.title": t("Teaching Practicum Portfolio"),
    "site.subtitle": t("For Student Teacher: Rayyan Al-Nabhani"),
    "site.major": t("Major: Art Education"),
    "hero.welcome": t("Welcome to my Portfolio"),
    "hero.intro": t(
      "An artistic journey through my teaching practicum — reflections, lesson plans, research, and creative projects that shaped my growth as an art educator."
    ),
    "hero.cta": t("Enter Portfolio"),

    "home.intro.title": t("Introduction"),
    "home.intro.body": t(
      "I am a student teacher specializing in Art Education, passionate about nurturing creativity, visual literacy, and self-expression in young learners. This portfolio gathers evidence of my growth across the six axes of the teaching practicum."
    ),
    "home.philosophy.title": t("Teaching Philosophy"),
    "home.philosophy.body": t(
      "I believe art education empowers students to think critically, communicate visually, and embrace their unique voice. My classroom is a safe studio where curiosity, experimentation, and reflection guide every lesson."
    ),
    "home.cv.title": t("CV / Resume"),
    "home.cv.body": t("Upload your CV (PDF or DOCX) so visitors can preview it directly."),
    "home.reflective.title": t("Reflective Papers"),

    "tab2.title": t("Academic Competency & Specialized Expertise"),
    "tab2.intro": t(
      "Evidence of curriculum design, content knowledge, and reflective practice in art education."
    ),
    "tab2.other.title": t("Other Coursework"),

    "tab3.title": t("Diversity in Teaching"),
    "tab3.intro": t("Lesson plans, peer visits, and family engagement evidence."),
    "tab3.g6.title": t("Grade 6 — Lesson Plans"),
    "tab3.g7.title": t("Grade 7 — Lesson Plans"),

    "tab4.title": t("Professional Values & Attitudes"),
    "tab4.intro": t("Professionalism, ethics, and personal philosophy in practice."),

    "tab5.title": t("Research Culture & Lifelong Learning"),
    "tab5.intro": t("Action research, workshops, and continuous professional development."),
    "tab5.prev.title": t("Previous Projects"),

    "tab6.title": t("Technological Skills"),
    "tab6.intro": t("Integrating technology meaningfully into art education."),

    "contact.title": t("Get in Touch"),
    "contact.intro": t("Feel free to reach out for collaboration, feedback, or questions."),
    "contact.email": t("rayyanalnabhani23@gmail.com"),
    "contact.phone": t("97550512"),
  },
  files: {},
  sections: {
    "home.reflective": [
      {
        id: "rp1",
        title: "Reflective Paper",
        cards: [
          { id: "c1", title: "Reflection 1", description: "First reflective paper from the practicum." },
          { id: "c2", title: "Reflection 2", description: "Mid-term reflection on classroom practice." },
          { id: "c3", title: "Reflection 3", description: "Final reflection summarizing growth." },
        ],
      },
    ],
    "tab2.main": [
      { id: "unit1", title: "Developed Unit Plan 1", cards: [{ id: "u1", title: "Unit Plan", description: "Comprehensive art unit plan." }] },
      { id: "axis1", title: "Reflective Paper for Axis 1", cards: [{ id: "a1", title: "Axis 1 Reflection", description: "" }] },
      { id: "spec", title: "Specialized Reflective Papers", cards: [
        { id: "s1", title: "Paper 1", description: "" },
        { id: "s2", title: "Paper 2", description: "" },
        { id: "s3", title: "Paper 3", description: "" },
      ]},
    ],
    "tab2.other": [
      { id: "curr", title: "Curriculum Course", cards: [] },
      { id: "tm1", title: "Teaching Methods 1", cards: [] },
      { id: "tm2", title: "Teaching Methods 2", cards: [] },
      { id: "proj", title: "Major Projects", cards: [] },
    ],
    "tab3.main": [
      { id: "axisR", title: "Reflective Paper for the Axis", cards: [{ id: "x1", title: "Reflection", description: "" }] },
    ],
    "tab3.g6": [
      { id: "g6lessons", title: "Grade 6 Lessons", cards: [
        { id: "l1", title: "Lesson 1", description: "Color theory introduction." },
      ]},
    ],
    "tab3.g7": [
      { id: "g7lessons", title: "Grade 7 Lessons", cards: [
        { id: "l1", title: "Lesson 1", description: "Composition fundamentals." },
      ]},
    ],
    "tab3.extras": [
      { id: "comp", title: "Comprehensive Reflective Paper", cards: [] },
      { id: "peer", title: "Peer Visit Evidence", cards: [] },
      { id: "parent", title: "Parent Communication Form", cards: [] },
    ],
    "tab4.main": [
      { id: "axisR", title: "Reflective Paper for the Axis", cards: [] },
      { id: "phil", title: "My Teaching Philosophy", cards: [] },
      { id: "prof", title: "Professionalism Scenario-Based Assessment Tool", cards: [] },
      { id: "att", title: "Attendance and Departure Record", cards: [] },
    ],
    "tab5.main": [
      { id: "axisR", title: "Reflective Paper for the Axis", cards: [] },
      { id: "action", title: "Action Research Project", cards: [] },
      { id: "pd", title: "Professional Development Evidence", cards: [] },
      { id: "workshop", title: "Art Workshop Plans", cards: [] },
    ],
    "tab5.prev": [
      { id: "meas", title: "Measurement and Evaluation Project", cards: [] },
      { id: "psych", title: "Psychology Project", cards: [] },
      { id: "special", title: "Special Needs Learners Project", cards: [] },
      { id: "exh", title: "Specialized Exhibitions", cards: [] },
    ],
    "tab6.main": [
      { id: "axisR", title: "Reflective Paper for the Axis", cards: [] },
      { id: "tech", title: "Technology Integration in Teaching Plans and Lessons", cards: [] },
      { id: "skills", title: "Software and Device Skills", cards: [] },
      { id: "pres", title: "Distinguished Presentations", cards: [] },
      { id: "ws", title: "Worksheets", cards: [] },
    ],
  },
};

/* ----------------------------- Persistence ----------------------------- */
const STORAGE_KEY = "portfolio-state-v1";

function loadState(): PortfolioState {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw);
    return {
      texts: { ...DEFAULT.texts, ...(parsed.texts || {}) },
      files: { ...DEFAULT.files, ...(parsed.files || {}) },
      sections: { ...DEFAULT.sections, ...(parsed.sections || {}) },
    };
  } catch {
    return DEFAULT;
  }
}

/* ----------------------------- Context ----------------------------- */
interface PortfolioContextValue {
  state: PortfolioState;
  setText: (key: string, value: Partial<TextValue>) => void;
  setFile: (key: string, file: StoredFile | null) => void;
  // Sections
  addSection: (area: string, section: Section) => void;
  updateSection: (area: string, id: string, patch: Partial<Section>) => void;
  removeSection: (area: string, id: string) => void;
  duplicateSection: (area: string, id: string) => void;
  moveSection: (area: string, id: string, dir: -1 | 1) => void;
  // Cards
  addCard: (area: string, sectionId: string, card?: Partial<CardItem>) => void;
  updateCard: (area: string, sectionId: string, cardId: string, patch: Partial<CardItem>) => void;
  removeCard: (area: string, sectionId: string, cardId: string) => void;
  setCardFile: (area: string, sectionId: string, cardId: string, file: StoredFile | null) => void;
  resetAll: () => void;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PortfolioState>(DEFAULT);

  useEffect(() => {
    setState(loadState());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Failed to persist portfolio state:", e);
    }
  }, [state]);

  const setText: PortfolioContextValue["setText"] = (key, value) =>
    setState((s) => ({
      ...s,
      texts: { ...s.texts, [key]: { ...(s.texts[key] || { text: "" }), ...value } },
    }));

  const setFile: PortfolioContextValue["setFile"] = (key, file) =>
    setState((s) => {
      const next = { ...s.files };
      if (file) next[key] = file;
      else delete next[key];
      return { ...s, files: next };
    });

  const updateArea = (area: string, fn: (list: Section[]) => Section[]) =>
    setState((s) => ({ ...s, sections: { ...s.sections, [area]: fn(s.sections[area] || []) } }));

  return (
    <PortfolioContext.Provider
      value={{
        state,
        setText,
        setFile,
        addSection: (area, section) => updateArea(area, (list) => [...list, section]),
        updateSection: (area, id, patch) =>
          updateArea(area, (list) => list.map((x) => (x.id === id ? { ...x, ...patch } : x))),
        removeSection: (area, id) => updateArea(area, (list) => list.filter((x) => x.id !== id)),
        duplicateSection: (area, id) =>
          updateArea(area, (list) => {
            const i = list.findIndex((x) => x.id === id);
            if (i < 0) return list;
            const copy: Section = {
              ...list[i],
              id: crypto.randomUUID(),
              title: list[i].title + " (Copy)",
              cards: list[i].cards.map((c) => ({ ...c, id: crypto.randomUUID() })),
            };
            return [...list.slice(0, i + 1), copy, ...list.slice(i + 1)];
          }),
        moveSection: (area, id, dir) =>
          updateArea(area, (list) => {
            const i = list.findIndex((x) => x.id === id);
            const j = i + dir;
            if (i < 0 || j < 0 || j >= list.length) return list;
            const next = [...list];
            [next[i], next[j]] = [next[j], next[i]];
            return next;
          }),
        addCard: (area, sectionId, card) =>
          updateArea(area, (list) =>
            list.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    cards: [
                      ...s.cards,
                      {
                        id: crypto.randomUUID(),
                        title: card?.title ?? "New item",
                        description: card?.description ?? "",
                        ...card,
                      },
                    ],
                  }
                : s
            )
          ),
        updateCard: (area, sectionId, cardId, patch) =>
          updateArea(area, (list) =>
            list.map((s) =>
              s.id === sectionId
                ? { ...s, cards: s.cards.map((c) => (c.id === cardId ? { ...c, ...patch } : c)) }
                : s
            )
          ),
        removeCard: (area, sectionId, cardId) =>
          updateArea(area, (list) =>
            list.map((s) =>
              s.id === sectionId ? { ...s, cards: s.cards.filter((c) => c.id !== cardId) } : s
            )
          ),
        setCardFile: (area, sectionId, cardId, file) =>
          updateArea(area, (list) =>
            list.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    cards: s.cards.map((c) =>
                      c.id === cardId ? { ...c, file: file ?? undefined } : c
                    ),
                  }
                : s
            )
          ),
        resetAll: () => setState(DEFAULT),
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used inside PortfolioProvider");
  return ctx;
}

export function detectFileKind(file: File): FileKind {
  const n = file.name.toLowerCase();
  const t = file.type;
  if (n.endsWith(".pdf") || t === "application/pdf") return "pdf";
  if (n.endsWith(".docx") || n.endsWith(".doc")) return "docx";
  if (n.endsWith(".pptx") || n.endsWith(".ppt")) return "pptx";
  if (t.startsWith("image/")) return "image";
  if (t.startsWith("video/")) return "video";
  return "other";
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
