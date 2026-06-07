import { useState } from "react";
import {
  Alert,
  Button,
  Descriptions,
  Divider,
  Drawer,
  Input,
  Select,
  Space,
  Tag,
  Timeline,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/auth/AuthContext";
import { MOCK_USERS, MOCK_EQUIPMENT } from "@/data/mock";
import { formatDateTime } from "@/utils/format";
import type {
  ActivityEntry,
  TicketPriority,
  TicketRow,
  TicketStatus,
} from "@/types";

const STATUS_COLOR: Record<TicketStatus, string> = {
  open: "blue",
  in_progress: "gold",
  closed: "green",
};
const PRIORITY_COLOR: Record<TicketPriority, string> = {
  low: "default",
  medium: "gold",
  high: "red",
};
const ACT_COLOR: Record<ActivityEntry["kind"], string> = {
  created: "green",
  status: "blue",
  assignee: "gold",
  comment: "gray",
};

export function TicketDetailDrawer({
  ticket,
  activity,
  onClose,
  onStatusChange,
  onAssigneeChange,
  onAddComment,
  onOpenUser,
  onOpenAsset,
}: {
  ticket: TicketRow | null;
  activity: ActivityEntry[];
  onClose: () => void;
  onStatusChange: (id: number, status: TicketStatus) => void;
  onAssigneeChange: (id: number, userId: number | null) => void;
  onAddComment: (id: number, text: string) => void;
  onOpenUser: (id: number) => void;
  onOpenAsset: (id: number) => void;
}) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [comment, setComment] = useState("");

  const canEdit = user.role === "it" || user.role === "admin";
  const lang = i18n.language;

  // Прочерк — только когда актив не назначен. Если назначен, но его нет
  // в загруженном списке, показываем хотя бы его идентификатор, а не прочерк.
  const equipmentLabel =
    ticket?.equipmentId != null
      ? (MOCK_EQUIPMENT.find((e) => e.value === ticket.equipmentId)?.label ?? `#${ticket.equipmentId}`)
      : "—";

  const actText = (e: ActivityEntry): string => {
    switch (e.kind) {
      case "created":
        return t("tickets.detail.act.created");
      case "status":
        return t("tickets.detail.act.status", { status: t(`tickets.status.${e.status}`) });
      case "assignee":
        return e.assignee
          ? t("tickets.detail.act.assigned", { name: e.assignee })
          : t("tickets.detail.act.unassigned");
      case "comment":
        return e.comment ?? "";
    }
  };

  const handleSend = () => {
    if (!ticket || !comment.trim()) return;
    onAddComment(ticket.id, comment.trim());
    setComment("");
  };

  return (
    <Drawer
      title={ticket ? `№ ${ticket.id}` : ""}
      width={520}
      open={ticket != null}
      onClose={onClose}
      destroyOnClose
    >
      {ticket && (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div>
            <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>
              {ticket.title}
            </Typography.Title>
            <Space size={8} wrap>
              <Tag color={STATUS_COLOR[ticket.status]}>{t(`tickets.status.${ticket.status}`)}</Tag>
              <Tag color={PRIORITY_COLOR[ticket.priority]}>{t(`tickets.priority.${ticket.priority}`)}</Tag>
              <Tag>{t(`tickets.type.${ticket.type}`)}</Tag>
            </Space>
          </div>

          <Space size={12} wrap style={{ width: "100%" }}>
            <div style={{ minWidth: 220 }}>
              <Typography.Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
                {t("tickets.detail.changeStatus")}
              </Typography.Text>
              <Select<TicketStatus>
                value={ticket.status}
                disabled={!canEdit}
                style={{ width: 220 }}
                onChange={(v) => onStatusChange(ticket.id, v)}
                options={[
                  { value: "open", label: t("tickets.status.open") },
                  { value: "in_progress", label: t("tickets.status.in_progress") },
                  { value: "closed", label: t("tickets.status.closed") },
                ]}
              />
            </div>
            <div style={{ minWidth: 220 }}>
              <Typography.Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
                {t("tickets.detail.assignee")}
              </Typography.Text>
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                value={ticket.assignedToId ?? undefined}
                disabled={!canEdit}
                placeholder={t("tickets.detail.assigneePlaceholder")}
                style={{ width: 220 }}
                onChange={(v) => onAssigneeChange(ticket.id, v ?? null)}
                options={MOCK_USERS}
              />
            </div>
          </Space>

          {!canEdit && <Alert type="info" showIcon message={t("tickets.detail.readonlyHint")} />}

          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label={t("tickets.col.group")}>
              {ticket.group ? t(`tickets.ticketGroup.${ticket.group}`) : "—"}
            </Descriptions.Item>
            <Descriptions.Item label={t("tickets.col.requester")}>
              <Typography.Link onClick={() => onOpenUser(ticket.createdById)}>
                {ticket.requesterName}
              </Typography.Link>
            </Descriptions.Item>
            <Descriptions.Item label={t("tickets.form.equipment")}>
              {ticket.equipmentId != null ? (
                <Typography.Link onClick={() => onOpenAsset(ticket.equipmentId as number)}>
                  {equipmentLabel}
                </Typography.Link>
              ) : (
                "—"
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t("tickets.col.createdAt")}>
              {formatDateTime(ticket.createdAt, lang)}
            </Descriptions.Item>
            <Descriptions.Item label={t("tickets.col.updatedAt")}>
              {formatDateTime(ticket.updatedAt, lang)}
            </Descriptions.Item>
          </Descriptions>

          <div>
            <Typography.Text type="secondary">{t("tickets.detail.description")}</Typography.Text>
            <Typography.Paragraph style={{ marginTop: 4 }}>{ticket.description}</Typography.Paragraph>
          </div>

          <Divider style={{ margin: "4px 0" }}>{t("tickets.detail.activity")}</Divider>

          <Space.Compact style={{ width: "100%" }}>
            <Input
              value={comment}
              placeholder={t("tickets.detail.commentPlaceholder")}
              onChange={(e) => setComment(e.target.value)}
              onPressEnter={handleSend}
            />
            <Button type="primary" onClick={handleSend} disabled={!comment.trim()}>
              {t("tickets.detail.addComment")}
            </Button>
          </Space.Compact>

          <Timeline
            items={[...activity].reverse().map((e) => ({
              color: ACT_COLOR[e.kind],
              children: (
                <>
                  <div>{actText(e)}</div>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {e.author} · {formatDateTime(e.at, lang)}
                  </Typography.Text>
                </>
              ),
            }))}
          />
        </Space>
      )}
    </Drawer>
  );
}
