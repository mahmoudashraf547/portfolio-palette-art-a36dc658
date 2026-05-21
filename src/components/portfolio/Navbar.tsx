import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export interface NavTab {
  id: string;
  label: string;
}

export function Navbar({
  tabs,
  active,
  onChange,
}: {
  tabs: NavTab[];
  active: string;
  onChange: (id: string) => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-40 transition-all",
        scrolled ? "py-2" : "py-4"
      )}
    >
      <div className="max-w-7xl mx-auto px-4">
        <nav
          className={cn(
            "glass-strong rounded-full px-4 py-2 flex items-center gap-2",
            scrolled ? "shadow-xl" : "shadow-md"
          )}
        >
          <button
            onClick={() => onChange(tabs[0].id)}
            className="font-bold gradient-text text-sm md:text-base px-2 whitespace-nowrap"
          >
            ملف الإنجاز
          </button>
          <div className="hidden lg:flex items-center gap-1 mr-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => onChange(t.id)}
                className={cn(
                  "relative px-3 py-1.5 text-xs xl:text-sm rounded-full transition whitespace-nowrap",
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
            ))}
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
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  onChange(t.id);
                  setOpen(false);
                }}
                className={cn(
                  "block w-full text-right px-3 py-2 rounded-xl text-sm",
                  active === t.id ? "gradient-bg text-white" : "hover:bg-white/60"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
