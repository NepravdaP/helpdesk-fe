import { useMemo, useState } from "react";
import { Button, Input, Select, Space, Table, Tag, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from "react-i18next";
import type { Ticket, TicketPriority, TicketStatus } from "@/types";

// Мок-данные. Позже заменим на запрос к API (GET /api/tickets).
const MOCK_TICKETS: (Ticket & { assigneeName: string | null })[] = [
  { id: 142, title: "Не печатает принтер в 304", priority: "high", status: "open", createdById: 5, assignedToId: null, equipmentId: 21, createdAt: "2025-06-01T09:12:00Z", assigneeName: null },
  { id: 141, title: "Замена монитора, АРМ-58", priority: "medium", status: "in_progress", createdById: 7, assignedToId: 1, equipmentId: 58, createdAt: "2025-05-31T14:03:00Z", assigneeName: "А. Иванов" },
  { id: 140, title: "Проектор в переговорной мигает", priority: "medium", status: "open", createdById: 3, assignedToId: null, equipmentId: 12, createdAt: "2025-05-31T11:40:00Z", assigneeName: null },
  { id: 138, title: "Установить ПО для бухгалтерии", priority: "low", status: "closed", createdById: 9, assignedToId: 4, equipmentId: null, createdAt: "2025-05-29T08:20:00Z", assigneeName: "П. Сидоров" },
  { id: 137, title: "Не работает сетевой диск", priority: "high", status: "closed", createdById: 2, assignedToId: 1, equipmentId: null, createdAt: "2025-05-28T16:55:00Z", assigneeName: "А. Иванов" },
];

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

export function TicketsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TicketStatus | "all">("all");
  const [priority, setPriority] = useState<TicketPriority | "all">("all");

  const data = useMemo(
    () =>
      MOCK_TICKETS.filter((x) => {
        const okSearch = x.title.toLowerCase().includes(search.toLowerCase());
        const okStatus = status === "all" || x.status === status;
        const okPriority = priority === "all" || x.priority === priority;
        return okSearch && okStatus && okPriority;
      }),
    [search, status, priority],
  );

  const columns: ColumnsType<(typeof MOCK_TICKETS)[number]> = [
    { title: t("tickets.col.id"), dataIndex: "id", width: 64 },
    { title: t("tickets.col.title"), dataIndex: "title", ellipsis: true },
    {
      title: t("tickets.col.priority"),
      dataIndex: "priority",
      width: 120,
      render: (p: TicketPriority) => (
        <Tag color={PRIORITY_COLOR[p]}>{t(`tickets.priority.${p}`)}</Tag>
      ),
    },
    {
      title: t("tickets.col.status"),
      dataIndex: "status",
      width: 120,
      render: (s: TicketStatus) => (
        <Tag color={STATUS_COLOR[s]}>{t(`tickets.status.${s}`)}</Tag>
      ),
    },
    {
      title: t("tickets.col.assignee"),
      dataIndex: "assigneeName",
      width: 150,
      render: (name: string | null) =>
        name ?? <Typography.Text type="secondary">{t("tickets.unassigned")}</Typography.Text>,
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t("tickets.title")}
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />}>
          {t("tickets.new")}
        </Button>
      </div>

      <Space size={8} wrap>
        <Input.Search
          allowClear
          placeholder={t("tickets.searchPlaceholder")}
          style={{ width: 260 }}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={status}
          style={{ width: 160 }}
          onChange={setStatus}
          options={[
            { value: "all", label: `${t("tickets.filter.status")}: ${t("common.all")}` },
            { value: "open", label: t("tickets.status.open") },
            { value: "in_progress", label: t("tickets.status.in_progress") },
            { value: "closed", label: t("tickets.status.closed") },
          ]}
        />
        <Select
          value={priority}
          style={{ width: 160 }}
          onChange={setPriority}
          options={[
            { value: "all", label: `${t("tickets.filter.priority")}: ${t("common.all")}` },
            { value: "high", label: t("tickets.priority.high") },
            { value: "medium", label: t("tickets.priority.medium") },
            { value: "low", label: t("tickets.priority.low") },
          ]}
        />
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        size="middle"
      />
    </Space>
  );
}
