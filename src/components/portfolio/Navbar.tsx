import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, EyeOff, Menu, Pencil, Plus, Trash2, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { usePortfolio, type TabConfig } from "@/lib/portfolio-store";
import { Button } from "@/components/ui/button";

export type NavTab = TabConfig;

export function Navbar({
  active,
  onChange,
}: {
  active: string;
  onChange: (id: string) => void;
}) {
  const { state, addTab, renameTab, removeTab, moveTab, toggleTabHidden } = usePortfolio();
  const { isAdmin, editMode } = useAuth();
  const editable = isAdmin && editMode;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visibleTabs = editable ? state.tabs : state.tabs.filter((t) => !t.hidden);

  const handleRename = (t: TabConfig) => {
    const next = prompt("اسم التبويب", t.label);
    if (next != null && next.trim()) renameTab(t.id, next.trim());
  };

  const handleAdd = () => {
    const label = prompt("اسم التبويب الجديد", "تبويب جديد");
    if (!label) return;
    const id = addTab(label.trim());
    onChange(id);
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-40 transition-all",
          scrolled ? "py-2" : "py-4"
        )}
      >
      <div className="max-w-7xl mx-auto px-4">
        <nav
          className={cn(
            "glass-strong rounded-full px-3 py-2 flex items-center gap-2",
            scrolled ? "shadow-xl" : "shadow-md"
          )}
        >
          <button
            onClick={() => onChange(state.tabs[0]?.id || "home")}
            className="font-bold gradient-text text-sm md:text-base px-2 whitespace-nowrap"
          >
            ملف الإنجاز
          </button>

          <div className="hidden lg:flex items-center gap-1 mr-auto flex-wrap">
            {visibleTabs.map((t) => (
              <div key={t.id} className="relative group/tab flex items-center">
                <button
                  onClick={() => onChange(t.id)}
                  className={cn(
                    "relative px-3 py-1.5 text-xs xl:text-sm rounded-full transition whitespace-nowrap",
                    t.hidden && "opacity-50",
                    active === t.id
                      ? "text-white"
                      : "text-foreground/70 hover:text-violet hover:bg-white/60"
                  )}
                >
                  {active === t.id && (
                    <span className="absolute inset-0 rounded-full gradient-bg -z-10" />
                  )}
                  {t.label}
                </button>
                {editable && (
                  <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 hidden group-hover/tab:flex items-center gap-0.5 glass-strong rounded-full px-1 py-0.5 shadow-lg z-50">
                    <button
                      title="إعادة تسمية"
                      onClick={(e) => { e.stopPropagation(); handleRename(t); }}
                      className="h-6 w-6 grid place-items-center rounded-full hover:bg-violet/10 text-violet"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      title="نقل لليمين"
                      onClick={(e) => { e.stopPropagation(); moveTab(t.id, -1); }}
                      className="h-6 w-6 grid place-items-center rounded-full hover:bg-violet/10 text-violet"
                    >
                      <ArrowRight className="h-3 w-3" />
                    </button>
                    <button
                      title="نقل لليسار"
                      onClick={(e) => { e.stopPropagation(); moveTab(t.id, 1); }}
                      className="h-6 w-6 grid place-items-center rounded-full hover:bg-violet/10 text-violet"
                    >
                      <ArrowRight className="h-3 w-3 rotate-180" />
                    </button>
                    <button
                      title={t.hidden ? "إظهار" : "إخفاء"}
                      onClick={(e) => { e.stopPropagation(); toggleTabHidden(t.id); }}
                      className="h-6 w-6 grid place-items-center rounded-full hover:bg-violet/10 text-violet"
                    >
                      <EyeOff className="h-3 w-3" />
                    </button>
                    {t.type === "custom" && (
                      <button
                        title="حذف"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("حذف التبويب؟")) removeTab(t.id);
                        }}
                        className="h-6 w-6 grid place-items-center rounded-full hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            {editable && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs rounded-full"
                onClick={handleAdd}
              >
                <Plus className="h-3 w-3 ml-1" /> تبويب
              </Button>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden mr-auto h-9 w-9 grid place-items-center rounded-full hover:bg-white/60"
            aria-label="القائمة"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {open && (
          <div className="lg:hidden mt-2 glass-strong rounded-2xl p-2 shadow-xl">
            {visibleTabs.map((t) => (
              <div key={t.id} className="flex items-center gap-1">
                <button
                  onClick={() => {
                    onChange(t.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex-1 text-right px-3 py-2 rounded-xl text-sm",
                    active === t.id ? "gradient-bg text-white" : "hover:bg-white/60",
                    t.hidden && "opacity-50"
                  )}
                >
                  {t.label}
                </button>
                {editable && (
                  <>
                    <button onClick={() => handleRename(t)} className="h-8 w-8 grid place-items-center rounded hover:bg-white/60 text-violet">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {t.type === "custom" && (
                      <button
                        onClick={() => confirm("حذف التبويب؟") && removeTab(t.id)}
                        className="h-8 w-8 grid place-items-center rounded hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
            {editable && (
              <Button size="sm" variant="outline" className="w-full mt-2" onClick={handleAdd}>
                <Plus className="h-3 w-3 ml-1" /> إضافة تبويب
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
      {/* Spacer to push page content below the fixed navbar -- responsive heights */}
      <div className="h-16 sm:h-20 md:h-24" aria-hidden />
    </>
  );
}
