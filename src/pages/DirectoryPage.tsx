import { useMemo, useState } from "react";
import { Avatar, Input, Space, Table, Tabs, Tooltip, Tree, Typography } from "antd";
import { UserOutlined, ApartmentOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { DataNode } from "antd/es/tree";
import { useTranslation } from "react-i18next";
import { useUsers } from "@/store/UsersContext";
import { useConfig } from "@/store/ConfigContext";
import { palette } from "@/theme/colors";
import { useCopyEmail } from "@/hooks/useCopyEmail";
import { UserCardDrawer } from "@/components/UserCardDrawer";
import type { User } from "@/types";

const initials = (u: User) =>
  `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase();

const clip = (s: string, n = 20) => (s.length > n ? `${s.slice(0, n)}…` : s);

// ---- Вкладка «По алфавиту» (таблица в общем формате) ----
function AlphabetTab({ onOpen }: { onOpen: (id: number) => void }) {
  const { t } = useTranslation();
  const { users } = useUsers();
  const copyEmail = useCopyEmail();
  const [search, setSearch] = useState("");

  const data = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) || (u.orgDepartment ?? "").toLowerCase().includes(q),
    ).sort((a, b) => a.fullName.localeCompare(b.fullName, "ru"));
  }, [search, users]);

  const muted = (v?: string) => (v ? v : <Typography.Text type="secondary">—</Typography.Text>);

  const columns: ColumnsType<User> = [
    { title: t("users.col.fullName"), dataIndex: "fullName", ellipsis: true, width: 220 },
    { title: t("userCard.orgTitle"), dataIndex: "orgTitle", ellipsis: true, width: 200, render: (v?: string) => muted(v) },
    {
      title: t("users.col.department"),
      key: "department",
      width: 260,
      render: (_, u) => {
        const div = u.orgDivision ?? "";
        const dep = u.orgDepartment ?? "";
        const full = [div, dep].filter(Boolean).join(" / ");
        if (!full) return <Typography.Text type="secondary">—</Typography.Text>;
        return (
          <Tooltip title={full}>
            {clip(div)}
            {div && dep ? " / " : ""}
            {clip(dep)}
          </Tooltip>
        );
      },
    },
    { title: t("users.col.room"), dataIndex: "room", width: 110, render: (v?: string) => muted(v) },
    { title: t("users.col.innerPhone"), dataIndex: "innerPhone", width: 160, render: (v?: string) => muted(v) },
    {
      title: t("users.col.email"),
      dataIndex: "email",
      width: 240,
      render: (v: string) => (
        <Typography.Link
          onClick={(e) => {
            e.stopPropagation();
            copyEmail(v);
          }}
        >
          {v}
        </Typography.Link>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <Input.Search
        allowClear
        value={search}
        placeholder={t("directory.searchPlaceholder")}
        style={{ maxWidth: 360 }}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        onRow={(record) => ({ onClick: () => onOpen(record.id), style: { cursor: "pointer" } })}
        pagination={{ pageSize: 12, hideOnSinglePage: true }}
        scroll={{ x: "max-content" }}
        size="middle"
      />
    </Space>
  );
}

// ---- Вкладка «По организации» (дерево с сортировкой по весу должности) ----
function EmployeeLeaf({ u }: { u: User }) {
  return (
    <Space size={8} align="center">
      <Avatar size={22} src={u.avatarUrl ?? undefined} icon={<UserOutlined />} style={{ backgroundColor: palette.primary, fontSize: 11 }}>
        {initials(u)}
      </Avatar>
      <span>{u.fullName}</span>
      {u.orgTitle && (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          · {u.orgTitle}
        </Typography.Text>
      )}
    </Space>
  );
}

function OrgTab({ onOpen }: { onOpen: (id: number) => void }) {
  const { t } = useTranslation();
  const { users } = useUsers();
  const { positionWeight } = useConfig();

  const treeData = useMemo<DataNode[]>(() => {
    const noDiv = t("directory.noDivision");
    const noDep = t("directory.noDepartment");
    const divisions = new Map<string, Map<string, User[]>>();
    for (const u of users) {
      const div = u.orgDivision || noDiv;
      const dep = u.orgDepartment || noDep;
      if (!divisions.has(div)) divisions.set(div, new Map());
      const deps = divisions.get(div)!;
      if (!deps.has(dep)) deps.set(dep, []);
      deps.get(dep)!.push(u);
    }

    return [...divisions.entries()].map(([div, deps]) => {
      const total = [...deps.values()].reduce((n, arr) => n + arr.length, 0);
      return {
        title: (
          <Space size={8}>
            <ApartmentOutlined style={{ color: palette.primary }} />
            <Typography.Text strong>{div}</Typography.Text>
            <Typography.Text type="secondary">({total})</Typography.Text>
          </Space>
        ),
        key: `div-${div}`,
        selectable: false,
        children: [...deps.entries()].map(([dep, users]) => ({
          title: (
            <span>
              {dep} <Typography.Text type="secondary">({users.length})</Typography.Text>
            </span>
          ),
          key: `dep-${div}-${dep}`,
          selectable: false,
          // Сортировка по весу должности (старшие выше), затем по ФИО.
          children: [...users]
            .sort(
              (a, b) =>
                positionWeight(b.orgTitle) - positionWeight(a.orgTitle) ||
                a.fullName.localeCompare(b.fullName, "ru"),
            )
            .map((u) => ({ title: <EmployeeLeaf u={u} />, key: `u-${u.id}`, isLeaf: true })),
        })),
      };
    });
  }, [t, users, positionWeight]);

  return (
    <Tree.DirectoryTree
      treeData={treeData}
      defaultExpandAll
      blockNode
      showIcon={false}
      expandAction="click"
      selectedKeys={[]}
      onSelect={(keys) => {
        const key = String(keys[0] ?? "");
        if (key.startsWith("u-")) onOpen(Number(key.slice(2)));
      }}
      style={{ background: "transparent" }}
    />
  );
}

export function DirectoryPage() {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        {t("nav.directory")}
      </Typography.Title>

      <Tabs
        items={[
          { key: "alphabet", label: t("directory.tabAlphabet"), children: <AlphabetTab onOpen={setSelectedId} /> },
          { key: "org", label: t("directory.tabOrg"), children: <OrgTab onOpen={setSelectedId} /> },
        ]}
      />

      <UserCardDrawer userId={selectedId} showRelated={false} onClose={() => setSelectedId(null)} />
    </Space>
  );
}
