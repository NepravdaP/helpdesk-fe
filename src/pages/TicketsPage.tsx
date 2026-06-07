import { useMemo, useState } from "react";
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
import { MOCK_USERS } from "@/data/mock";
import { TicketFormDrawer, type NewTicket } from "@/components/TicketFormDrawer";
import { TicketDetailDrawer } from "@/components/TicketDetailDrawer";
import { UserCardDrawer } from "@/components/UserCardDrawer";
import { AssetCardDrawer } from "@/components/AssetCardDrawer";
import type {
  ActivityEntry,
  TicketGroup,
  TicketPriority,
  TicketRow,
  TicketStatus,
  TicketType,
} from "@/types";

// Мок-данные. Позже заменим на GET /api/tickets.
const INITIAL_TICKETS: TicketRow[] = [
  { id: 142, title: "Не печатает принтер в 304", description: "Принтер не реагирует на печать, мигает индикатор.", type: "repair", priority: "high", status: "open", group: "print", createdById: 5, assignedToId: null, equipmentId: 21, createdAt: "2025-06-01T09:12:00Z", updatedAt: "2025-06-01T09:12:00Z", requesterName: "Е. Петрова", assigneeName: null },
  { id: 141, title: "Замена монитора, АРМ-58", description: "Монитор периодически гаснет, требуется замена.", type: "replacement", priority: "medium", status: "in_progress", group: "helpdesk", createdById: 7, assignedToId: 1, equipmentId: 58, createdAt: "2025-05-31T14:03:00Z", updatedAt: "2025-06-02T10:20:00Z", requesterName: "К. Смирнов", assigneeName: "А. Иванов" },
  { id: 140, title: "Проектор в переговорной мигает", description: "Изображение мерцает при подключении по HDMI.", type: "repair", priority: "medium", status: "open", group: "print", createdById: 3, assignedToId: null, equipmentId: 12, createdAt: "2025-05-31T11:40:00Z", updatedAt: "2025-05-31T11:40:00Z", requesterName: "О. Кузнецова", assigneeName: null },
  { id: 139, title: "Доступ к сетевой папке отдела", description: "Нужен доступ на чтение/запись к общей папке отдела.", type: "access", priority: "low", status: "in_progress", group: "network", createdById: 6, assignedToId: 4, equipmentId: null, createdAt: "2025-05-30T13:05:00Z", updatedAt: "2025-06-01T08:00:00Z", requesterName: "Д. Волков", assigneeName: "П. Сидоров" },
  { id: 138, title: "Установить ПО для бухгалтерии", description: "Установить и настроить бухгалтерское ПО на 2 АРМ.", type: "software", priority: "low", status: "closed", group: "software", createdById: 9, assignedToId: 4, equipmentId: null, createdAt: "2025-05-29T08:20:00Z", updatedAt: "2025-05-30T16:45:00Z", requesterName: "Н. Морозова", assigneeName: "П. Сидоров" },
  { id: 137, title: "Не работает сетевой диск", description: "Сетевой диск не монтируется после перезагрузки.", type: "repair", priority: "high", status: "closed", group: "network", createdById: 2, assignedToId: 1, equipmentId: null, createdAt: "2025-05-28T16:55:00Z", updatedAt: "2025-05-29T09:30:00Z", requesterName: "С. Орлов", assigneeName: "А. Иванов" },
];

// Стартовая история для мок-заявок: создание + (если есть) назначение/смена статуса.
function seedActivity(tickets: TicketRow[]): Record<number, ActivityEntry[]> {
  const map: Record<number, ActivityEntry[]> = {};
  for (const tk of tickets) {
    const entries: ActivityEntry[] = [
      { id: tk.id * 10 + 1, kind: "created", at: tk.createdAt, author: tk.requesterName },
    ];
    if (tk.assigneeName) {
      entries.push({ id: tk.id * 10 + 2, kind: "assignee", at: tk.updatedAt, author: tk.assigneeName, assignee: tk.assigneeName });
    }
    if (tk.status !== "open") {
      entries.push({ id: tk.id * 10 + 3, kind: "status", at: tk.updatedAt, author: tk.assigneeName ?? tk.requesterName, status: tk.status });
    }
    map[tk.id] = entries;
  }
  return map;
}

let activitySeq = 1;

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
  const { user } = useAuth();
  const [rows, setRows] = useState<TicketRow[]>(INITIAL_TICKETS);
  const [activity, setActivity] = useState<Record<number, ActivityEntry[]>>(() =>
    seedActivity(INITIAL_TICKETS),
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
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
      rows.filter((x) => {
        const okSearch = x.title.toLowerCase().includes(search.toLowerCase());
        const okStatus = status === "all" || x.status === status;
        const okPriority = priority === "all" || x.priority === priority;
        const okType = type === "all" || x.type === type;
        return okSearch && okStatus && okPriority && okType;
      }),
    [rows, search, status, priority, type],
  );

  const selected = rows.find((r) => r.id === selectedId) ?? null;

  const pushActivity = (id: number, entry: Omit<ActivityEntry, "id" | "at" | "author">) => {
    const full: ActivityEntry = {
      id: Date.now() * 100 + activitySeq++,
      at: new Date().toISOString(),
      author: user.fullName,
      ...entry,
    };
    setActivity((prev) => ({ ...prev, [id]: [...(prev[id] ?? []), full] }));
  };

  const touch = (id: number) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, updatedAt: new Date().toISOString() } : r)));

  const handleStatusChange = (id: number, next: TicketStatus) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: next, updatedAt: new Date().toISOString() } : r)),
    );
    pushActivity(id, { kind: "status", status: next });
  };

  const handleAssigneeChange = (id: number, userId: number | null) => {
    const u = MOCK_USERS.find((x) => x.value === userId) ?? null;
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, assignedToId: userId, assigneeName: u?.label ?? null, updatedAt: new Date().toISOString() }
          : r,
      ),
    );
    pushActivity(id, { kind: "assignee", assignee: u?.label ?? null });
  };

  const handleAddComment = (id: number, text: string) => {
    pushActivity(id, { kind: "comment", comment: text });
    touch(id);
  };

  // Навигация между карточками. Открытие заявки выводит её на передний план,
  // закрывая карточки пользователя/актива над ней; карточки пользователя и актива
  // открываются поверх текущей.
  const openTicket = (id: number) => {
    setSelectedUserId(null);
    setSelectedAssetId(null);
    setSelectedId(id);
  };
  const openUser = (id: number) => setSelectedUserId(id);
  const openAsset = (id: number) => setSelectedAssetId(id);

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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
          {t("tickets.new")}
        </Button>
      </div>

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
        <Popover content={columnSettings} trigger="click" placement="bottomRight">
          <Button icon={<SettingOutlined />}>{t("tickets.columns")}</Button>
        </Popover>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        onRow={(record) => ({
          onClick: () => setSelectedId(record.id),
          style: { cursor: "pointer" },
        })}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        scroll={{ x: "max-content" }}
        size="middle"
      />

      <TicketFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreate={(ticket: NewTicket) => setRows((prev) => [ticket, ...prev])}
      />

      <TicketDetailDrawer
        ticket={selected}
        activity={selected ? (activity[selected.id] ?? []) : []}
        onClose={() => setSelectedId(null)}
        onStatusChange={handleStatusChange}
        onAssigneeChange={handleAssigneeChange}
        onAddComment={handleAddComment}
        onOpenUser={openUser}
        onOpenAsset={openAsset}
      />

      <UserCardDrawer
        userId={selectedUserId}
        tickets={rows}
        onClose={() => setSelectedUserId(null)}
        onOpenTicket={openTicket}
        onOpenAsset={openAsset}
      />

      <AssetCardDrawer
        assetId={selectedAssetId}
        tickets={rows}
        onClose={() => setSelectedAssetId(null)}
        onOpenTicket={openTicket}
        onOpenUser={openUser}
      />
    </Space>
  );
}
