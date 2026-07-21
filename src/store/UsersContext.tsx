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
import { useAuth } from "@/auth/AuthContext";
import { usersApi } from "@/api/users";
import { ApiError } from "@/api/client";
import type { User } from "@/types";

// Пользователи приходят из API (для экрана «Пользователи», справочника и выпадающих списков).

interface UsersContextValue {
  users: User[];
  loading: boolean;
  updateUser: (user: User) => void;
  setBookingManager: (id: number, value: boolean) => void;
}

const UsersContext = createContext<UsersContextValue | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { message } = App.useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fail = useCallback(
    (e: unknown) => {
      message.error(e instanceof ApiError ? e.message : "Не удалось выполнить операцию");
    },
    [message],
  );

  const replace = useCallback((u: User) => {
    setUsers((prev) => prev.map((x) => (x.id === u.id ? u : x)));
  }, []);

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
    }),
    [users, loading, message, fail, replace],
  );

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}

export function useUsers(): UsersContextValue {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers must be used within <UsersProvider>");
  return ctx;
}
