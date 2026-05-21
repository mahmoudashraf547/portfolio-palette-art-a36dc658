import { useAuth } from "@/lib/auth";
import { usePortfolio } from "@/lib/portfolio-store";
import { Button } from "@/components/ui/button";
import { EditableText } from "./EditableText";
import { FileUploader } from "./FileUploader";
import { ArrowRight, GraduationCap, Sparkles } from "lucide-react";

export function Hero({ onEnter }: { onEnter: () => void }) {
  const { state, setFile } = usePortfolio();
  const { isAdmin, editMode } = useAuth();
  const editable = isAdmin && editMode;
  const logo = state.files["hero.logo"];

  return (
    <section className="relative pt-28 pb-20 px-4 overflow-hidden">
      {/* animated blobs */}
      <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-violet/30 blur-3xl animate-blob" aria-hidden />
      <div className="absolute top-40 -right-20 w-96 h-96 rounded-full bg-skyblue/40 blur-3xl animate-blob" style={{ animationDelay: "4s" }} aria-hidden />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-lavender/50 blur-3xl animate-blob" style={{ animationDelay: "8s" }} aria-hidden />

      <div className="relative max-w-6xl mx-auto">
        {/* University identity header */}
        <div className="animate-fade-in glass-strong rounded-3xl px-5 py-6 md:px-10 md:py-8 shadow-xl bg-gradient-to-l from-white/60 via-lavender/30 to-skyblue/30 border border-white/50">
          <div className="flex flex-col-reverse md:flex-row-reverse items-center md:items-stretch gap-6 md:gap-10">
            {/* Logo block (right side in RTL) */}
            <div className="flex flex-col items-center gap-3 shrink-0 group">
              <div
                className="relative h-28 w-28 md:h-36 md:w-36 rounded-2xl overflow-hidden flex items-center justify-center
                           bg-gradient-to-br from-white via-lavender/40 to-skyblue/40
                           ring-1 ring-violet/20 shadow-[0_10px_40px_-12px_rgba(124,77,255,0.35)]
                           transition-all duration-500 group-hover:scale-[1.04] group-hover:shadow-[0_18px_50px_-12px_rgba(124,77,255,0.5)] group-hover:ring-violet/40"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-violet/0 via-violet/0 to-violet/10 pointer-events-none" />
                {logo ? (
                  <img src={logo.dataUrl} alt="شعار جامعة السلطان قابوس" className="w-full h-full object-contain p-2" />
                ) : (
                  <GraduationCap className="h-14 w-14 md:h-16 md:w-16 text-violet" />
                )}
              </div>
              {editable && (
                <div className="w-40">
                  <FileUploader
                    value={logo}
                    onChange={(f) => setFile("hero.logo", f)}
                    label="رفع الشعار"
                    accept="image/*"
                    compact
                  />
                </div>
              )}
            </div>

            {/* Vertical divider on desktop */}
            <div className="hidden md:block w-px self-stretch bg-gradient-to-b from-transparent via-violet/30 to-transparent" aria-hidden />

            {/* University identity text */}
            <div className="flex-1 text-center md:text-right animate-fade-in" style={{ animationDelay: "120ms", animationFillMode: "backwards" }}>
              <h1
                className="text-2xl md:text-3xl lg:text-4xl font-extrabold gradient-text leading-snug tracking-tight"
                style={{ fontFamily: "Cairo, 'IBM Plex Sans Arabic', sans-serif" }}
              >
                جامعة السلطان قابوس
              </h1>
              <p
                className="mt-2 text-lg md:text-xl font-semibold text-deepblue"
                style={{ fontFamily: "Tajawal, Cairo, sans-serif" }}
              >
                كلية التربية
              </p>
              <p
                className="mt-1 text-sm md:text-base text-deepblue/75 font-medium"
                style={{ fontFamily: "Tajawal, Cairo, sans-serif" }}
              >
                قسم المناهج وطرق التدريس
              </p>

              {/* Decorative divider */}
              <div className="my-4 flex items-center gap-3 justify-center md:justify-end" aria-hidden>
                <span className="h-px w-16 md:w-24 bg-gradient-to-l from-violet/60 to-transparent" />
                <span className="h-1.5 w-1.5 rounded-full bg-violet/70 shadow-[0_0_10px_rgba(124,77,255,0.6)]" />
                <span className="h-px w-8 bg-gradient-to-r from-violet/60 to-transparent" />
              </div>

              <p
                className="text-base md:text-lg font-bold text-violet tracking-wide"
                style={{ fontFamily: "Changa, Cairo, sans-serif" }}
              >
                التربية الفنية
              </p>
            </div>
          </div>
        </div>

        {/* Personal hero content */}
        <div className="mt-12 text-center lg:text-right animate-fade-in" style={{ animationDelay: "240ms", animationFillMode: "backwards" }}>
          <div className="inline-flex items-center gap-1 glass rounded-full px-3 py-1 text-xs text-violet mb-4">
            <Sparkles className="h-3 w-3" /> <EditableText tkey="site.major" as="span" />
          </div>
          <EditableText
            tkey="site.title"
            as="h2"
            className="text-3xl md:text-5xl font-extrabold gradient-text leading-tight block"
          />
          <EditableText
            tkey="site.subtitle"
            as="p"
            className="mt-3 text-lg md:text-xl text-deepblue/80 font-medium block"
          />
          <EditableText
            tkey="hero.welcome"
            as="h3"
            className="mt-8 text-2xl md:text-3xl font-bold text-deepblue block"
          />
          <EditableText
            tkey="hero.intro"
            as="p"
            multiline
            className="mt-4 text-base md:text-lg text-foreground/70 max-w-2xl mx-auto lg:mx-0 block"
          />
          <div className="mt-8 flex justify-center lg:justify-start">
            <Button
              size="lg"
              onClick={onEnter}
              className="gradient-bg text-white rounded-full px-8 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition"
            >
              <EditableText tkey="hero.cta" as="span" /> <ArrowRight className="h-4 w-4 mr-2 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
