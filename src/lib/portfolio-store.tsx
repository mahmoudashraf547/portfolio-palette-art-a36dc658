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

export type CardKind = "file" | "text" | "button" | "divider";

export interface CardItem {
  id: string;
  kind?: CardKind; // default "file"
  title: string;
  description: string;
  file?: StoredFile;
  link?: string;
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
  lineHeight?: string;
  letterSpacing?: string;
  opacity?: number;
  italic?: boolean;
  underline?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
}

export type Texts = Record<string, TextValue>;

export interface TabConfig {
  id: string; // stable id; built-in ids: home, tab2..tab6, contact
  label: string;
  type: "home" | "tab2" | "tab3" | "tab4" | "tab5" | "tab6" | "contact" | "custom";
  hidden?: boolean;
}

export interface PortfolioState {
  texts: Texts;
  files: Record<string, StoredFile>; // for hero logo, etc.
  sections: Record<string, Section[]>; // key = tab/area id
  tabs: TabConfig[];
}

/* ----------------------------- Defaults ----------------------------- */
const t = (text: string): TextValue => ({ text });

const DEFAULT: PortfolioState = {
  texts: {
    "site.title": t("ملف التدريب الميداني"),
    "site.subtitle": t("للمعلم الطالب: ريّان النبهاني"),
    "site.major": t("التخصص: التربية الفنية"),
    "hero.welcome": t("مرحباً بكم في ملف إنجازي"),
    "hero.intro": t(
      "رحلة فنية عبر تدريبي الميداني — تأملات، خطط دروس، أبحاث، ومشاريع إبداعية شكّلت نموّي معلّمًا للتربية الفنية."
    ),
    "hero.cta": t("ادخل إلى الملف"),

    "home.intro.title": t("مقدّمة"),
    "home.intro.body": t(
      "أنا معلّم طالب متخصّص في التربية الفنية، شغوف بتنمية الإبداع والثقافة البصرية والتعبير الذاتي لدى المتعلمين. يجمع هذا الملف شواهد نموّي عبر محاور التدريب الميداني الستة."
    ),
    "home.philosophy.title": t("فلسفتي في التدريس"),
    "home.philosophy.body": t(
      "أؤمن بأن التربية الفنية تمكّن الطلاب من التفكير الناقد والتواصل البصري واحتضان صوتهم الفريد. صفّي مرسمٌ آمن يقود فيه الفضول والتجريب والتأمّل كلّ درس."
    ),
    "home.cv.title": t("السيرة الذاتية"),
    "home.cv.body": t("ارفع سيرتك الذاتية (PDF أو DOCX) ليتمكن الزوار من معاينتها مباشرة."),
    "home.reflective.title": t("الأوراق التأمّلية"),

    "tab2.title": t("الكفاية الأكاديمية والخبرة التخصصية"),
    "tab2.intro": t("شواهد على تصميم المنهج، والمعرفة بالمحتوى، والممارسة التأمّلية في التربية الفنية."),
    "tab2.other.title": t("مقرّرات أخرى"),

    "tab3.title": t("التنوّع في التدريس"),
    "tab3.intro": t("خطط الدروس، الزيارات التبادلية، وشواهد التواصل الأسري."),
    "tab3.g6.title": t("الصف السادس — خطط الدروس"),
    "tab3.g7.title": t("الصف السابع — خطط الدروس"),

    "tab4.title": t("القيم والاتجاهات المهنية"),
    "tab4.intro": t("المهنية والأخلاق والفلسفة الشخصية في الممارسة."),

    "tab5.title": t("ثقافة البحث والتعلّم المستمر"),
    "tab5.intro": t("البحث الإجرائي وورش العمل والتطوير المهني المستمر."),
    "tab5.prev.title": t("مشاريع سابقة"),

    "tab6.title": t("المهارات التقنية"),
    "tab6.intro": t("توظيف التكنولوجيا بشكل هادف في التربية الفنية."),

    "contact.title": t("تواصل معي"),
    "contact.intro": t("لا تتردّد في التواصل للتعاون أو إبداء الملاحظات أو طرح الأسئلة."),
    "contact.email": t("rayyanalnabhani23@gmail.com"),
    "contact.phone": t("97550512"),
  },
  files: {},
  sections: {
    "home.reflective": [
      {
        id: "rp1",
        title: "ورقة تأمّلية",
        cards: [
          { id: "c1", title: "التأمّل الأول", description: "أول ورقة تأمّلية من التدريب الميداني." },
          { id: "c2", title: "التأمّل الثاني", description: "تأمّل منتصف الفصل حول الممارسة الصفّية." },
          { id: "c3", title: "التأمّل الثالث", description: "تأمّل ختامي يلخّص النمو والتطوّر." },
        ],
      },
    ],
    "tab2.main": [
      { id: "unit1", title: "خطة وحدة دراسية مطوّرة", cards: [{ id: "u1", title: "خطة الوحدة", description: "خطة وحدة فنية شاملة." }] },
      { id: "axis1", title: "ورقة تأمّلية للمحور الأول", cards: [{ id: "a1", title: "تأمّل المحور الأول", description: "" }] },
      { id: "spec", title: "أوراق تأمّلية تخصّصية", cards: [
        { id: "s1", title: "الورقة الأولى", description: "" },
        { id: "s2", title: "الورقة الثانية", description: "" },
        { id: "s3", title: "الورقة الثالثة", description: "" },
      ]},
    ],
    "tab2.other": [
      { id: "curr", title: "مقرّر المناهج", cards: [] },
      { id: "tm1", title: "طرائق التدريس 1", cards: [] },
      { id: "tm2", title: "طرائق التدريس 2", cards: [] },
      { id: "proj", title: "المشاريع الكبرى", cards: [] },
    ],
    "tab3.main": [
      { id: "axisR", title: "ورقة تأمّلية للمحور", cards: [{ id: "x1", title: "تأمّل", description: "" }] },
    ],
    "tab3.g6": [
      { id: "g6lessons", title: "دروس الصف السادس", cards: [
        { id: "l1", title: "الدرس الأول", description: "مدخل إلى نظرية الألوان." },
      ]},
    ],
    "tab3.g7": [
      { id: "g7lessons", title: "دروس الصف السابع", cards: [
        { id: "l1", title: "الدرس الأول", description: "أساسيات التكوين الفني." },
      ]},
    ],
    "tab3.extras": [
      { id: "comp", title: "ورقة تأمّلية شاملة", cards: [] },
      { id: "peer", title: "شواهد الزيارات التبادلية", cards: [] },
      { id: "parent", title: "نموذج التواصل مع أولياء الأمور", cards: [] },
    ],
    "tab4.main": [
      { id: "axisR", title: "ورقة تأمّلية للمحور", cards: [] },
      { id: "phil", title: "فلسفتي في التدريس", cards: [] },
      { id: "prof", title: "أداة تقييم المهنية القائمة على السيناريو", cards: [] },
      { id: "att", title: "سجلّ الحضور والانصراف", cards: [] },
    ],
    "tab5.main": [
      { id: "axisR", title: "ورقة تأمّلية للمحور", cards: [] },
      { id: "action", title: "مشروع البحث الإجرائي", cards: [] },
      { id: "pd", title: "شواهد التطوير المهني", cards: [] },
      { id: "workshop", title: "خطط ورش العمل الفنية", cards: [] },
    ],
    "tab5.prev": [
      { id: "meas", title: "مشروع القياس والتقويم", cards: [] },
      { id: "psych", title: "مشروع علم النفس", cards: [] },
      { id: "special", title: "مشروع المتعلّمين ذوي الاحتياجات الخاصة", cards: [] },
      { id: "exh", title: "المعارض التخصّصية", cards: [] },
    ],
    "tab6.main": [
      { id: "axisR", title: "ورقة تأمّلية للمحور", cards: [] },
      { id: "tech", title: "توظيف التكنولوجيا في الخطط والدروس", cards: [] },
      { id: "skills", title: "مهارات البرامج والأجهزة", cards: [] },
      { id: "pres", title: "عروض متميّزة", cards: [] },
      { id: "ws", title: "أوراق العمل", cards: [] },
    ],
  },
  tabs: [
    { id: "home", label: "الرئيسية", type: "home" },
    { id: "tab2", label: "الكفاية الأكاديمية", type: "tab2" },
    { id: "tab3", label: "التنوّع", type: "tab3" },
    { id: "tab4", label: "القيم المهنية", type: "tab4" },
    { id: "tab5", label: "البحث والتعلّم", type: "tab5" },
    { id: "tab6", label: "التكنولوجيا", type: "tab6" },
    { id: "contact", label: "تواصل", type: "contact" },
  ],
};

/* ----------------------------- Persistence ----------------------------- */
const STORAGE_KEY = "portfolio-state-v3-ar";

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
      tabs: Array.isArray(parsed.tabs) && parsed.tabs.length ? parsed.tabs : DEFAULT.tabs,
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
  reorderCards: (area: string, sectionId: string, fromId: string, toId: string) => void;
  reorderSections: (area: string, fromId: string, toId: string) => void;
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
                        title: card?.title ?? "عنصر جديد",
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
        reorderCards: (area, sectionId, fromId, toId) =>
          updateArea(area, (list) =>
            list.map((s) => {
              if (s.id !== sectionId) return s;
              const from = s.cards.findIndex((c) => c.id === fromId);
              const to = s.cards.findIndex((c) => c.id === toId);
              if (from < 0 || to < 0 || from === to) return s;
              const next = [...s.cards];
              const [moved] = next.splice(from, 1);
              next.splice(to, 0, moved);
              return { ...s, cards: next };
            })
          ),
        reorderSections: (area, fromId, toId) =>
          updateArea(area, (list) => {
            const from = list.findIndex((x) => x.id === fromId);
            const to = list.findIndex((x) => x.id === toId);
            if (from < 0 || to < 0 || from === to) return list;
            const next = [...list];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return next;
          }),
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
