import {
  Avatar,
  Button,
  Descriptions,
  Divider,
  Drawer,
  List,
  Space,
  Tag,
  Typography,
} from "antd";
import { UserOutlined, EditOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useUsers } from "@/store/UsersContext";
import { useAssets } from "@/store/AssetsContext";
import { useAuth } from "@/auth/AuthContext";
import { can } from "@/auth/permissions";
import { useCopyEmail } from "@/hooks/useCopyEmail";
import { palette } from "@/theme/colors";
import type { TicketRow, TicketStatus } from "@/types";

const STATUS_COLOR: Record<TicketStatus, string> = {
  request: "default",
  open: "blue",
  clarification: "gold",
  closed: "green",
};

const dash = (v?: string | null) => (v && v.length ? v : "—");

export function UserCardDrawer({
  userId,
  tickets = [],
  onClose,
  onOpenTicket,
  onOpenAsset,
  onEdit,
  showRelated = true,
}: {
  userId: number | null;
  tickets?: TicketRow[];
  onClose: () => void;
  onOpenTicket?: (id: number) => void;
  onOpenAsset?: (id: number) => void;
  onEdit?: () => void;
  showRelated?: boolean;
}) {
  const { t } = useTranslation();
  const copyEmail = useCopyEmail();
  const { user: currentUser } = useAuth();
  const { users } = useUsers();
  const { assets } = useAssets();
  const user = users.find((u) => u.id === userId) ?? null;
  const userTickets = tickets.filter((tk) => tk.createdById === userId);
  const userEquipment = assets.filter((e) => e.assignedToId === userId);
  const canEdit = can(currentUser.role, "users.edit");

  const initials =
    user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() : "";

  return (
    <Drawer
      title={user?.fullName ?? ""}
      width={540}
      open={userId != null}
      onClose={onClose}
      destroyOnClose
      extra={
        user && onEdit && canEdit ? (
          <Button type="text" icon={<EditOutlined />} onClick={onEdit}>
            {t("common.edit")}
          </Button>
        ) : undefined
      }
    >
      {user && (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Space align="center" size={16}>
            <Avatar
              size={64}
              src={user.avatarUrl ?? undefined}
              icon={<UserOutlined />}
              style={{ backgroundColor: palette.primary }}
            >
              {initials}
            </Avatar>
            <div>
              <Typography.Title level={5} style={{ margin: 0 }}>
                {user.lastName} {user.firstName} {user.middleName ?? ""}
              </Typography.Title>
              <Typography.Text type="secondary">{dash(user.orgTitle)}</Typography.Text>
              <div style={{ marginTop: 6 }}>
                <Tag>{t(`roles.${user.role}`)}</Tag>
                {user.canManageBookings && <Tag color="blue">{t("userCard.bookingManager")}</Tag>}
                <Typography.Text type="secondary">@{user.userName}</Typography.Text>
              </div>
            </div>
          </Space>

          <Divider style={{ margin: "4px 0" }} orientation="left">
            {t("userCard.contacts")}
          </Divider>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label={t("userCard.innerPhone")}>{dash(user.innerPhone)}</Descriptions.Item>
            <Descriptions.Item label={t("userCard.mobilePhone")}>{dash(user.mobilePhone)}</Descriptions.Item>
            <Descriptions.Item label={t("userCard.email")}>
              <Typography.Link onClick={() => copyEmail(user.email)}>{user.email}</Typography.Link>
            </Descriptions.Item>
            <Descriptions.Item label={t("userCard.room")}>{dash(user.room)}</Descriptions.Item>
          </Descriptions>

          <Divider style={{ margin: "4px 0" }} orientation="left">
            {t("userCard.org")}
          </Divider>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label={t("userCard.orgName")}>{dash(user.orgName)}</Descriptions.Item>
            <Descriptions.Item label={t("userCard.orgDepartment")}>{dash(user.orgDepartment)}</Descriptions.Item>
            <Descriptions.Item label={t("userCard.orgDivision")}>{dash(user.orgDivision)}</Descriptions.Item>
            <Descriptions.Item label={t("userCard.orgTitle")}>{dash(user.orgTitle)}</Descriptions.Item>
          </Descriptions>

          {showRelated && (
            <>
              <Divider style={{ margin: "4px 0" }} orientation="left">
                {t("userCard.tickets")} ({userTickets.length})
              </Divider>
              <List
                size="small"
                dataSource={userTickets}
                locale={{ emptyText: t("common.empty") }}
                renderItem={(tk) => (
                  <List.Item style={{ cursor: "pointer" }} onClick={() => onOpenTicket?.(tk.id)}>
                    <List.Item.Meta
                      title={`№ ${tk.id} · ${tk.title}`}
                      description={<Tag color={STATUS_COLOR[tk.status]}>{t(`tickets.status.${tk.status}`)}</Tag>}
                    />
                  </List.Item>
                )}
              />

              <Divider style={{ margin: "4px 0" }} orientation="left">
                {t("userCard.equipment")} ({userEquipment.length})
              </Divider>
              <List
                size="small"
                dataSource={userEquipment}
                locale={{ emptyText: t("common.empty") }}
                renderItem={(eq) => (
                  <List.Item style={{ cursor: "pointer" }} onClick={() => onOpenAsset?.(eq.id)}>
                    <List.Item.Meta
                      title={eq.model}
                      description={
                        <Typography.Text type="secondary">
                          {eq.inventoryNo} · {eq.location}
                        </Typography.Text>
                      }
                    />
                  </List.Item>
                )}
              />
            </>
          )}
        </Space>
      )}
    </Drawer>
  );
}
