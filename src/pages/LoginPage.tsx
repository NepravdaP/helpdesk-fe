import { useEffect, useState, type KeyboardEvent } from "react";
import { Alert, Button, Form, Input, Tag, Typography, theme } from "antd";
import { DesktopOutlined, ExperimentOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import { Navigate, useLocation, type Location } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthState } from "@/auth/AuthContext";
import { ApiError } from "@/api/client";
import type { DemoUser } from "@/api/auth";
import { ThemeLangControls } from "@/components/ThemeLangControls";
import { useThemeMode } from "@/theme/themeMode";
import { palette } from "@/theme/colors";

// Экран входа: центрированная карточка в палитре «Минстрой».
// В боевом режиме — логин и пароль от домена; в демо-режиме (AUTH_DEV_BYPASS)
// пароль не проверяется и есть кнопки быстрого входа под каждую роль.

const LAST_USER_KEY = "helpdesk.lastUser";
const ERROR_CODES = [
  "INVALID_LOGIN_FORMAT",
  "INVALID_CREDENTIALS",
  "ACCOUNT_LOCKED",
  "ACCOUNT_DISABLED",
  "PASSWORD_EXPIRED",
  "DIRECTORY_UNAVAILABLE",
  "TOO_MANY_ATTEMPTS",
  "NETWORK",
];

interface FormValues {
  userName: string;
  password?: string;
}

interface LoginError {
  text: string;
  warning: boolean; // жёлтый Alert — ситуация не про опечатку в пароле
}

// «Иванов Алексей Сергеевич» → «Иванов А. С.»
function shortName(fullName: string): string {
  const [last, ...rest] = fullName.trim().split(/\s+/);
  return [last, ...rest.map((p) => `${p.charAt(0)}.`)].join(" ");
}

function readLastUser(): string {
  try {
    return localStorage.getItem(LAST_USER_KEY) ?? "";
  } catch {
    return "";
  }
}

export function LoginPage() {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { mode } = useThemeMode();
  const location = useLocation();
  const { user, config, sessionExpired, login, reloadConfig } = useAuthState();
  const [form] = Form.useForm<FormValues>();

  // Кто запустил вход: форма или кнопка демо-пользователя (по userName) — для индикаторов загрузки.
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<LoginError | null>(null);
  const [capsLock, setCapsLock] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [lastUser] = useState(readLastUser);

  const isDark = mode === "dark";
  const devBypass = config?.devBypass ?? false;
  const demoUsers = config?.demoUsers ?? [];
  const from = (location.state as { from?: Location } | null)?.from;

  useEffect(() => {
    document.title = `${t("auth.title")} — ${t("app.title")}`;
    return () => {
      document.title = t("app.title");
    };
  }, [t]);

  // Уже вошли (или только что вошли) — возвращаем туда, откуда пришли.
  if (user) {
    const target = from && from.pathname !== "/login" ? `${from.pathname}${from.search}` : "/";
    return <Navigate to={target} replace />;
  }

  const describe = (e: unknown): LoginError => {
    if (!(e instanceof ApiError)) return { text: t("auth.errors.unknown"), warning: false };
    const code = e.code && ERROR_CODES.includes(e.code) ? e.code : null;
    if (!code) return { text: e.message || t("auth.errors.unknown"), warning: false };
    const minutes = /(\d+)\s*мин/.exec(e.message)?.[1] ?? "15";
    return {
      text: t(`auth.errors.${code}`, { minutes }),
      warning: ["ACCOUNT_LOCKED", "ACCOUNT_DISABLED", "PASSWORD_EXPIRED", "TOO_MANY_ATTEMPTS"].includes(code),
    };
  };

  const signIn = async (userName: string, password: string, source: string) => {
    setError(null);
    setSubmitting(source);
    try {
      await login(userName, password);
      try {
        localStorage.setItem(LAST_USER_KEY, userName.trim());
      } catch {
        // нет localStorage — просто не запоминаем
      }
    } catch (e) {
      setError(describe(e));
      form.setFieldValue("password", "");
      setSubmitting(null);
    }
  };

  const onFinish = (v: FormValues) => void signIn(v.userName, v.password ?? "", "form");

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => setCapsLock(e.getModifierState?.("CapsLock") ?? false);

  const retry = async () => {
    setRetrying(true);
    await reloadConfig();
    setRetrying(false);
  };

  const pageBg = isDark ? token.colorBgLayout : palette.section;
  const demoBg = isDark ? token.colorFillQuaternary : palette.chip;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: pageBg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px 16px 24px",
      }}
    >
      <div style={{ alignSelf: "flex-end" }}>
        <ThemeLangControls />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%" }}>
        {/* Бренд */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: palette.primary,
              color: palette.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
            aria-hidden
          >
            <DesktopOutlined />
          </div>
          <div style={{ lineHeight: 1.3 }}>
            <Typography.Text strong style={{ fontSize: 18, display: "block" }}>
              {t("app.title")}
            </Typography.Text>
            <Typography.Text type="secondary">{t("app.subtitle")}</Typography.Text>
          </div>
        </div>

        {/* Карточка */}
        <div
          style={{
            width: "100%",
            maxWidth: 380,
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderTop: `3px solid ${palette.primary}`,
            borderRadius: 8,
            padding: "24px 28px 28px",
          }}
        >
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t("auth.title")}
          </Typography.Title>
          <Typography.Text type="secondary">{t("auth.subtitle")}</Typography.Text>

          {!config && (
            <Alert
              style={{ marginTop: 16 }}
              type="error"
              showIcon
              message={t("auth.serverUnavailable")}
              description={
                <>
                  {t("auth.serverUnavailableDesc")}
                  <div style={{ marginTop: 8 }}>
                    <Button size="small" loading={retrying} onClick={retry}>
                      {t("auth.retry")}
                    </Button>
                  </div>
                </>
              }
            />
          )}

          {sessionExpired && !error && (
            <Alert style={{ marginTop: 16 }} type="info" showIcon message={t("auth.sessionExpired")} />
          )}

          {error && (
            <Alert
              style={{ marginTop: 16 }}
              type={error.warning ? "warning" : "error"}
              showIcon
              message={error.text}
            />
          )}

          <Form<FormValues>
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={onFinish}
            onValuesChange={() => error && setError(null)}
            initialValues={{ userName: lastUser }}
            style={{ marginTop: 20 }}
            disabled={!config}
          >
            <Form.Item
              name="userName"
              label={t("auth.userName")}
              rules={[{ required: true, whitespace: true, message: t("auth.userNameRequired") }]}
            >
              <Input
                size="large"
                prefix={<UserOutlined style={{ color: token.colorTextQuaternary }} />}
                placeholder={t("auth.userNamePlaceholder")}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                autoFocus={!lastUser}
                onKeyUp={onKey}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={t("auth.password")}
              rules={devBypass ? [] : [{ required: true, message: t("auth.passwordRequired") }]}
              extra={
                capsLock ? (
                  <Typography.Text type="warning">{t("auth.capsLock")}</Typography.Text>
                ) : devBypass ? (
                  t("auth.passwordDemoHint")
                ) : undefined
              }
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined style={{ color: token.colorTextQuaternary }} />}
                autoComplete="current-password"
                autoFocus={!!lastUser}
                onKeyUp={onKey}
                onKeyDown={onKey}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={submitting === "form"}
            >
              {t("auth.submit")}
            </Button>
          </Form>

          {devBypass && demoUsers.length > 0 && (
            <div style={{ marginTop: 20, background: demoBg, borderRadius: 8, padding: 12 }}>
              <Tag color="warning" icon={<ExperimentOutlined />} style={{ marginBottom: 10 }}>
                {t("auth.demoTitle")}
              </Tag>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
                {demoUsers.map((d: DemoUser) => (
                  <Button
                    key={d.userName}
                    loading={submitting === d.userName}
                    disabled={submitting !== null && submitting !== d.userName}
                    onClick={() => void signIn(d.userName, "", d.userName)}
                    style={{ height: "auto", padding: "6px 12px", textAlign: "left", display: "block", whiteSpace: "normal" }}
                  >
                    <span style={{ display: "block", fontWeight: 500 }}>{t(`roles.${d.role}`)}</span>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {shortName(d.fullName)}
                    </Typography.Text>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Typography.Text type="secondary" style={{ fontSize: 12, marginTop: 24 }}>
        {t("auth.footer")}
      </Typography.Text>
    </div>
  );
}
