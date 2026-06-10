import { useMemo, useState } from "react";
import { Input, Select, Space, Table, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from "react-i18next";
import { useUsers } from "@/store/UsersContext";
import { useCopyEmail } from "@/hooks/useCopyEmail";
import { useEntityCards } from "@/store/EntityCards";
import type { Role, User } from "@/types";

const ROLE_FILTER: Role[] = ["employee", "it", "admin", "superadmin"];

export function UsersPage() {
  const { t } = useTranslation();
  const { users } = useUsers();
  const { openUser } = useEntityCards();
  const copyEmail = useCopyEmail();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<Role | "all">("all");

  const data = useMemo(
    () =>
      users.filter((u) => {
        const q = search.toLowerCase();
        const okSearch =
          u.fullName.toLowerCase().includes(q) ||
          u.userName.toLowerCase().includes(q) ||
          (u.orgDepartment ?? "").toLowerCase().includes(q);
        const okRole = role === "all" || u.role === role;
        return okSearch && okRole;
      }),
    [search, role, users],
  );

  const muted = (v?: string) => (v ? v : <Typography.Text type="secondary">—</Typography.Text>);
  const clip = (s: string, n = 20) => (s.length > n ? `${s.slice(0, n)}…` : s);

  const columns: ColumnsType<User> = [
    { title: t("users.col.fullName"), dataIndex: "fullName", ellipsis: true, width: 220 },
    { title: t("users.col.innerPhone"), dataIndex: "innerPhone", width: 160, render: (v?: string) => muted(v) },
    { title: t("users.col.room"), dataIndex: "room", width: 110, render: (v?: string) => muted(v) },
    {
      title: t("users.col.department"),
      key: "department",
      width: 280,
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
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        {t("nav.users")}
      </Typography.Title>

      <Space size={8} wrap>
        <Input.Search
          allowClear
          value={search}
          placeholder={t("users.searchPlaceholder")}
          style={{ width: 280 }}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={role}
          style={{ width: 200 }}
          onChange={setRole}
          options={[
            { value: "all", label: `${t("users.filter.role")}: ${t("common.all")}` },
            ...ROLE_FILTER.map((r) => ({ value: r, label: t(`roles.${r}`) })),
          ]}
        />
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        onRow={(record) => ({
          onClick: () => openUser(record.id),
          style: { cursor: "pointer" },
        })}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        scroll={{ x: "max-content" }}
        size="middle"
      />
    </Space>
  );
}
