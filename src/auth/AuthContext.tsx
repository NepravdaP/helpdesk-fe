import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Spin } from "antd";
import { useTranslation } from "react-i18next";
import type { Role, User } from "@/types";
import { authConfigRequest, loginRequest, meRequest, type AuthConfig } from "@/api/auth";
import { ApiError, getToken, setToken, setUnauthorizedHandler } from "@/api/client";

// Авторизация через бэкенд (LDAP / dev-bypass).
// Два хука:
//  • useAuthState() — для экрана входа и гарда: пользователя может не быть;
//  • useAuth()      — для экранов внутри приложения: пользователь гарантирован.
// Публичный интерфейс useAuth() ({ user, setRole, login, logout }) прежний, поэтому экраны не меняются.

interface AuthStateValue {
  user: User | null;
  // null — бэкенд не ответил на /auth/config (экран входа покажет «сервер недоступен»).
  config: AuthConfig | null;
  // Сессия была сброшена из-за 401 — экран входа объясняет, почему пользователь снова здесь.
  sessionExpired: boolean;
  login: (userName: string, password?: string) => Promise<void>;
  logout: () => void;
  reloadConfig: () => Promise<void>;
}

interface AuthContextValue {
  user: User;
  devBypass: boolean;
  setRole: (role: Role) => void;
  login: (userName: string, password?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthStateValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [booting, setBooting] = useState(true);
  const bootstrapped = useRef(false);
  const userRef = useRef<User | null>(null);
  userRef.current = user;

  const login = useCallback(async (userName: string, password = "") => {
    const u = await loginRequest(userName, password);
    setSessionExpired(false);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setSessionExpired(false);
    setUser(null);
  }, []);

  const reloadConfig = useCallback(async () => {
    try {
      setConfig(await authConfigRequest());
    } catch {
      setConfig(null);
    }
  }, []);

  // Протухший токен в любом запросе → сброс сессии и экран входа.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      if (userRef.current) setSessionExpired(true);
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  // Начальная загрузка: настройки экрана входа + восстановление сессии по токену.
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    (async () => {
      const restore = async () => {
        if (!getToken()) return;
        try {
          setUser(await meRequest());
        } catch (e) {
          // 401 уже обработан хендлером; при недоступном сервере токен не трогаем —
          // после восстановления связи пользователь войдёт без повторного ввода пароля.
          if (e instanceof ApiError && e.status === 401) setSessionExpired(true);
        }
      };
      await Promise.all([reloadConfig(), restore()]);
      setBooting(false);
    })();
  }, [reloadConfig]);

  const value = useMemo<AuthStateValue>(
    () => ({ user, config, sessionExpired, login, logout, reloadConfig }),
    [user, config, sessionExpired, login, logout, reloadConfig],
  );

  if (booting) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Spin size="large" tip={t("auth.connecting")}>
          <div style={{ padding: 24 }} />
        </Spin>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthState(): AuthStateValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthState must be used within <AuthProvider>");
  return ctx;
}

// Для экранов за RequireAuth: пользователь гарантированно есть.
export function useAuth(): AuthContextValue {
  const { user, config, login, logout } = useAuthState();
  if (!user) throw new Error("useAuth() вызван вне защищённой зоны (нет пользователя)");
  const devBypass = config?.devBypass ?? false;
  return {
    user,
    devBypass,
    // «Войти как» — только в демо-режиме: перелогин под представителем роли из БД.
    setRole: (role) => {
      const sample = config?.demoUsers.find((d) => d.role === role);
      if (devBypass && sample) void login(sample.userName);
    },
    login,
    logout,
  };
}
