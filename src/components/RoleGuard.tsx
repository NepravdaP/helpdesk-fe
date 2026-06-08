import { Navigate } from "react-router-dom";
import { Result } from "antd";
import { useAuth } from "@/auth/AuthContext";
import { can, type Capability } from "@/auth/permissions";

// Защита роута по способности (capability). Если её нет — 403.
export function RoleGuard({
  cap,
  children,
}: {
  cap: Capability;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  if (!can(user.role, cap)) {
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

// Стартовая страница зависит от роли: у кого есть дашборд — на дашборд,
// у остальных (сотрудник, админ залов) — на заявки.
export function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={can(user.role, "dashboard.own") ? "/dashboard" : "/helpdesk"} replace />;
}
