import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PortfolioProvider } from "@/lib/portfolio-store";
import { AuthProvider } from "@/lib/auth";
import { Navbar, type NavTab } from "@/components/portfolio/Navbar";
import { Hero } from "@/components/portfolio/Hero";
import { HomeTab, Tab2, Tab3, Tab4, Tab5, Tab6 } from "@/components/portfolio/Tabs";
import { Contact } from "@/components/portfolio/Contact";
import { AdminBar, EditModeIndicator } from "@/components/portfolio/AdminBar";
import { Toaster } from "@/components/ui/sonner";

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

const TABS: NavTab[] = [
  { id: "home", label: "الرئيسية" },
  { id: "tab2", label: "الكفاية الأكاديمية" },
  { id: "tab3", label: "التنوّع" },
  { id: "tab4", label: "القيم المهنية" },
  { id: "tab5", label: "البحث والتعلّم" },
  { id: "tab6", label: "التكنولوجيا" },
  { id: "contact", label: "تواصل" },
];

function PortfolioApp() {
  const [active, setActive] = useState("home");
  const sectionRef = useRef<HTMLDivElement>(null);

  // when tab changes, scroll to content area
  useEffect(() => {
    if (active !== "home" && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [active]);

  return (
    <div className="min-h-screen relative">
      <Navbar tabs={TABS} active={active} onChange={setActive} />
      <EditModeIndicator />

      {active === "home" && (
        <Hero onEnter={() => setActive("tab2")} />
      )}

      <main ref={sectionRef} className="max-w-7xl mx-auto px-4 pt-8 pb-24">
        {active === "home" && <HomeTab />}
        {active === "tab2" && <Tab2 />}
        {active === "tab3" && <Tab3 />}
        {active === "tab4" && <Tab4 />}
        {active === "tab5" && <Tab5 />}
        {active === "tab6" && <Tab6 />}
        {active === "contact" && <Contact />}
      </main>

      <footer className="py-10 text-center text-xs text-muted-foreground border-t border-white/40 backdrop-blur">
        <p>© {new Date().getFullYear()} ريّان النبهاني — ملف التدريب الميداني</p>
      </footer>

      <AdminBar />
    </div>
  );
}
