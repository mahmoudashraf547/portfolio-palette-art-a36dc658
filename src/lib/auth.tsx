import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface AuthCtx {
  isAdmin: boolean;
  editMode: boolean;
  login: (u: string, p: string) => boolean;
  logout: () => void;
  setEditMode: (v: boolean) => void;
}

const Ctx = createContext<AuthCtx | null>(null);

const KEY = "portfolio-auth-v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsAdmin(localStorage.getItem(KEY) === "1");
  }, []);

  const login = (u: string, p: string) => {
    if (u === "admin" && p === "rayan123") {
      localStorage.setItem(KEY, "1");
      setIsAdmin(true);
      return true;
    }
    return false;
  };
  const logout = () => {
    localStorage.removeItem(KEY);
    setIsAdmin(false);
    setEditMode(false);
  };

  return (
    <Ctx.Provider value={{ isAdmin, editMode, login, logout, setEditMode }}>{children}</Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}
