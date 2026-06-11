import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { USERS } from "@/data/mock";
import type { User } from "@/types";

interface UsersContextValue {
  users: User[];
  updateUser: (user: User) => void;
  setBookingManager: (id: number, value: boolean) => void;
}

const UsersContext = createContext<UsersContextValue | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(USERS);

  const value = useMemo<UsersContextValue>(
    () => ({
      users,
      updateUser: (user) => setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u))),
      setBookingManager: (id, val) =>
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, canManageBookings: val } : u))),
    }),
    [users],
  );

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}

export function useUsers(): UsersContextValue {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers must be used within <UsersProvider>");
  return ctx;
}
