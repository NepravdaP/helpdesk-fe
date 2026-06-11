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
import { formatDate } from "@/utils/format";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useAuth } from "@/auth/AuthContext";
import { can } from "@/auth/permissions";
import { useAssets } from "@/store/AssetsContext";
import { useUsers } from "@/store/UsersContext";
import { useConfig } from "@/store/ConfigContext";
import { useEntityCards } from "@/store/EntityCards";
import type { Equipment, EquipmentStatus, EquipmentType } from "@/types";

const STATUS_COLOR: Record<EquipmentStatus, string> = {
  in_use: "green",
  repair: "gold",
  decommissioned: "default",
};

const BASE_COLUMNS = ["inventoryNo", "model", "type", "status", "location", "owner", "warranty"] as const;
const DEFAULT_VISIBLE: string[] = [...BASE_COLUMNS];

export function AssetsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { assets } = useAssets();
  const { users } = useUsers();
  const { allAssetAttributes, assetTypes, assetTypeName } = useConfig();
  const { openAsset, openUser, openAssetForm } = useEntityCards();

  const canCreate = can(user.role, "assets.create");

  const attributeDefs = allAssetAttributes();
  const allColumns: string[] = [...BASE_COLUMNS, ...attributeDefs.map((a) => a.key)];
  const attrLabel = (key: string) => attributeDefs.find((a) => a.key === key)?.label ?? key;
  const userName = (id: number | null) =>
    id != null ? (users.find((u) => u.id === id)?.fullName ?? `#${id}`) : null;

  const [search, setSearch] = useState("");
  const [type, setType] = useState<EquipmentType | "all">("all");
  const [status, setStatus] = useState<EquipmentStatus | "all">("all");
  const [visible, setVisible] = usePersistentState<string[]>("assets.visibleColumns", DEFAULT_VISIBLE);

  const data = useMemo(
    () =>
      assets.filter((e) => {
        const q = search.toLowerCase();
        const okSearch = e.model.toLowerCase().includes(q) || e.inventoryNo.toLowerCase().includes(q);
        const okType = type === "all" || e.type === type;
        const okStatus = status === "all" || e.status === status;
        return okSearch && okType && okStatus;
      }),
    [assets, search, type, status],
  );

  const labelOf = (key: string): string => {
    const baseLabels: Record<string, string> = {
      inventoryNo: t("assetCard.inventoryNo"),
      model: t("assets.col.model"),
      type: t("assetCard.type"),
      status: t("assetCard.status"),
      location: t("assetCard.location"),
      owner: t("assetCard.owner"),
      warranty: t("assetCard.warranty"),
    };
    return baseLabels[key] ?? attrLabel(key);
  };

  const muted = (text: string) => <Typography.Text type="secondary">{text}</Typography.Text>;

  const columnMap = useMemo<Record<string, ColumnType<Equipment>>>(() => {
    const map: Record<string, ColumnType<Equipment>> = {
      inventoryNo: { key: "inventoryNo", title: labelOf("inventoryNo"), dataIndex: "inventoryNo", width: 140 },
      model: { key: "model", title: labelOf("model"), dataIndex: "model", ellipsis: true, width: 240 },
      type: { key: "type", title: labelOf("type"), dataIndex: "type", width: 130, render: (v: EquipmentType) => assetTypeName(v) },
      status: {
        key: "status",
        title: labelOf("status"),
        dataIndex: "status",
        width: 150,
        render: (v: EquipmentStatus) => <Tag color={STATUS_COLOR[v]}>{t(`equipmentStatus.${v}`)}</Tag>,
      },
      location: { key: "location", title: labelOf("location"), dataIndex: "location", width: 140 },
      owner: {
        key: "owner",
        title: labelOf("owner"),
        dataIndex: "assignedToId",
        width: 160,
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
            muted("—")
          );
        },
      },
      warranty: {
        key: "warranty",
        title: labelOf("warranty"),
        dataIndex: "warrantyUntil",
        width: 130,
        render: (v: string | null) => (v ? formatDate(v, i18n.language) : muted("—")),
      },
    };
    for (const attr of attributeDefs) {
      map[attr.key] = {
        key: attr.key,
        title: attr.label,
        width: 160,
        render: (_, record) => record.attributes?.[attr.key] ?? muted("—"),
      };
    }
    return map;
  }, [t, i18n.language, attributeDefs, users, assetTypeName]);

  const columns: ColumnsType<Equipment> = allColumns.filter((k) => visible.includes(k)).map((k) => columnMap[k]);

  const columnSettings = (
    <Checkbox.Group
      value={visible}
      onChange={(vals) => setVisible(vals as string[])}
      style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 180 }}
      options={allColumns.map((k) => ({ label: labelOf(k), value: k }))}
    />
  );

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t("nav.assets")}
        </Typography.Title>
        {canCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openAssetForm(null)}>
            {t("assets.add")}
          </Button>
        )}
      </div>

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
            ...assetTypes.map((tp) => ({ value: tp.key, label: tp.name })),
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
        <Popover content={columnSettings} trigger="click" placement="bottomRight">
          <Button icon={<SettingOutlined />}>{t("common.columns")}</Button>
        </Popover>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        onRow={(record) => ({ onClick: () => openAsset(record.id), style: { cursor: "pointer" } })}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        scroll={{ x: "max-content" }}
        size="middle"
      />
    </Space>
  );
}
