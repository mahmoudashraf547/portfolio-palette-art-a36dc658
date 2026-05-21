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
        <div className="grid lg:grid-cols-[auto_1fr] gap-8 items-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-40 w-40 md:h-48 md:w-48 rounded-3xl glass-strong overflow-hidden flex items-center justify-center shadow-2xl">
              {logo ? (
                <img src={logo.dataUrl} alt="Portfolio logo" className="w-full h-full object-cover" />
              ) : (
                <GraduationCap className="h-20 w-20 text-violet" />
              )}
            </div>
            {editable && (
              <div className="w-48">
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
          <div className="text-center lg:text-right">
            <div className="inline-flex items-center gap-1 glass rounded-full px-3 py-1 text-xs text-violet mb-4">
              <Sparkles className="h-3 w-3" /> <EditableText tkey="site.major" as="span" />
            </div>
            <EditableText
              tkey="site.title"
              as="h1"
              className="text-4xl md:text-6xl font-extrabold gradient-text leading-tight block"
            />
            <EditableText
              tkey="site.subtitle"
              as="p"
              className="mt-3 text-lg md:text-xl text-deepblue/80 font-medium block"
            />
            <EditableText
              tkey="hero.welcome"
              as="h2"
              className="mt-8 text-2xl md:text-3xl font-bold text-deepblue block"
            />
            <EditableText
              tkey="hero.intro"
              as="p"
              multiline
              className="mt-4 text-base md:text-lg text-foreground/70 max-w-2xl block"
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
      </div>
    </section>
  );
}
