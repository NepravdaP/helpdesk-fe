import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Spin } from "antd";
import type { Role, User } from "@/types";
import { loginRequest, meRequest } from "@/api/auth";
import { getToken, setToken } from "@/api/client";

// Реальная авторизация через бэкенд (LDAP / dev-bypass).
// Интерфейс совпадает с прежним моком ({ user, setRole }), поэтому экраны не меняются.
// «act as» теперь перелогинивает под представителя роли из сидовой БД.

interface AuthContextValue {
  user: User;
  setRole: (role: Role) => void;
  login: (userName: string, password?: string) => Promise<void>;
  logout: () => void;
}

// Представитель каждой роли среди сидовых пользователей (для переключателя ролей).
const ROLE_SAMPLE: Record<Role, string> = {
  employee: "e.petrova",
  it: "s.orlov",
  admin: "m.zaytseva",
  superadmin: "a.ivanov",
};
const DEFAULT_USER = ROLE_SAMPLE.superadmin;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const bootstrapped = useRef(false);

  const login = async (userName: string, password = "") => {
    const u = await loginRequest(userName, password);
    setUser(u);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    void login(DEFAULT_USER);
  };

  // Начальная загрузка: восстановить сессию по токену либо войти под пользователем по умолчанию.
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    (async () => {
      try {
        if (getToken()) {
          setUser(await meRequest());
          return;
        }
      } catch {
        setToken(null);
      }
      try {
        await login(DEFAULT_USER);
      } catch {
        // оставляем экран загрузки, если бэкенд недоступен
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue | null>(
    () =>
      user
        ? {
            user,
            setRole: (role) => void login(ROLE_SAMPLE[role]),
            login,
            logout,
          }
        : null,
    [user],
  );

  if (!value) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Spin size="large" tip="Подключение к серверу…">
          <div style={{ padding: 24 }} />
        </Spin>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
