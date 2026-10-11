import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthState } from "./AuthContext";

// Пропускает в приложение только вошедшего пользователя,
// иначе — на экран входа с запоминанием исходной страницы.
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuthState();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <>{children}</>;
}
