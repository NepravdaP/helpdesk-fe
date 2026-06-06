import { useMemo } from "react";
import { Layout, Menu, Segmented, Select, Space, Typography } from "antd";
import {
  DashboardOutlined,
  CustomerServiceOutlined,
  DesktopOutlined,
  CalendarOutlined,
  TeamOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/auth/AuthContext";
import { palette } from "@/theme/colors";
import type { Role } from "@/types";

const { Sider, Header, Content } = Layout;

interface NavItem {
  key: string;
  path: string;
  icon: React.ReactNode;
  labelKey: string;
  group: "modules" | "admin";
  allow: Role[];
}

const NAV: NavItem[] = [
  { key: "dashboard", path: "/dashboard", icon: <DashboardOutlined />, labelKey: "nav.dashboard", group: "modules", allow: ["employee", "it", "admin"] },
  { key: "helpdesk", path: "/helpdesk", icon: <CustomerServiceOutlined />, labelKey: "nav.helpdesk", group: "modules", allow: ["employee", "it", "admin"] },
  { key: "inventory", path: "/inventory", icon: <DesktopOutlined />, labelKey: "nav.inventory", group: "modules", allow: ["employee", "it", "admin"] },
  { key: "booking", path: "/booking", icon: <CalendarOutlined />, labelKey: "nav.booking", group: "modules", allow: ["employee", "it", "admin"] },
  { key: "users", path: "/users", icon: <TeamOutlined />, labelKey: "nav.users", group: "admin", allow: ["admin"] },
  { key: "reports", path: "/reports", icon: <BarChartOutlined />, labelKey: "nav.reports", group: "admin", allow: ["admin"] },
];

export function AppLayout() {
  const { t, i18n } = useTranslation();
  const { user, setRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey =
    NAV.find((n) => location.pathname.startsWith(n.path))?.key ?? "dashboard";

  const menuItems = useMemo(() => {
    const visible = NAV.filter((n) => n.allow.includes(user.role));
    const byGroup = (g: NavItem["group"]) =>
      visible
        .filter((n) => n.group === g)
        .map((n) => ({ key: n.key, icon: n.icon, label: t(n.labelKey) }));

    const groups = [
      { key: "g-modules", type: "group" as const, label: t("groups.modules"), children: byGroup("modules") },
    ];
    const adminChildren = byGroup("admin");
    if (adminChildren.length) {
      groups.push({ key: "g-admin", type: "group" as const, label: t("groups.admin"), children: adminChildren });
    }
    return groups;
  }, [user.role, t, i18n.language]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={220} theme="light" style={{ borderRight: `1px solid ${palette.panel}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 20px" }}>
          <DesktopOutlined style={{ fontSize: 20, color: palette.primary }} />
          <Typography.Text strong>{t("app.title")}</Typography.Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{ borderInlineEnd: "none", background: "transparent" }}
          onClick={({ key }) => {
            const item = NAV.find((n) => n.key === key);
            if (item) navigate(item.path);
          }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 16,
            padding: "0 20px",
            borderBottom: `1px solid ${palette.panel}`,
          }}
        >
          <Segmented
            size="small"
            value={i18n.language.startsWith("en") ? "en" : "ru"}
            options={[
              { label: "RU", value: "ru" },
              { label: "EN", value: "en" },
            ]}
            onChange={(v) => i18n.changeLanguage(v as string)}
          />

          <Space size={8}>
            <Typography.Text type="secondary">{t("common.actAs")}:</Typography.Text>
            <Select<Role>
              size="small"
              value={user.role}
              style={{ width: 160 }}
              onChange={setRole}
              options={[
                { value: "employee", label: t("roles.employee") },
                { value: "it", label: t("roles.it") },
                { value: "admin", label: t("roles.admin") },
              ]}
            />
          </Space>

          <Typography.Text strong>{user.fullName}</Typography.Text>
        </Header>

        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
