import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Popconfirm,
  Row,
  Skeleton,
  Space,
  Switch,
  Tag,
  Typography,
} from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  EditOutlined,
  ApiOutlined,
  RollbackOutlined,
  SyncOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import {
  ldapConfigApi,
  type LdapSettings,
  type LdapSettingsInput,
  type LdapTestResult,
} from "@/api/config";
import { ApiError } from "@/api/client";
import type { LdapSyncResult } from "@/api/users";
import { useUsers } from "@/store/UsersContext";

const errorText = (e: unknown, fallback: string) => (e instanceof ApiError ? e.message : fallback);

// ——— Раздел целиком: настройки подключения + синхронизация ———
export function LdapSection() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [settings, setSettings] = useState<LdapSettings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);

  const load = useCallback(() => {
    setLoadError(null);
    ldapConfigApi
      .get()
      .then(setSettings)
      .catch((e) => setLoadError(errorText(e, t("config.ldap.loadFailed"))));
  }, [t]);

  useEffect(load, [load]);

  const reset = async () => {
    try {
      setSettings(await ldapConfigApi.reset());
      message.success(t("config.ldap.resetDone"));
    } catch (e) {
      message.error(errorText(e, t("config.ldap.saveFailed")));
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {settings?.authDevBypass && (
        <Alert type="warning" showIcon message={t("config.ldap.devBypassTitle")} description={t("config.ldap.devBypassDesc")} />
      )}

      <Card
        title={t("config.ldap.connectionTitle")}
        extra={
          settings && (
            <Tag color={settings.source === "db" ? "blue" : "default"}>
              {settings.source === "db" ? t("config.ldap.sourceDb") : t("config.ldap.sourceEnv")}
            </Tag>
          )
        }
      >
        {loadError ? (
          <Alert type="error" showIcon message={loadError} action={<Button onClick={load}>{t("config.ldap.retry")}</Button>} />
        ) : !settings ? (
          <Skeleton active />
        ) : (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <SettingsView settings={settings} />
            <Space wrap>
              <Button type="primary" icon={<EditOutlined />} onClick={() => setEditOpen(true)}>
                {t("config.ldap.edit")}
              </Button>
              <Button icon={<UserOutlined />} onClick={() => setTestOpen(true)} disabled={!settings.url}>
                {t("config.ldap.testLogin")}
              </Button>
              {settings.source === "db" && (
                <Popconfirm
                  title={t("config.ldap.resetConfirmTitle")}
                  description={t("config.ldap.resetConfirmDesc")}
                  okText={t("config.ldap.reset")}
                  onConfirm={reset}
                >
                  <Button icon={<RollbackOutlined />}>{t("config.ldap.reset")}</Button>
                </Popconfirm>
              )}
            </Space>
          </Space>
        )}
      </Card>

      <LdapSyncCard />

      {settings && (
        <LdapSettingsModal
          open={editOpen}
          settings={settings}
          onClose={() => setEditOpen(false)}
          onSaved={(s) => {
            setSettings(s);
            setEditOpen(false);
          }}
        />
      )}
      <LdapTestLoginModal open={testOpen} onClose={() => setTestOpen(false)} />
    </Space>
  );
}

// ——— Просмотр текущих настроек ———
function SettingsView({ settings: s }: { settings: LdapSettings }) {
  const { t } = useTranslation();
  const val = (v: string) => (v ? <Typography.Text code>{v}</Typography.Text> : <Typography.Text type="secondary">{t("config.ldap.notSet")}</Typography.Text>);
  const secure = /^ldaps:\/\//i.test(s.url);

  return (
    <>
      <Descriptions column={{ xs: 1, lg: 2 }} size="small" bordered>
        <Descriptions.Item label={t("config.ldap.f.url")}>{val(s.url)}</Descriptions.Item>
        <Descriptions.Item label={t("config.ldap.f.searchBase")}>{val(s.searchBase)}</Descriptions.Item>
        <Descriptions.Item label={t("config.ldap.f.bindTemplate")}>{val(s.bindTemplate)}</Descriptions.Item>
        <Descriptions.Item label={t("config.ldap.f.searchFilter")}>{val(s.searchFilter)}</Descriptions.Item>
        <Descriptions.Item label={t("config.ldap.f.syncBindDn")}>
          <Space direction="vertical" size={2}>
            {s.syncBindDn ? val(s.syncBindDn) : <Typography.Text type="secondary">{t("config.ldap.anonymous")}</Typography.Text>}
            {s.syncBindDn && (
              <Tag color={s.hasSyncBindPassword ? "green" : "red"}>
                {s.hasSyncBindPassword ? t("config.ldap.passwordSet") : t("config.ldap.passwordNotSet")}
              </Tag>
            )}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label={t("config.ldap.f.syncFilter")}>{val(s.syncFilter)}</Descriptions.Item>
        <Descriptions.Item label={t("config.ldap.f.tls")}>
          {secure ? (s.tlsRejectUnauthorized ? t("config.ldap.tlsStrict") : t("config.ldap.tlsLoose")) : t("config.ldap.tlsNone")}
        </Descriptions.Item>
        <Descriptions.Item label={t("config.ldap.f.timeout")}>{t("config.ldap.seconds", { n: s.timeoutMs / 1000 })}</Descriptions.Item>
      </Descriptions>

      <Descriptions title={t("config.ldap.groupsTitle")} column={{ xs: 1, lg: 2 }} size="small" bordered>
        <Descriptions.Item label={t("roles.superadmin")}>{val(s.groupSuperadmin)}</Descriptions.Item>
        <Descriptions.Item label={t("roles.admin")}>{val(s.groupAdmin)}</Descriptions.Item>
        <Descriptions.Item label={t("roles.it")}>{val(s.groupIt)}</Descriptions.Item>
        <Descriptions.Item label={t("config.ldap.f.groupBooking")}>{val(s.groupBookingManagers)}</Descriptions.Item>
      </Descriptions>

      {s.source === "db" && s.updatedAt && (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {t("config.ldap.updatedInfo", { time: new Date(s.updatedAt).toLocaleString(), user: s.updatedBy ?? "—" })}
        </Typography.Text>
      )}
    </>
  );
}

// ——— Результат проверки подключения ———
function TestResultView({ result }: { result: LdapTestResult }) {
  const { t } = useTranslation();
  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <List
        size="small"
        bordered
        dataSource={result.steps}
        renderItem={(step) => (
          <List.Item>
            <Space align="start">
              {step.ok ? (
                <CheckCircleFilled style={{ color: "#52c41a", marginTop: 4 }} />
              ) : (
                <CloseCircleFilled style={{ color: "#ff4d4f", marginTop: 4 }} />
              )}
              <div>
                <Typography.Text strong>{t(`config.ldap.step.${step.key}`)}</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                  {t("config.ldap.ms", { n: step.durationMs })}
                </Typography.Text>
                <div style={{ fontSize: 13 }}>{step.message}</div>
              </div>
            </Space>
          </List.Item>
        )}
      />
      {result.user && (
        <Descriptions title={t("config.ldap.resolvedUser")} column={1} size="small" bordered>
          <Descriptions.Item label={t("config.ldap.u.fullName")}>{result.user.fullName}</Descriptions.Item>
          <Descriptions.Item label={t("config.ldap.u.email")}>{result.user.email}</Descriptions.Item>
          {result.user.orgTitle && (
            <Descriptions.Item label={t("config.ldap.u.title")}>{result.user.orgTitle}</Descriptions.Item>
          )}
          <Descriptions.Item label={t("config.ldap.u.role")}>
            <Tag color="blue">{t(`roles.${result.user.role}`)}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t("config.ldap.f.groupBooking")}>
            {result.user.canManageBookings ? t("config.ldap.yes") : t("config.ldap.no")}
          </Descriptions.Item>
          <Descriptions.Item label={t("config.ldap.u.groups")}>{result.user.groupsCount}</Descriptions.Item>
        </Descriptions>
      )}
    </Space>
  );
}

// ——— Редактирование настроек (одна модалка на один объект настроек) ———
function LdapSettingsModal({
  open,
  settings,
  onClose,
  onSaved,
}: {
  open: boolean;
  settings: LdapSettings;
  onClose: () => void;
  onSaved: (s: LdapSettings) => void;
}) {
  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<LdapSettingsInput>();
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<LdapTestResult | null>(null);
  const url = Form.useWatch("url", form) ?? "";
  const clearPassword = Form.useWatch("clearSyncBindPassword", form) ?? false;
  const secure = /^ldaps:\/\//i.test(url);

  const fill = () => {
    // Пароль никогда не приходит с сервера — поле всегда пустое («оставить прежний»).
    const { hasSyncBindPassword: _h, source: _s, updatedAt: _u, updatedBy: _b, authDevBypass: _d, ...rest } = settings;
    form.setFieldsValue({ ...rest, syncBindPassword: "", clearSyncBindPassword: false });
    setTestResult(null);
  };

  const collect = async (): Promise<LdapSettingsInput> => {
    const v = await form.validateFields();
    return { ...v, timeoutMs: Math.round(v.timeoutMs) };
  };

  const runTest = async () => {
    let draft: LdapSettingsInput;
    try {
      draft = await collect();
    } catch {
      return;
    }
    setTesting(true);
    try {
      setTestResult(await ldapConfigApi.test({ settings: draft }));
    } catch (e) {
      message.error(errorText(e, t("config.ldap.testFailed")));
    } finally {
      setTesting(false);
    }
  };

  const doSave = async (draft: LdapSettingsInput) => {
    setSaving(true);
    try {
      const saved = await ldapConfigApi.save(draft);
      message.success(t("config.ldap.saved"));
      onSaved(saved);
    } catch (e) {
      message.error(errorText(e, t("config.ldap.saveFailed")));
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    let draft: LdapSettingsInput;
    try {
      draft = await collect();
    } catch {
      return;
    }
    // Ошибка в настройках может закрыть вход в систему всем, включая суперадмина, —
    // без успешной проверки просим явное подтверждение.
    if (testResult?.ok) return doSave(draft);
    modal.confirm({
      title: t("config.ldap.untestedTitle"),
      content: t("config.ldap.untestedDesc"),
      okText: t("config.ldap.saveAnyway"),
      okButtonProps: { danger: true },
      onOk: () => doSave(draft),
    });
  };

  const placeholderFilter = "(&(objectClass=user)(objectCategory=person))";

  return (
    <Modal
      open={open}
      title={t("config.ldap.editTitle")}
      width={760}
      centered
      destroyOnClose
      onCancel={onClose}
      afterOpenChange={(o) => o && fill()}
      footer={[
        <Button key="test" icon={<ApiOutlined />} loading={testing} onClick={runTest} style={{ float: "left" }}>
          {t("config.ldap.testConnection")}
        </Button>,
        <Button key="c" onClick={onClose}>
          {t("common.cancel")}
        </Button>,
        <Button key="s" type="primary" loading={saving} onClick={save}>
          {t("common.save")}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        // Любая правка делает прошлую проверку неактуальной.
        onValuesChange={() => setTestResult(null)}
        style={{ maxHeight: "65vh", overflowY: "auto", paddingRight: 8 }}
      >
        <Divider orientation="left" plain style={{ marginTop: 0 }}>
          {t("config.ldap.secServer")}
        </Divider>
        <Row gutter={16}>
          <Col xs={24} md={16}>
            <Form.Item
              name="url"
              label={t("config.ldap.f.url")}
              extra={t("config.ldap.h.url")}
              rules={[
                { required: true, message: t("config.ldap.v.required") },
                { pattern: /^ldaps?:\/\/\S+$/i, message: t("config.ldap.v.url") },
              ]}
            >
              <Input placeholder="ldap://dc01.org.local:389" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="timeoutMs" label={t("config.ldap.f.timeoutMs")} rules={[{ required: true }]}>
              <InputNumber min={1000} max={60000} step={1000} style={{ width: "100%" }} addonAfter={t("config.ldap.msShort")} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="tlsRejectUnauthorized"
          label={t("config.ldap.f.tlsCheck")}
          valuePropName="checked"
          extra={secure ? t("config.ldap.h.tlsCheck") : t("config.ldap.h.tlsOnlyLdaps")}
        >
          <Switch disabled={!secure} />
        </Form.Item>

        <Divider orientation="left" plain>
          {t("config.ldap.secLogin")}
        </Divider>
        <Form.Item
          name="bindTemplate"
          label={t("config.ldap.f.bindTemplate")}
          extra={t("config.ldap.h.bindTemplate")}
          rules={[
            { required: true, message: t("config.ldap.v.required") },
            { pattern: /\{username\}/, message: t("config.ldap.v.username") },
          ]}
        >
          <Input placeholder="{username}@org.local" />
        </Form.Item>
        <Form.Item
          name="searchFilter"
          label={t("config.ldap.f.searchFilter")}
          rules={[
            { required: true, message: t("config.ldap.v.required") },
            { pattern: /\{username\}/, message: t("config.ldap.v.username") },
          ]}
        >
          <Input placeholder="(sAMAccountName={username})" />
        </Form.Item>

        <Divider orientation="left" plain>
          {t("config.ldap.secDirectory")}
        </Divider>
        <Form.Item
          name="searchBase"
          label={t("config.ldap.f.searchBase")}
          extra={t("config.ldap.h.searchBase")}
          rules={[{ required: true, message: t("config.ldap.v.required") }]}
        >
          <Input placeholder="OU=Users,DC=org,DC=local" />
        </Form.Item>
        <Form.Item
          name="syncFilter"
          label={t("config.ldap.f.syncFilter")}
          extra={t("config.ldap.h.syncFilter")}
          rules={[{ required: true, message: t("config.ldap.v.required") }]}
        >
          <Input placeholder={placeholderFilter} />
        </Form.Item>
        <Form.Item name="syncBindDn" label={t("config.ldap.f.syncBindDn")} extra={t("config.ldap.h.syncBindDn")}>
          <Input placeholder="CN=svc-helpdesk,OU=Service Accounts,DC=org,DC=local" />
        </Form.Item>
        <Form.Item
          name="syncBindPassword"
          label={t("config.ldap.f.syncBindPassword")}
          extra={settings.hasSyncBindPassword ? t("config.ldap.h.passwordKeep") : undefined}
        >
          <Input.Password
            autoComplete="new-password"
            disabled={clearPassword}
            placeholder={settings.hasSyncBindPassword ? "••••••••" : ""}
          />
        </Form.Item>
        {settings.hasSyncBindPassword && (
          <Form.Item name="clearSyncBindPassword" valuePropName="checked" style={{ marginTop: -8 }}>
            <Checkbox>{t("config.ldap.clearPassword")}</Checkbox>
          </Form.Item>
        )}

        <Divider orientation="left" plain>
          {t("config.ldap.groupsTitle")}
        </Divider>
        <Typography.Paragraph type="secondary" style={{ fontSize: 13 }}>
          {t("config.ldap.h.groups")}
        </Typography.Paragraph>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="groupSuperadmin" label={t("roles.superadmin")}>
              <Input placeholder="HelpDesk-Superadmins" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="groupAdmin" label={t("roles.admin")}>
              <Input placeholder="HelpDesk-Admins" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="groupIt" label={t("roles.it")}>
              <Input placeholder="HelpDesk-IT" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="groupBookingManagers" label={t("config.ldap.f.groupBooking")} extra={t("config.ldap.h.groupBooking")}>
              <Input placeholder="HelpDesk-BookingManagers" />
            </Form.Item>
          </Col>
        </Row>

        {testResult && (
          <>
            <Divider orientation="left" plain>
              {t("config.ldap.testResultTitle")}
            </Divider>
            <TestResultView result={testResult} />
          </>
        )}
      </Form>
    </Modal>
  );
}

// ——— Проверка входа конкретного пользователя по действующим настройкам ———
function LdapTestLoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<{ userName: string; password: string }>();
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<LdapTestResult | null>(null);

  const run = async (v: { userName: string; password: string }) => {
    setTesting(true);
    try {
      setResult(await ldapConfigApi.test({ testUser: v }));
    } catch (e) {
      message.error(errorText(e, t("config.ldap.testFailed")));
    } finally {
      setTesting(false);
      form.setFieldValue("password", "");
    }
  };

  return (
    <Modal
      open={open}
      title={t("config.ldap.testLoginTitle")}
      width={620}
      centered
      destroyOnClose
      onCancel={onClose}
      afterOpenChange={(o) => {
        if (o) {
          form.resetFields();
          setResult(null);
        }
      }}
      footer={[
        <Button key="c" onClick={onClose}>
          {t("config.ldap.close")}
        </Button>,
        <Button key="t" type="primary" icon={<ApiOutlined />} loading={testing} onClick={() => form.submit()}>
          {t("config.ldap.runCheck")}
        </Button>,
      ]}
    >
      <Typography.Paragraph type="secondary" style={{ fontSize: 13 }}>
        {t("config.ldap.testLoginDesc")}
      </Typography.Paragraph>
      <Form form={form} layout="vertical" requiredMark={false} onFinish={run}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="userName" label={t("config.ldap.u.login")} rules={[{ required: true, message: t("config.ldap.v.required") }]}>
              <Input autoComplete="off" autoFocus />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="password" label={t("config.ldap.u.password")} rules={[{ required: true, message: t("config.ldap.v.required") }]}>
              <Input.Password autoComplete="new-password" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      {result && <TestResultView result={result} />}
    </Modal>
  );
}

// ——— Массовая синхронизация ———
function LdapSyncCard() {
  const { t } = useTranslation();
  const { syncing, syncFromLdap } = useUsers();
  const [lastResult, setLastResult] = useState<LdapSyncResult | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  const handleSync = async () => {
    const result = await syncFromLdap();
    if (result) {
      setLastResult(result);
      setLastSyncAt(new Date());
    }
  };

  return (
    <Card title={t("config.ldap.syncTitle")}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <div>
          <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
            {t("config.ldap.syncDesc")}
          </Typography.Paragraph>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {lastSyncAt
              ? t("config.ldap.lastSync", { time: lastSyncAt.toLocaleString() })
              : t("config.ldap.neverSynced")}
          </Typography.Text>
        </div>

        <Button
          type="primary"
          icon={<SyncOutlined spin={syncing} />}
          loading={syncing}
          onClick={handleSync}
          style={{ alignSelf: "flex-start" }}
        >
          {syncing ? t("config.ldap.syncing") : t("config.ldap.syncButton")}
        </Button>

        {lastResult && (
          <>
            <Descriptions column={3} size="small" bordered>
              <Descriptions.Item label={t("config.ldap.created")}>{lastResult.created}</Descriptions.Item>
              <Descriptions.Item label={t("config.ldap.updated")}>{lastResult.updated}</Descriptions.Item>
              <Descriptions.Item label={t("config.ldap.skipped")}>{lastResult.skipped}</Descriptions.Item>
            </Descriptions>
            {lastResult.errors.length > 0 && (
              <Alert
                type="warning"
                showIcon
                message={`${t("config.ldap.errorsTitle")} (${lastResult.errors.length})`}
                description={
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {lastResult.errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                }
              />
            )}
          </>
        )}
      </Space>
    </Card>
  );
}
