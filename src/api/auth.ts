import type { User } from "@/types";
import { api, setToken } from "./client";

interface LoginResponse {
  token: string;
  user: User;
}

// Вход: получаем токен и профиль, токен сразу кладём в клиент.
export async function loginRequest(userName: string, password: string): Promise<User> {
  const res = await api<LoginResponse>("/auth/login", {
    method: "POST",
    body: { userName, password },
    auth: false,
  });
  setToken(res.token);
  return res.user;
}

// Текущий пользователь по сохранённому токену.
export async function meRequest(): Promise<User> {
  return api<User>("/auth/me");
}
