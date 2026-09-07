import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { App } from "antd";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/auth/AuthContext";
import { usersApi, type LdapSyncResult } from "@/api/users";
import { ApiError } from "@/api/client";
import type { User } from "@/types";

// Пользователи приходят из API (для экрана «Пользователи», справочника и выпадающих списков).

interface UsersContextValue {
  users: User[];
  loading: boolean;
  syncing: boolean;
  updateUser: (user: User) => void;
  setBookingManager: (id: number, value: boolean) => void;
  syncFromLdap: () => Promise<LdapSyncResult | null>;
}

const UsersContext = createContext<UsersContextValue | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { message } = App.useApp();
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fail = useCallback(
    (e: unknown) => {
      message.error(e instanceof ApiError ? e.message : "Не удалось выполнить операцию");
    },
    [message],
  );

  const replace = useCallback((u: User) => {
    setUsers((prev) => prev.map((x) => (x.id === u.id ? u : x)));
  }, []);

  const reload = useCallback(() => usersApi.list().then(setUsers), []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    usersApi
      .list()
      .then((list) => {
        if (alive) setUsers(list);
      })
      .catch((e) => {
        if (alive) fail(e);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [user.id, fail]);

  const value = useMemo<UsersContextValue>(
    () => ({
      users,
      loading,
      syncing,
      updateUser: (u) => {
        usersApi
          .update(u.id, u)
          .then((row) => {
            replace(row);
            message.success("Профиль сохранён");
          })
          .catch(fail);
      },
      setBookingManager: (id, val) => {
        usersApi.setBookingManager(id, val).then(replace).catch(fail);
      },
      // Массовая синхронизация с AD: тянет всех пользователей и обновляет список.
      // Возвращает статистику (created/updated/skipped/errors) для отображения в UI, либо null при ошибке.
      syncFromLdap: async () => {
        setSyncing(true);
        try {
          const result = await usersApi.ldapSync();
          await reload();
          message.success(t("config.ldap.successMessage"));
          return result;
        } catch (e) {
          fail(e);
          return null;
        } finally {
          setSyncing(false);
        }
      },
    }),
    [users, loading, syncing, message, fail, replace, reload, t],
  );

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}

export function useUsers(): UsersContextValue {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers must be used within <UsersProvider>");
  return ctx;
}
