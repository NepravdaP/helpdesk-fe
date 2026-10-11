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

// Реакция на 401 по запросу с токеном (токен протух или пользователь удалён).
// Регистрирует AuthContext: сбрасывает сессию и отправляет на экран входа.
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(fn: (() => void) | null): void {
  unauthorizedHandler = fn;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string, // машинный код ошибки бэкенда (например, INVALID_CREDENTIALS)
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
  const sentToken = auth && token ? token : null;
  if (sentToken) headers["Authorization"] = `Bearer ${sentToken}`;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Сервер недоступен. Проверьте, что бэкенд запущен.", "NETWORK");
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
    const obj = payload && typeof payload === "object" ? (payload as { error?: unknown; code?: unknown }) : null;
    const message = obj && "error" in obj ? String(obj.error) : `Ошибка запроса (${res.status})`;
    const code = obj && typeof obj.code === "string" ? obj.code : undefined;
    // Сессию сбрасываем, только если 401 пришёл на тот же токен, что ещё актуален
    // (ответы на старые запросы после повторного входа не должны разлогинивать).
    if (res.status === 401 && sentToken && sentToken === token) unauthorizedHandler?.();
    throw new ApiError(res.status, message, code);
  }

  return payload as T;
}
