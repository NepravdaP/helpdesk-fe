import { useMemo } from "react";
import { Button, Drawer, Form, Input, Select, Space, Tag, Typography, theme } from "antd";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/auth/AuthContext";
import { useConfig } from "@/store/ConfigContext";
import { MOCK_USERS, MOCK_EQUIPMENT } from "@/data/mock";
import type { TicketPriority, TicketRow } from "@/types";

const PRIORITY_COLOR: Record<TicketPriority, string> = {
  low: "default",
  medium: "gold",
  high: "red",
};

interface FormValues {
  type: string;
  title: string;
  description: string;
  requesterId: number;
  equipmentId?: number;
}

export function TicketFormDrawer({
  open,
  ticket,
  onClose,
  onCreate,
  onUpdate,
}: {
  open: boolean;
  ticket: TicketRow | null; // null → создание, иначе редактирование
  onClose: () => void;
  onCreate: (ticket: TicketRow) => void;
  onUpdate: (ticket: TicketRow) => void;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { services, ticketTypeByKey } = useConfig();
  const { token } = theme.useToken();
  const [form] = Form.useForm<FormValues>();

  const selectedType = Form.useWatch("type", form) as string | undefined;
  const svc = selectedType ? ticketTypeByKey(selectedType) : null;

  const serviceOptions = services.map((s) => ({
    label: s.name,
    options: s.ticketTypes.map((tt) => ({ value: tt.key, label: tt.name })),
  }));

  const initialValues = useMemo(
    () =>
      ticket
        ? {
            type: ticket.type,
            title: ticket.title,
            description: ticket.description,
            requesterId: ticket.createdById,
            equipmentId: ticket.equipmentId ?? undefined,
          }
        : { requesterId: user.id },
    [ticket, user.id],
  );

  const close = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = (values: FormValues) => {
    const service = ticketTypeByKey(values.type)!;
    const requester = MOCK_USERS.find((u) => u.value === values.requesterId);
    const now = new Date().toISOString();
    if (ticket) {
      onUpdate({
        ...ticket,
        title: values.title,
        description: values.description,
        type: values.type,
        priority: service.priority,
        group: service.group,
        createdById: values.requesterId,
        requesterName: requester?.label ?? ticket.requesterName,
        equipmentId: values.equipmentId ?? null,
        updatedAt: now,
      });
    } else {
      onCreate({
        id: Date.now(),
        title: values.title,
        description: values.description,
        type: values.type,
        priority: service.priority,
        status: "request",
        group: service.group,
        createdById: values.requesterId,
        assignedToId: null,
        equipmentId: values.equipmentId ?? null,
        createdAt: now,
        updatedAt: now,
        requesterName: requester?.label ?? "—",
        assigneeName: null,
      });
    }
    close();
  };

  return (
    <Drawer
      title={ticket ? t("tickets.form.editTitle") : t("tickets.new")}
      width={480}
      open={open}
      onClose={close}
      destroyOnClose
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={close}>{t("common.cancel")}</Button>
          <Button type="primary" onClick={() => form.submit()}>
            {ticket ? t("assets.form.submit") : t("tickets.form.submit")}
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" initialValues={initialValues} onFinish={handleSubmit} requiredMark="optional">
        <Form.Item name="type" label={t("tickets.form.type")} rules={[{ required: true, message: t("tickets.form.required") }]}>
          <Select
            showSearch
            optionFilterProp="label"
            placeholder={t("tickets.form.typePlaceholder")}
            options={serviceOptions}
          />
        </Form.Item>

        <Form.Item name="requesterId" label={t("tickets.form.requester")} rules={[{ required: true, message: t("tickets.form.required") }]}>
          <Select showSearch optionFilterProp="label" placeholder={t("tickets.form.requesterPlaceholder")} options={MOCK_USERS} />
        </Form.Item>

        <Form.Item name="title" label={t("tickets.form.subject")} rules={[{ required: true, message: t("tickets.form.required") }]}>
          <Input placeholder={t("tickets.form.subjectPlaceholder")} maxLength={120} />
        </Form.Item>

        <Form.Item name="description" label={t("tickets.form.description")} rules={[{ required: true, message: t("tickets.form.required") }]}>
          <Input.TextArea rows={4} placeholder={t("tickets.form.descriptionPlaceholder")} maxLength={2000} showCount />
        </Form.Item>

        <Form.Item name="equipmentId" label={t("tickets.form.equipment")}>
          <Select allowClear showSearch optionFilterProp="label" placeholder={t("tickets.form.equipmentPlaceholder")} options={MOCK_EQUIPMENT} />
        </Form.Item>

        <div style={{ background: token.colorFillQuaternary, border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 8, padding: "12px 16px" }}>
          <Typography.Text strong>{t("tickets.form.derivedTitle")}</Typography.Text>
          <Typography.Paragraph type="secondary" style={{ fontSize: 12, margin: "4px 0 12px" }}>
            {t("tickets.form.derivedHint")}
          </Typography.Paragraph>
          {svc ? (
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Row label={t("tickets.col.priority")}>
                <Tag color={PRIORITY_COLOR[svc.priority]} style={{ marginInlineEnd: 0 }}>
                  {t(`tickets.priority.${svc.priority}`)}
                </Tag>
              </Row>
              <Row label={t("tickets.col.group")}>{t(`tickets.ticketGroup.${svc.group}`)}</Row>
              <Row label={t("tickets.form.sla")}>
                {svc.slaHours} {t("tickets.form.hours")}
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
