import type { TicketType, TicketTypeConfig } from "@/types";

// Конфигурация типов заявок: тип → приоритет, группа исполнителей, срок (SLA).
// В дальнейшем это редактирует суперадмин (отдельный экран). Здесь — значения по умолчанию.
export const TICKET_TYPE_CONFIG: Record<TicketType, TicketTypeConfig> = {
  repair: { priority: "high", group: "helpdesk", slaHours: 8 },
  replacement: { priority: "medium", group: "helpdesk", slaHours: 24 },
  software: { priority: "low", group: "software", slaHours: 16 },
  access: { priority: "medium", group: "network", slaHours: 8 },
  other: { priority: "low", group: "helpdesk", slaHours: 48 },
};
