// Тонкий клиент HTTP: базовый URL, JWT-токен, разбор ошибок бэкенда.

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const TOKEN_KEY = "helpdesk.token";

let token: string | null = localStorage.getItem(TOKEN_KEY);

export function setToken(value: string | null): void {
  token = value;
  if (value) localStorage.setItem(TOKEN_KEY, value);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getToken(): string | null {
  return token;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean; // прикладывать ли токен (по умолчанию да)
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth && token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Сервер недоступен. Проверьте, что бэкенд запущен.");
  }

  if (res.status === 204) return undefined as T;

  let payload: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!res.ok) {
    const message =
      (payload && typeof payload === "object" && "error" in payload
        ? String((payload as { error: unknown }).error)
        : null) ?? `Ошибка запроса (${res.status})`;
    throw new ApiError(res.status, message);
  }

  return payload as T;
}
