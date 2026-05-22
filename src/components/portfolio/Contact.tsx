import { useEffect, useState } from "react";
import { EditableText } from "./EditableText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Facebook, Instagram, Linkedin, Mail, Phone, Send, Trash2, Twitter } from "lucide-react";
import { usePortfolio } from "@/lib/portfolio-store";
import { toast } from "sonner";

interface Message {
  id: string;
  name: string;
  email: string;
  text: string;
  ts: number;
}

const KEY = "portfolio-messages-v1";

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const { state } = usePortfolio();

  useEffect(() => {
    try {
      setMessages(JSON.parse(localStorage.getItem(KEY) || "[]"));
    } catch {}
  }, []);

  const save = (list: Message[]) => {
    setMessages(list);
    localStorage.setItem(KEY, JSON.stringify(list));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) {
      toast.error("يرجى إضافة اسمك ورسالة.");
      return;
    }
    const msg: Message = {
      id: crypto.randomUUID(),
      name: name.trim().slice(0, 100),
      email: email.trim().slice(0, 255),
      text: text.trim().slice(0, 1000),
      ts: Date.now(),
    };
    save([msg, ...messages]);
    setName("");
    setEmail("");
    setText("");
    toast.success("تم إرسال الرسالة. شكرًا لك!");
  };

  return (
    <div className="space-y-8 page-section" dir="rtl">
      <div className="text-center max-w-2xl mx-auto">
        <EditableText
          tkey="contact.title"
          as="h2"
          className="text-3xl md:text-4xl font-bold gradient-text block"
        />
        <EditableText
          tkey="contact.intro"
          as="p"
          multiline
          className="mt-3 text-foreground/70 block"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-strong rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-lg gradient-text">معلومات التواصل</h3>
          <a href="mailto:rayyanalnabhani23@gmail.com" className="flex items-center gap-3 group">
            <span className="h-10 w-10 rounded-xl gradient-bg text-white grid place-items-center">
              <Mail className="h-4 w-4" />
            </span>
            <span className="text-sm group-hover:text-violet transition">
              <EditableText tkey="contact.email" as="span" />
            </span>
          </a>
          <a href="tel:97550512" className="flex items-center gap-3 group">
            <span className="h-10 w-10 rounded-xl gradient-bg text-white grid place-items-center">
              <Phone className="h-4 w-4" />
            </span>
            <span className="text-sm group-hover:text-violet transition">
              <EditableText tkey="contact.phone" as="span" />
            </span>
          </a>
          <div className="flex gap-2 pt-2">
            {/* Social links are dynamic and editable by Admin */}
            {(() => {
              const social = (state.social || {}) as Record<string, string>;
              const items: Array<{ key: string; Icon: any }> = [
                { key: "facebook", Icon: Facebook },
                { key: "linkedin", Icon: Linkedin },
                { key: "twitter", Icon: Twitter },
                { key: "instagram", Icon: Instagram },
              ];
              return items.map(({ key, Icon }, i) => {
                const href = social[key] || "";
                return (
                  <a
                    key={i}
                    href={href || "#"}
                    target={href ? "_blank" : undefined}
                    rel={href ? "noreferrer noopener" : undefined}
                    className="h-10 w-10 rounded-xl glass hover:gradient-bg hover:text-white text-violet grid place-items-center transition"
                    aria-label={key}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              });
            })()}
          </div>

          {messages.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="font-semibold text-sm mb-2">Visitor messages ({messages.length})</h4>
              <div className="max-h-64 overflow-auto space-y-2 pr-1">
                {messages.map((m) => (
                  <div key={m.id} className="rounded-xl bg-white/80 p-3 text-sm border">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{m.name}</span>
                      <button
                        onClick={() => save(messages.filter((x) => x.id !== m.id))}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    {m.email && <div className="text-xs text-muted-foreground">{m.email}</div>}
                    <p className="mt-1 text-xs whitespace-pre-wrap">{m.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={submit} className="glass-strong rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-lg gradient-text">إرسال رسالة</h3>
          <div>
            <Label className="text-right">الاسم</Label>
            <Input className="text-right" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label className="text-right">البريد الإلكتروني (اختياري)</Label>
            <Input
              className="text-right"
              type="email"
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-right">الرسالة</Label>
            <Textarea
              className="text-right"
              maxLength={1000}
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <Button type="submit" className="gradient-bg text-white w-full">
            <Send className="h-4 w-4 ml-2" /> إرسال رسالة
          </Button>
        </form>
      </div>
    </div>
  );
}
