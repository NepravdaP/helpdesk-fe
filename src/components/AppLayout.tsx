import { useMemo } from "react";
import { Avatar, Button, Dropdown, Layout, Menu, Select, Space, Tag, Typography, theme } from "antd";
import {
  DashboardOutlined,
  CustomerServiceOutlined,
  DesktopOutlined,
  CalendarOutlined,
  TeamOutlined,
  PhoneOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  DownOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/auth/AuthContext";
import { can, type Capability } from "@/auth/permissions";
import { useThemeMode } from "@/theme/themeMode";
import { palette } from "@/theme/colors";
import { ThemeLangControls } from "@/components/ThemeLangControls";
import type { Role } from "@/types";

const { Sider, Header, Content } = Layout;

interface NavItem {
  key: string;
  path: string;
  icon: React.ReactNode;
  labelKey: string;
  group: "modules" | "management";
  cap: Capability;
}

const NAV: NavItem[] = [
  { key: "dashboard", path: "/dashboard", icon: <DashboardOutlined />, labelKey: "nav.dashboard", group: "modules", cap: "dashboard.own" },
  { key: "helpdesk", path: "/helpdesk", icon: <CustomerServiceOutlined />, labelKey: "nav.helpdesk", group: "modules", cap: "tickets.create" },
  { key: "assets", path: "/assets", icon: <DesktopOutlined />, labelKey: "nav.assets", group: "modules", cap: "assets.view" },
  { key: "booking", path: "/booking", icon: <CalendarOutlined />, labelKey: "nav.booking", group: "modules", cap: "booking.view" },
  { key: "directory", path: "/directory", icon: <PhoneOutlined />, labelKey: "nav.directory", group: "modules", cap: "directory.view" },
  { key: "users", path: "/users", icon: <TeamOutlined />, labelKey: "nav.users", group: "management", cap: "users.view" },
  { key: "reports", path: "/reports", icon: <BarChartOutlined />, labelKey: "nav.reports", group: "management", cap: "reports.view" },
  { key: "config", path: "/config", icon: <SettingOutlined />, labelKey: "nav.config", group: "management", cap: "config.manage" },
];

const ROLE_OPTIONS: Role[] = ["employee", "it", "admin", "superadmin"];

// Инициалы для аватара: «Иванов Алексей Сергеевич» → «ИА».
function initials(fullName: string): string {
  const [last = "", first = ""] = fullName.trim().split(/\s+/);
  return `${last.charAt(0)}${first.charAt(0)}`.toUpperCase();
}

export function AppLayout() {
  const { t, i18n } = useTranslation();
  const { user, setRole, logout, devBypass } = useAuth();
  const { mode } = useThemeMode();
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();

  const isDark = mode === "dark";
  const siderTheme = isDark ? "dark" : "light";

  const selectedKey =
    NAV.find((n) => location.pathname.startsWith(n.path))?.key ?? "dashboard";

  const menuItems = useMemo(() => {
    const visible = NAV.filter((n) => can(user.role, n.cap));
    const byGroup = (g: NavItem["group"]) =>
      visible
        .filter((n) => n.group === g)
        .map((n) => ({ key: n.key, icon: n.icon, label: t(n.labelKey) }));

    const groups: Array<{ key: string; type: "group"; label: string; children: ReturnType<typeof byGroup> }> = [];
    const modules = byGroup("modules");
    if (modules.length) groups.push({ key: "g-modules", type: "group", label: t("groups.modules"), children: modules });
    const management = byGroup("management");
    if (management.length) groups.push({ key: "g-management", type: "group", label: t("groups.management"), children: management });
    return groups;
  }, [user.role, t, i18n.language]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={220} theme={siderTheme} style={{ borderRight: `1px solid ${token.colorBorderSecondary}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 20px" }}>
          <DesktopOutlined style={{ fontSize: 20, color: palette.primary }} />
          <Typography.Text strong>{t("app.title")}</Typography.Text>
        </div>
        <Menu
          theme={siderTheme}
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{ borderInlineEnd: "none", background: "transparent" }}
          onClick={({ key }) => {
            const item = NAV.find((n) => n.key === key);
            if (item) navigate(item.path, { state: { ts: Date.now() } });
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
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <ThemeLangControls />

          {/* «Войти как» — только в демо-режиме (AUTH_DEV_BYPASS): с реальным AD роль задают группы домена */}
          {devBypass && (
            <Space size={8}>
              <Tag color="warning" icon={<ExperimentOutlined />} style={{ marginInlineEnd: 0 }}>
                {t("common.actAs")}
              </Tag>
              <Select<Role>
                size="small"
                value={user.role}
                style={{ width: 170 }}
                onChange={(r) => {
                  setRole(r);
                  navigate("/");
                }}
                options={ROLE_OPTIONS.map((r) => ({ value: r, label: t(`roles.${r}`) }))}
              />
            </Space>
          )}

          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            menu={{
              items: [
                {
                  key: "me",
                  disabled: true,
                  label: (
                    <div style={{ lineHeight: 1.4, maxWidth: 260 }}>
                      <Typography.Text strong style={{ display: "block" }}>
                        {user.fullName}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {[t(`roles.${user.role}`), user.orgTitle].filter(Boolean).join(", ")}
                      </Typography.Text>
                    </div>
                  ),
                },
                { type: "divider" },
                { key: "logout", icon: <LogoutOutlined />, label: t("common.logout"), danger: true },
              ],
              onClick: ({ key }) => {
                if (key === "logout") logout();
              },
            }}
          >
            <Button type="text" style={{ height: 40, display: "flex", alignItems: "center", gap: 8, paddingInline: 8 }}>
              <Avatar size={28} src={user.avatarUrl || undefined} style={{ background: palette.primary, fontSize: 12 }}>
                {initials(user.fullName)}
              </Avatar>
              <Typography.Text strong>{user.fullName}</Typography.Text>
              <DownOutlined style={{ fontSize: 10, color: token.colorTextTertiary }} />
            </Button>
          </Dropdown>
        </Header>

        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
