import { useMemo, useState } from "react";
import { Input, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from "react-i18next";
import { EQUIPMENT, USERS } from "@/data/mock";
import { formatDate } from "@/utils/format";
import { useEntityCards } from "@/store/EntityCards";
import type { Equipment, EquipmentStatus, EquipmentType } from "@/types";

const STATUS_COLOR: Record<EquipmentStatus, string> = {
  in_use: "green",
  repair: "gold",
  decommissioned: "default",
};

const userName = (id: number | null) =>
  id != null ? (USERS.find((u) => u.id === id)?.fullName ?? `#${id}`) : null;

export function AssetsPage() {
  const { t, i18n } = useTranslation();
  const { openAsset, openUser } = useEntityCards();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<EquipmentType | "all">("all");
  const [status, setStatus] = useState<EquipmentStatus | "all">("all");

  const data = useMemo(
    () =>
      EQUIPMENT.filter((e) => {
        const q = search.toLowerCase();
        const okSearch =
          e.model.toLowerCase().includes(q) || e.inventoryNo.toLowerCase().includes(q);
        const okType = type === "all" || e.type === type;
        const okStatus = status === "all" || e.status === status;
        return okSearch && okType && okStatus;
      }),
    [search, type, status],
  );

  const columns: ColumnsType<Equipment> = [
    { title: t("assetCard.inventoryNo"), dataIndex: "inventoryNo", width: 140 },
    { title: t("assets.col.model"), dataIndex: "model", ellipsis: true, width: 240 },
    {
      title: t("assetCard.type"),
      dataIndex: "type",
      width: 130,
      render: (v: EquipmentType) => t(`equipmentType.${v}`),
    },
    {
      title: t("assetCard.status"),
      dataIndex: "status",
      width: 150,
      render: (v: EquipmentStatus) => <Tag color={STATUS_COLOR[v]}>{t(`equipmentStatus.${v}`)}</Tag>,
    },
    { title: t("assetCard.location"), dataIndex: "location", width: 140 },
    {
      title: t("assetCard.owner"),
      dataIndex: "assignedToId",
      width: 150,
      render: (id: number | null) => {
        const name = userName(id);
        return name ? (
          <Typography.Link
            onClick={(e) => {
              e.stopPropagation();
              openUser(id as number);
            }}
          >
            {name}
          </Typography.Link>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        );
      },
    },
    {
      title: t("assetCard.warranty"),
      dataIndex: "warrantyUntil",
      width: 140,
      render: (v: string | null) =>
        v ? (
          formatDate(v, i18n.language)
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        {t("nav.assets")}
      </Typography.Title>

      <Space size={8} wrap>
        <Input.Search
          allowClear
          value={search}
          placeholder={t("assets.searchPlaceholder")}
          style={{ width: 280 }}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={type}
          style={{ width: 170 }}
          onChange={setType}
          options={[
            { value: "all", label: `${t("assets.filter.type")}: ${t("common.all")}` },
            { value: "workstation", label: t("equipmentType.workstation") },
            { value: "printer", label: t("equipmentType.printer") },
            { value: "multimedia", label: t("equipmentType.multimedia") },
          ]}
        />
        <Select
          value={status}
          style={{ width: 180 }}
          onChange={setStatus}
          options={[
            { value: "all", label: `${t("assets.filter.status")}: ${t("common.all")}` },
            { value: "in_use", label: t("equipmentStatus.in_use") },
            { value: "repair", label: t("equipmentStatus.repair") },
            { value: "decommissioned", label: t("equipmentStatus.decommissioned") },
          ]}
        />
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        onRow={(record) => ({
          onClick: () => openAsset(record.id),
          style: { cursor: "pointer" },
        })}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        scroll={{ x: "max-content" }}
        size="middle"
      />
    </Space>
  );
}
