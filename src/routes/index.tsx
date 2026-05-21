import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PortfolioProvider, usePortfolio } from "@/lib/portfolio-store";
import { AuthProvider } from "@/lib/auth";
import { Navbar } from "@/components/portfolio/Navbar";
import { Hero } from "@/components/portfolio/Hero";
import { HomeTab, Tab2, Tab3, Tab4, Tab5, Tab6 } from "@/components/portfolio/Tabs";
import { Contact } from "@/components/portfolio/Contact";
import { AdminBar, EditModeIndicator } from "@/components/portfolio/AdminBar";
import { Toaster } from "@/components/ui/sonner";
import { SectionArea } from "@/components/portfolio/SectionArea";
import { EditableText } from "@/components/portfolio/EditableText";

export const Route = createFileRoute("/")({
  component: () => (
    <AuthProvider>
      <PortfolioProvider>
        <PortfolioApp />
        <Toaster position="top-right" />
      </PortfolioProvider>
    </AuthProvider>
  ),
});

function CustomTabContent({ tabId, label }: { tabId: string; label: string }) {
  const tkey = `custom.${tabId}.intro`;
  return (
    <div className="space-y-10">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text">{label}</h2>
        <EditableText
          tkey={tkey}
          as="p"
          multiline
          placeholder="اكتب وصفاً مختصراً لهذا التبويب…"
          className="mt-3 text-foreground/70 block"
        />
      </div>
      <SectionArea area={`custom.${tabId}`} />
    </div>
  );
}

function PortfolioApp() {
  const { state } = usePortfolio();
  const [active, setActive] = useState("home");
  const sectionRef = useRef<HTMLDivElement>(null);

  // Reset to first tab if active was removed
  useEffect(() => {
    if (!state.tabs.find((t) => t.id === active)) {
      setActive(state.tabs[0]?.id || "home");
    }
  }, [state.tabs, active]);

  useEffect(() => {
    if (active !== "home" && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [active]);

  const activeTab = state.tabs.find((t) => t.id === active);
  const type = activeTab?.type ?? "home";

  return (
    <div className="min-h-screen relative">
      <Navbar active={active} onChange={setActive} />
      <EditModeIndicator />

      {type === "home" && <Hero onEnter={() => {
        const next = state.tabs.find((t) => t.id !== "home" && !t.hidden);
        if (next) setActive(next.id);
      }} />}

      <main
        ref={sectionRef}
        className={
          type === "home"
            ? "max-w-7xl mx-auto px-4 pt-8 pb-24"
            : "max-w-7xl mx-auto px-4 pt-32 md:pt-36 pb-24"
        }
      >
        {type === "home" && <HomeTab />}
        {type === "tab2" && <Tab2 />}
        {type === "tab3" && <Tab3 />}
        {type === "tab4" && <Tab4 />}
        {type === "tab5" && <Tab5 />}
        {type === "tab6" && <Tab6 />}
        {type === "contact" && <Contact />}
        {type === "custom" && activeTab && (
          <CustomTabContent tabId={activeTab.id} label={activeTab.label} />
        )}
      </main>

      <footer className="py-10 text-center text-xs text-muted-foreground border-t border-white/40 backdrop-blur">
        <p>© {new Date().getFullYear()} ريّان النبهاني — ملف التدريب الميداني</p>
      </footer>

      <AdminBar />
    </div>
  );
}
