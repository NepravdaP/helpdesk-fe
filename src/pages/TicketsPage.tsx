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
import { useAuth } from "@/auth/AuthContext";
import { can } from "@/auth/permissions";
import { useTickets } from "@/store/TicketsContext";
import { useConfig } from "@/store/ConfigContext";
import { useEntityCards } from "@/store/EntityCards";
import type {
  TicketPriority,
  TicketRow,
  TicketStatus,
  TicketType,
} from "@/types";

const STATUS_COLOR: Record<TicketStatus, string> = {
  request: "default",
  open: "blue",
  clarification: "gold",
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
  const { user } = useAuth();
  const { tickets } = useTickets();
  const { services, ticketTypeByKey } = useConfig();
  const { openTicket, openTicketForm } = useEntityCards();

  const viewAll = can(user.role, "tickets.viewAll");
  const showFilters = can(user.role, "tickets.filter");

  const [search, setSearch] = usePersistentState("", "");
  const [status, setStatus] = usePersistentState<TicketStatus | "all">("all", "all");
  const [priority, setPriority] = usePersistentState<TicketPriority | "all">("all", "all");
  const [type, setType] = usePersistentState<TicketType | "all">("all", "all");
  const [visible, setVisible] = usePersistentState<ColKey[]>(
    "tickets.visibleColumns",
    DEFAULT_VISIBLE,
  );

  const data = useMemo(() => {
    const base = viewAll ? tickets : tickets.filter((x) => x.createdById === user.id);
    if (!showFilters) return base;
    return base.filter((x) => {
      const okSearch = x.title.toLowerCase().includes(search.toLowerCase());
      const okStatus = status === "all" || x.status === status;
      const okPriority = priority === "all" || x.priority === priority;
      const okType = type === "all" || x.type === type;
      return okSearch && okStatus && okPriority && okType;
    });
  }, [tickets, viewAll, showFilters, user.id, search, status, priority, type]);

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
        width: 150,
        render: (v: TicketType) => ticketTypeByKey(v)?.name ?? v,
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
  }, [t, i18n.language, ticketTypeByKey]);

  const columns: ColumnsType<TicketRow> = ALL_COLUMNS.filter((k) => visible.includes(k)).map(
    (k) => columnMap[k],
  );

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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openTicketForm(null)}>
          {t("tickets.new")}
        </Button>
      </div>

      <Space size={8} wrap style={{ display: showFilters ? undefined : "none" }}>
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
            { value: "request", label: t("tickets.status.request") },
            { value: "open", label: t("tickets.status.open") },
            { value: "clarification", label: t("tickets.status.clarification") },
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
          style={{ width: 180 }}
          onChange={setType}
          options={[
            { value: "all", label: `${t("tickets.filter.type")}: ${t("common.all")}` },
            ...services.map((s) => ({
              label: s.name,
              options: s.ticketTypes.map((tt) => ({ value: tt.key, label: tt.name })),
            })),
          ]}
        />
        <Popover content={columnSettings} trigger="click" placement="bottomRight">
          <Button icon={<SettingOutlined />}>{t("tickets.columns")}</Button>
        </Popover>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        onRow={(record) => ({
          onClick: () => openTicket(record.id),
          style: { cursor: "pointer" },
        })}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        scroll={{ x: "max-content" }}
        size="middle"
      />
    </Space>
  );
}
