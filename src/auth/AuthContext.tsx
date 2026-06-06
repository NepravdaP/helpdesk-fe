import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Role, User } from "@/types";

// Мок-авторизация на время разработки.
// Реальный вход через LDAP подключим в конце — он заменит этот провайдер,
// сохранив тот же интерфейс (user + setRole), поэтому экраны переписывать не придётся.

interface AuthContextValue {
  user: User;
  setRole: (role: Role) => void;
}

const MOCK_USER: User = {
  id: 1,
  fullName: "А. Иванов",
  email: "a.ivanov@org.local",
  role: "it",
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(MOCK_USER);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      setRole: (role) => setUser((u) => ({ ...u, role })),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
