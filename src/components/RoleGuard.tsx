import { Navigate } from "react-router-dom";
import { Result } from "antd";
import { useAuth } from "@/auth/AuthContext";
import type { Role } from "@/types";

// Защита роута по ролям. Если роль не разрешена — показываем 403.
export function RoleGuard({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  if (!allow.includes(user.role)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Недостаточно прав для просмотра этого раздела."
      />
    );
  }
  return <>{children}</>;
}

// Куда отправлять с корня "/" — зависит от роли (заглушка-редирект).
export function HomeRedirect() {
  return <Navigate to="/dashboard" replace />;
}
