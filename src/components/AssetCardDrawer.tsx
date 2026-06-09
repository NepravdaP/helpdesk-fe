import {
  Button,
  Descriptions,
  Divider,
  Drawer,
  List,
  Popconfirm,
  Space,
  Tag,
  Typography,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { USERS } from "@/data/mock";
import { useAuth } from "@/auth/AuthContext";
import { can } from "@/auth/permissions";
import { useAssets } from "@/store/AssetsContext";
import { ASSET_TYPE_ATTRIBUTES } from "@/config/assetTypes";
import { formatDate } from "@/utils/format";
import type { TicketRow, TicketStatus } from "@/types";

const STATUS_COLOR: Record<TicketStatus, string> = {
  open: "blue",
  in_progress: "gold",
  closed: "green",
};

export function AssetCardDrawer({
  assetId,
  tickets,
  onClose,
  onOpenTicket,
  onOpenUser,
  onEdit,
  onDelete,
}: {
  assetId: number | null;
  tickets: TicketRow[];
  onClose: () => void;
  onOpenTicket: (id: number) => void;
  onOpenUser: (id: number) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { assets } = useAssets();
  const asset = assets.find((e) => e.id === assetId) ?? null;
  const canEdit = can(user.role, "assets.edit");
  const canDelete = can(user.role, "assets.delete");
  const owner = asset?.assignedToId != null ? (USERS.find((u) => u.id === asset.assignedToId) ?? null) : null;
  const assetTickets = tickets.filter((tk) => tk.equipmentId === assetId);

  return (
    <Drawer
      title={asset?.model ?? ""}
      width={520}
      open={assetId != null}
      onClose={onClose}
      destroyOnClose
      extra={
        asset && (canEdit || canDelete) ? (
          <Space size={4}>
            {canEdit && (
              <Button type="text" icon={<EditOutlined />} onClick={onEdit}>
                {t("common.edit")}
              </Button>
            )}
            {canDelete && (
              <Popconfirm
                title={t("assets.deleteConfirm")}
                okButtonProps={{ danger: true }}
                onConfirm={onDelete}
              >
                <Button danger type="text" icon={<DeleteOutlined />}>
                  {t("common.delete")}
                </Button>
              </Popconfirm>
            )}
          </Space>
        ) : undefined
      }
    >
      {asset && (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label={t("assetCard.inventoryNo")}>{asset.inventoryNo}</Descriptions.Item>
            <Descriptions.Item label={t("assetCard.type")}>{t(`equipmentType.${asset.type}`)}</Descriptions.Item>
            <Descriptions.Item label={t("assetCard.status")}>{t(`equipmentStatus.${asset.status}`)}</Descriptions.Item>
            <Descriptions.Item label={t("assetCard.location")}>{asset.location}</Descriptions.Item>
            <Descriptions.Item label={t("assetCard.warranty")}>
              {asset.warrantyUntil ? formatDate(asset.warrantyUntil, i18n.language) : "—"}
            </Descriptions.Item>
            <Descriptions.Item label={t("assetCard.owner")}>
              {owner ? (
                <Typography.Link onClick={() => onOpenUser(owner.id)}>{owner.fullName}</Typography.Link>
              ) : (
                "—"
              )}
            </Descriptions.Item>
            {ASSET_TYPE_ATTRIBUTES[asset.type].map((key) => (
              <Descriptions.Item key={key} label={t(`assetAttr.${key}`)}>
                {asset.attributes?.[key] ?? "—"}
              </Descriptions.Item>
            ))}
          </Descriptions>

          <Divider style={{ margin: "4px 0" }}>
            {t("assetCard.tickets")} ({assetTickets.length})
          </Divider>
          <List
            size="small"
            dataSource={assetTickets}
            locale={{ emptyText: t("common.empty") }}
            renderItem={(tk) => (
              <List.Item style={{ cursor: "pointer" }} onClick={() => onOpenTicket(tk.id)}>
                <List.Item.Meta
                  title={`№ ${tk.id} · ${tk.title}`}
                  description={<Tag color={STATUS_COLOR[tk.status]}>{t(`tickets.status.${tk.status}`)}</Tag>}
                />
              </List.Item>
            )}
          />
        </Space>
      )}
    </Drawer>
  );
}
