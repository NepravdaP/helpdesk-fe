import { useMemo } from "react";
import {
  Button,
  Checkbox,
  Input,
  Popover,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { PlusOutlined, SettingOutlined } from "@ant-design/icons";
import type { ColumnsType, ColumnType } from "antd/es/table";
import { useTranslation } from "react-i18next";
import { usePersistentState } from "@/hooks/usePersistentState";
import { formatDateTime } from "@/utils/format";
import type {
  Ticket,
  TicketGroup,
  TicketPriority,
  TicketStatus,
  TicketType,
} from "@/types";

// Строка таблицы = заявка + «развёрнутые» имена (на бэке придут из JOIN).
type TicketRow = Ticket & { requesterName: string; assigneeName: string | null };

// Мок-данные. Позже заменим на GET /api/tickets.
const MOCK_TICKETS: TicketRow[] = [
  { id: 142, title: "Не печатает принтер в 304", type: "repair", priority: "high", status: "open", group: "print", createdById: 5, assignedToId: null, equipmentId: 21, createdAt: "2025-06-01T09:12:00Z", updatedAt: "2025-06-01T09:12:00Z", requesterName: "Е. Петрова", assigneeName: null },
  { id: 141, title: "Замена монитора, АРМ-58", type: "replacement", priority: "medium", status: "in_progress", group: "helpdesk", createdById: 7, assignedToId: 1, equipmentId: 58, createdAt: "2025-05-31T14:03:00Z", updatedAt: "2025-06-02T10:20:00Z", requesterName: "К. Смирнов", assigneeName: "А. Иванов" },
  { id: 140, title: "Проектор в переговорной мигает", type: "repair", priority: "medium", status: "open", group: "print", createdById: 3, assignedToId: null, equipmentId: 12, createdAt: "2025-05-31T11:40:00Z", updatedAt: "2025-05-31T11:40:00Z", requesterName: "О. Кузнецова", assigneeName: null },
  { id: 139, title: "Доступ к сетевой папке отдела", type: "access", priority: "low", status: "in_progress", group: "network", createdById: 6, assignedToId: 4, equipmentId: null, createdAt: "2025-05-30T13:05:00Z", updatedAt: "2025-06-01T08:00:00Z", requesterName: "Д. Волков", assigneeName: "П. Сидоров" },
  { id: 138, title: "Установить ПО для бухгалтерии", type: "software", priority: "low", status: "closed", group: "software", createdById: 9, assignedToId: 4, equipmentId: null, createdAt: "2025-05-29T08:20:00Z", updatedAt: "2025-05-30T16:45:00Z", requesterName: "Н. Морозова", assigneeName: "П. Сидоров" },
  { id: 137, title: "Не работает сетевой диск", type: "repair", priority: "high", status: "closed", group: "network", createdById: 2, assignedToId: 1, equipmentId: null, createdAt: "2025-05-28T16:55:00Z", updatedAt: "2025-05-29T09:30:00Z", requesterName: "С. Орлов", assigneeName: "А. Иванов" },
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

// Все доступные столбцы в каноническом порядке.
const ALL_COLUMNS = [
  "id",
  "title",
  "type",
  "priority",
  "status",
  "group",
  "requester",
  "assignee",
  "createdAt",
  "updatedAt",
] as const;
type ColKey = (typeof ALL_COLUMNS)[number];

// Что показываем по умолчанию (остальное включается в конфигураторе).
const DEFAULT_VISIBLE: ColKey[] = [
  "id",
  "title",
  "type",
  "priority",
  "status",
  "requester",
  "assignee",
  "createdAt",
];

export function TicketsPage() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = usePersistentState("", "");
  const [status, setStatus] = usePersistentState<TicketStatus | "all">("all", "all");
  const [priority, setPriority] = usePersistentState<TicketPriority | "all">("all", "all");
  const [type, setType] = usePersistentState<TicketType | "all">("all", "all");
  const [visible, setVisible] = usePersistentState<ColKey[]>(
    "tickets.visibleColumns",
    DEFAULT_VISIBLE,
  );

  const data = useMemo(
    () =>
      MOCK_TICKETS.filter((x) => {
        const okSearch = x.title.toLowerCase().includes(search.toLowerCase());
        const okStatus = status === "all" || x.status === status;
        const okPriority = priority === "all" || x.priority === priority;
        const okType = type === "all" || x.type === type;
        return okSearch && okStatus && okPriority && okType;
      }),
    [search, status, priority, type],
  );

  // Определения всех столбцов; ниже отфильтруем по visible.
  const columnMap = useMemo<Record<ColKey, ColumnType<TicketRow>>>(() => {
    const muted = (text: string) => <Typography.Text type="secondary">{text}</Typography.Text>;
    return {
      id: { key: "id", title: t("tickets.col.id"), dataIndex: "id", width: 64 },
      title: { key: "title", title: t("tickets.col.title"), dataIndex: "title", ellipsis: true, width: 240 },
      type: {
        key: "type",
        title: t("tickets.col.type"),
        dataIndex: "type",
        width: 130,
        render: (v: TicketType) => t(`tickets.type.${v}`),
      },
      priority: {
        key: "priority",
        title: t("tickets.col.priority"),
        dataIndex: "priority",
        width: 120,
        render: (v: TicketPriority) => <Tag color={PRIORITY_COLOR[v]}>{t(`tickets.priority.${v}`)}</Tag>,
      },
      status: {
        key: "status",
        title: t("tickets.col.status"),
        dataIndex: "status",
        width: 120,
        render: (v: TicketStatus) => <Tag color={STATUS_COLOR[v]}>{t(`tickets.status.${v}`)}</Tag>,
      },
      group: {
        key: "group",
        title: t("tickets.col.group"),
        dataIndex: "group",
        width: 200,
        render: (v: TicketGroup | null) => (v ? t(`tickets.ticketGroup.${v}`) : muted(t("tickets.unassigned"))),
      },
      requester: {
        key: "requester",
        title: t("tickets.col.requester"),
        dataIndex: "requesterName",
        width: 150,
        ellipsis: true,
      },
      assignee: {
        key: "assignee",
        title: t("tickets.col.assignee"),
        dataIndex: "assigneeName",
        width: 150,
        ellipsis: true,
        render: (v: string | null) => v ?? muted(t("tickets.unassigned")),
      },
      createdAt: {
        key: "createdAt",
        title: t("tickets.col.createdAt"),
        dataIndex: "createdAt",
        width: 160,
        render: (v: string) => muted(formatDateTime(v, i18n.language)),
      },
      updatedAt: {
        key: "updatedAt",
        title: t("tickets.col.updatedAt"),
        dataIndex: "updatedAt",
        width: 160,
        render: (v: string) => muted(formatDateTime(v, i18n.language)),
      },
    };
  }, [t, i18n.language]);

  const columns: ColumnsType<TicketRow> = ALL_COLUMNS.filter((k) => visible.includes(k)).map(
    (k) => columnMap[k],
  );

  // Содержимое поповера-конфигуратора столбцов.
  const columnSettings = (
    <Checkbox.Group
      value={visible}
      onChange={(vals) => setVisible(vals as ColKey[])}
      style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 180 }}
      options={ALL_COLUMNS.map((k) => ({ label: t(`tickets.col.${k}`), value: k }))}
    />
  );

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

      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <Space size={8} wrap>
          <Input.Search
            allowClear
            value={search}
            placeholder={t("tickets.searchPlaceholder")}
            style={{ width: 240 }}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={status}
            style={{ width: 150 }}
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
            style={{ width: 150 }}
            onChange={setPriority}
            options={[
              { value: "all", label: `${t("tickets.filter.priority")}: ${t("common.all")}` },
              { value: "high", label: t("tickets.priority.high") },
              { value: "medium", label: t("tickets.priority.medium") },
              { value: "low", label: t("tickets.priority.low") },
            ]}
          />
          <Select
            value={type}
            style={{ width: 160 }}
            onChange={setType}
            options={[
              { value: "all", label: `${t("tickets.filter.type")}: ${t("common.all")}` },
              { value: "repair", label: t("tickets.type.repair") },
              { value: "replacement", label: t("tickets.type.replacement") },
              { value: "software", label: t("tickets.type.software") },
              { value: "access", label: t("tickets.type.access") },
              { value: "other", label: t("tickets.type.other") },
            ]}
          />
        </Space>

        <Popover content={columnSettings} trigger="click" placement="bottomRight">
          <Button icon={<SettingOutlined />}>{t("tickets.columns")}</Button>
        </Popover>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        scroll={{ x: "max-content" }}
        size="middle"
      />
    </Space>
  );
}
