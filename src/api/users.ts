import type { User } from "@/types";
import { api } from "./client";

// Результат массовой синхронизации с LDAP/AD (см. backend POST /users/ldap-sync).
export interface LdapSyncResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export const usersApi = {
  list: () => api<User[]>("/users"),
  update: (id: number, user: User) =>
    api<User>(`/users/${id}`, { method: "PATCH", body: user }),
  setBookingManager: (id: number, value: boolean) =>
    api<User>(`/users/${id}/booking-manager`, { method: "PATCH", body: { value } }),
  ldapSync: () => api<LdapSyncResult>("/users/ldap-sync", { method: "POST" }),
};
