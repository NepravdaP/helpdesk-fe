import type { User } from "@/types";
import { api } from "./client";

export const usersApi = {
  list: () => api<User[]>("/users"),
  update: (id: number, user: User) =>
    api<User>(`/users/${id}`, { method: "PATCH", body: user }),
  setBookingManager: (id: number, value: boolean) =>
    api<User>(`/users/${id}/booking-manager`, { method: "PATCH", body: { value } }),
};
