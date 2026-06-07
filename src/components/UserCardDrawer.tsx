import {
  Descriptions,
  Divider,
  Drawer,
  List,
  Space,
  Tag,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";
import { USERS, EQUIPMENT } from "@/data/mock";
import type { TicketRow, TicketStatus } from "@/types";

const STATUS_COLOR: Record<TicketStatus, string> = {
  open: "blue",
  in_progress: "gold",
  closed: "green",
};

export function UserCardDrawer({
  userId,
  tickets,
  onClose,
  onOpenTicket,
  onOpenAsset,
}: {
  userId: number | null;
  tickets: TicketRow[];
  onClose: () => void;
  onOpenTicket: (id: number) => void;
  onOpenAsset: (id: number) => void;
}) {
  const { t } = useTranslation();
  const user = USERS.find((u) => u.id === userId) ?? null;
  const userTickets = tickets.filter((tk) => tk.createdById === userId);
  const userEquipment = EQUIPMENT.filter((e) => e.assignedToId === userId);

  return (
    <Drawer title={user?.fullName ?? ""} width={520} open={userId != null} onClose={onClose} destroyOnClose>
      {user && (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label={t("userCard.role")}>{t(`roles.${user.role}`)}</Descriptions.Item>
            <Descriptions.Item label={t("userCard.phone")}>{user.phone ?? "—"}</Descriptions.Item>
            <Descriptions.Item label={t("userCard.office")}>{user.office ?? "—"}</Descriptions.Item>
            <Descriptions.Item label={t("userCard.email")}>{user.email}</Descriptions.Item>
          </Descriptions>

          <Divider style={{ margin: "4px 0" }}>
            {t("userCard.tickets")} ({userTickets.length})
          </Divider>
          <List
            size="small"
            dataSource={userTickets}
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

          <Divider style={{ margin: "4px 0" }}>
            {t("userCard.equipment")} ({userEquipment.length})
          </Divider>
          <List
            size="small"
            dataSource={userEquipment}
            locale={{ emptyText: t("common.empty") }}
            renderItem={(eq) => (
              <List.Item style={{ cursor: "pointer" }} onClick={() => onOpenAsset(eq.id)}>
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
        </Space>
      )}
    </Drawer>
  );
}
