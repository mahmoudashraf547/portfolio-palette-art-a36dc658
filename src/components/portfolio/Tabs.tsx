import { EditableText } from "./EditableText";
import { SectionArea } from "./SectionArea";

function TabHeader({ titleKey, introKey }: { titleKey: string; introKey: string }) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-8">
      <EditableText
        tkey={titleKey}
        as="h2"
        className="text-3xl md:text-4xl font-bold gradient-text block"
      />
      <EditableText
        tkey={introKey}
        as="p"
        multiline
        className="mt-3 text-foreground/70 block"
      />
    </div>
  );
}

export function HomeTab() {
  return (
    <div className="space-y-12">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-strong rounded-2xl p-6 fade-in-up">
          <EditableText tkey="home.intro.title" as="h3" className="text-2xl font-bold gradient-text block mb-2" />
          <EditableText tkey="home.intro.body" as="p" multiline className="text-foreground/80 leading-relaxed block" />
        </div>
        <div className="glass-strong rounded-2xl p-6 fade-in-up">
          <EditableText tkey="home.philosophy.title" as="h3" className="text-2xl font-bold gradient-text block mb-2" />
          <EditableText tkey="home.philosophy.body" as="p" multiline className="text-foreground/80 leading-relaxed block" />
        </div>
      </div>

      <div className="glass-strong rounded-2xl p-6">
        <EditableText tkey="home.cv.title" as="h3" className="text-2xl font-bold gradient-text block mb-2" />
        <EditableText tkey="home.cv.body" as="p" className="text-foreground/70 block mb-4" />
        <SectionArea area="home.cv" />
      </div>

      <div>
        <EditableText tkey="home.reflective.title" as="h3" className="text-2xl font-bold gradient-text block mb-4 text-center" />
        <SectionArea area="home.reflective" />
      </div>
    </div>
  );
}

export function Tab2() {
  return (
    <div className="space-y-10">
      <TabHeader titleKey="tab2.title" introKey="tab2.intro" />
      <SectionArea area="tab2.main" />
      <div className="pt-6">
        <EditableText
          tkey="tab2.other.title"
          as="h3"
          className="text-2xl font-bold gradient-text block mb-4 text-center"
        />
        <SectionArea area="tab2.other" />
      </div>
    </div>
  );
}

export function Tab3() {
  return (
    <div className="space-y-10">
      <TabHeader titleKey="tab3.title" introKey="tab3.intro" />
      <SectionArea area="tab3.main" />
      <div className="pt-6">
        <EditableText
          tkey="tab3.g6.title"
          as="h3"
          className="text-2xl font-bold gradient-text block mb-4 text-center"
        />
        <SectionArea area="tab3.g6" />
      </div>
      <div className="pt-6">
        <EditableText
          tkey="tab3.g7.title"
          as="h3"
          className="text-2xl font-bold gradient-text block mb-4 text-center"
        />
        <SectionArea area="tab3.g7" />
      </div>
      <SectionArea area="tab3.extras" />
    </div>
  );
}

export function Tab4() {
  return (
    <div className="space-y-10">
      <TabHeader titleKey="tab4.title" introKey="tab4.intro" />
      <SectionArea area="tab4.main" />
    </div>
  );
}

export function Tab5() {
  return (
    <div className="space-y-10">
      <TabHeader titleKey="tab5.title" introKey="tab5.intro" />
      <SectionArea area="tab5.main" />
      <div className="pt-6">
        <EditableText
          tkey="tab5.prev.title"
          as="h3"
          className="text-2xl font-bold gradient-text block mb-4 text-center"
        />
        <SectionArea area="tab5.prev" />
      </div>
    </div>
  );
}

export function Tab6() {
  return (
    <div className="space-y-10">
      <TabHeader titleKey="tab6.title" introKey="tab6.intro" />
      <SectionArea area="tab6.main" />
    </div>
  );
}
