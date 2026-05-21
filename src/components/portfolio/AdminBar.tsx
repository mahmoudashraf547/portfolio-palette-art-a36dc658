import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { usePortfolio } from "@/lib/portfolio-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, LogOut, Pencil, RotateCcw } from "lucide-react";

export function AdminBar() {
  const { isAdmin, editMode, login, logout, setEditMode } = useAuth();
  const { resetAll } = usePortfolio();
  const [loginOpen, setLoginOpen] = useState(false);
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <>
        <button
          onClick={() => setLoginOpen(true)}
          className="fixed bottom-5 left-5 z-50 h-12 w-12 rounded-full glass-strong text-violet shadow-lg hover:scale-110 transition flex items-center justify-center"
          aria-label="تسجيل الدخول"
        >
          <Lock className="h-5 w-5" />
        </button>
        <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
          <DialogContent className="glass-strong max-w-sm" dir="rtl">
            <DialogHeader>
              <DialogTitle className="gradient-text text-right">تسجيل الدخول</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (login(u, p)) {
                  setLoginOpen(false);
                  setU("");
                  setP("");
                  setErr(null);
                } else {
                  setErr("بيانات الدخول غير صحيحة");
                }
              }}
              className="space-y-3"
            >
              <div>
                <Label>اسم المستخدم</Label>
                <Input value={u} onChange={(e) => setU(e.target.value)} autoFocus />
              </div>
              <div>
                <Label>كلمة المرور</Label>
                <Input type="password" value={p} onChange={(e) => setP(e.target.value)} />
              </div>
              {err && <p className="text-sm text-destructive">{err}</p>}
              <DialogFooter>
                <Button type="submit" className="gradient-bg text-white">
                  دخول
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="fixed bottom-5 left-5 z-50 flex items-center gap-2 glass-strong rounded-full pl-2 pr-4 py-2 shadow-xl" dir="rtl">
      <span className="text-xs font-medium text-violet hidden sm:inline">المدير</span>
      <Button
        size="sm"
        variant={editMode ? "default" : "outline"}
        className={editMode ? "gradient-bg text-white" : ""}
        onClick={() => setEditMode(!editMode)}
      >
        {editMode ? <Eye className="h-3 w-3 ml-1" /> : <Pencil className="h-3 w-3 ml-1" />}
        {editMode ? "معاينة" : "تحرير الموقع"}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        title="إعادة التعيين للقيم الافتراضية"
        onClick={() => {
          if (confirm("هل تريد إعادة تعيين كل محتوى الموقع؟ لا يمكن التراجع عن هذا الإجراء.")) resetAll();
        }}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost" onClick={logout} title="تسجيل الخروج">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function EditModeIndicator() {
  const { editMode, isAdmin } = useAuth();
  if (!isAdmin || !editMode) return null;
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 glass-strong rounded-full px-4 py-1.5 text-xs font-medium text-violet shadow flex items-center gap-2">
      <Pencil className="h-3 w-3" /> وضع التحرير مفعّل — انقر على أي نص أو قسم للتعديل
    </div>
  );
}

export function _unused() {
  return EyeOff;
}
