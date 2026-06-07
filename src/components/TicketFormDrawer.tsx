import { Button, Drawer, Form, Input, Select, Space, Tag, Typography, theme } from "antd";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/auth/AuthContext";
import { TICKET_TYPE_CONFIG } from "@/config/ticketTypes";
import type { Ticket, TicketPriority, TicketType } from "@/types";

const PRIORITY_COLOR: Record<TicketPriority, string> = {
  low: "default",
  medium: "gold",
  high: "red",
};

// Списки — пока мок. Позже придут из API: пользователи из LDAP, активы из инвентаризации.
const MOCK_USERS = [
  { value: 1, label: "А. Иванов" },
  { value: 2, label: "С. Орлов" },
  { value: 3, label: "О. Кузнецова" },
  { value: 4, label: "П. Сидоров" },
  { value: 5, label: "Е. Петрова" },
  { value: 6, label: "Д. Волков" },
  { value: 7, label: "К. Смирнов" },
  { value: 8, label: "М. Зайцева" },
  { value: 9, label: "Н. Морозова" },
];

const MOCK_EQUIPMENT = [
  { value: 21, label: "Принтер HP LaserJet — каб. 304" },
  { value: 58, label: "Монитор Dell U2419 — АРМ-58" },
  { value: 12, label: "Проектор Epson EB-2247U — переговорная" },
  { value: 73, label: "Системный блок Lenovo M70 — АРМ-73" },
  { value: 31, label: "МФУ Kyocera M2540 — каб. 210" },
  { value: 64, label: "Ноутбук HP ProBook — АРМ-64" },
  { value: 19, label: "Коммутатор Cisco SG350 — серверная" },
  { value: 88, label: "ИБП APC Smart-UPS — серверная" },
];

interface FormValues {
  type: TicketType;
  title: string;
  description: string;
  requesterId: number;
  equipmentId?: number;
}

// Строка для таблицы — с развёрнутым именем заявителя/исполнителя.
export type NewTicket = Ticket & { requesterName: string; assigneeName: string | null };

export function TicketFormDrawer({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (ticket: NewTicket) => void;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { token } = theme.useToken();
  const [form] = Form.useForm<FormValues>();

  const selectedType = Form.useWatch("type", form) as TicketType | undefined;
  const cfg = selectedType ? TICKET_TYPE_CONFIG[selectedType] : null;

  const typeOptions = (Object.keys(TICKET_TYPE_CONFIG) as TicketType[]).map((tp) => ({
    value: tp,
    label: t(`tickets.type.${tp}`),
  }));

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = (values: FormValues) => {
    const conf = TICKET_TYPE_CONFIG[values.type];
    const requester = MOCK_USERS.find((u) => u.value === values.requesterId);
    const now = new Date().toISOString();
    onCreate({
      id: Date.now(), // временный id; на бэке выдаст БД
      title: values.title,
      description: values.description,
      type: values.type,
      priority: conf.priority, // ← из конфига типа
      status: "open",
      group: conf.group, // ← из конфига типа
      createdById: values.requesterId,
      assignedToId: null,
      equipmentId: values.equipmentId ?? null,
      createdAt: now,
      updatedAt: now,
      requesterName: requester?.label ?? "—",
      assigneeName: null,
    });
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      title={t("tickets.new")}
      width={480}
      open={open}
      onClose={handleClose}
      destroyOnClose
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={handleClose}>{t("common.cancel")}</Button>
          <Button type="primary" onClick={() => form.submit()}>
            {t("tickets.form.submit")}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark="optional"
        initialValues={{ requesterId: user.id }}
      >
        <Form.Item
          name="type"
          label={t("tickets.form.type")}
          rules={[{ required: true, message: t("tickets.form.required") }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            placeholder={t("tickets.form.typePlaceholder")}
            options={typeOptions}
          />
        </Form.Item>

        <Form.Item
          name="requesterId"
          label={t("tickets.form.requester")}
          rules={[{ required: true, message: t("tickets.form.required") }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            placeholder={t("tickets.form.requesterPlaceholder")}
            options={MOCK_USERS}
          />
        </Form.Item>

        <Form.Item
          name="title"
          label={t("tickets.form.subject")}
          rules={[{ required: true, message: t("tickets.form.required") }]}
        >
          <Input placeholder={t("tickets.form.subjectPlaceholder")} maxLength={120} />
        </Form.Item>

        <Form.Item
          name="description"
          label={t("tickets.form.description")}
          rules={[{ required: true, message: t("tickets.form.required") }]}
        >
          <Input.TextArea
            rows={4}
            placeholder={t("tickets.form.descriptionPlaceholder")}
            maxLength={2000}
            showCount
          />
        </Form.Item>

        <Form.Item name="equipmentId" label={t("tickets.form.equipment")}>
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder={t("tickets.form.equipmentPlaceholder")}
            options={MOCK_EQUIPMENT}
          />
        </Form.Item>

        <div
          style={{
            background: token.colorFillQuaternary,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: 8,
            padding: "12px 16px",
          }}
        >
          <Typography.Text strong>{t("tickets.form.derivedTitle")}</Typography.Text>
          <Typography.Paragraph type="secondary" style={{ fontSize: 12, margin: "4px 0 12px" }}>
            {t("tickets.form.derivedHint")}
          </Typography.Paragraph>

          {cfg ? (
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Row label={t("tickets.col.priority")}>
                <Tag color={PRIORITY_COLOR[cfg.priority]} style={{ marginInlineEnd: 0 }}>
                  {t(`tickets.priority.${cfg.priority}`)}
                </Tag>
              </Row>
              <Row label={t("tickets.col.group")}>{t(`tickets.ticketGroup.${cfg.group}`)}</Row>
              <Row label={t("tickets.form.sla")}>
                {cfg.slaHours} {t("tickets.form.hours")}
              </Row>
            </Space>
          ) : (
            <Typography.Text type="secondary">{t("tickets.form.selectTypeFirst")}</Typography.Text>
          )}
        </div>
      </Form>
    </Drawer>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Typography.Text type="secondary">{label}</Typography.Text>
      <span>{children}</span>
    </div>
  );
}
