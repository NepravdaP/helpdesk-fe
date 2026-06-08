import {
  Avatar,
  Descriptions,
  Divider,
  Drawer,
  List,
  Space,
  Tag,
  Typography,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { USERS } from "@/data/mock";
import { useAssets } from "@/store/AssetsContext";
import { useCopyEmail } from "@/hooks/useCopyEmail";
import { palette } from "@/theme/colors";
import type { TicketRow, TicketStatus } from "@/types";

const STATUS_COLOR: Record<TicketStatus, string> = {
  open: "blue",
  in_progress: "gold",
  closed: "green",
};

const dash = (v?: string | null) => (v && v.length ? v : "—");

export function UserCardDrawer({
  userId,
  tickets = [],
  onClose,
  onOpenTicket,
  onOpenAsset,
  showRelated = true,
}: {
  userId: number | null;
  tickets?: TicketRow[];
  onClose: () => void;
  onOpenTicket?: (id: number) => void;
  onOpenAsset?: (id: number) => void;
  showRelated?: boolean;
}) {
  const { t } = useTranslation();
  const copyEmail = useCopyEmail();
  const { assets } = useAssets();
  const user = USERS.find((u) => u.id === userId) ?? null;
  const userTickets = tickets.filter((tk) => tk.createdById === userId);
  const userEquipment = assets.filter((e) => e.assignedToId === userId);

  const initials =
    user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() : "";

  return (
    <Drawer title={user?.fullName ?? ""} width={540} open={userId != null} onClose={onClose} destroyOnClose>
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
