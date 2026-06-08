// Общие типы предметной области.
// Держим их в одном месте — позже они должны совпасть со схемой Prisma на бэке.

export type Role = "employee" | "it" | "admin" | "superadmin" | "room_admin";

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  phone?: string;
  office?: string; // кабинет
}

// ---- HelpDesk ----
export type TicketStatus = "open" | "in_progress" | "closed";
export type TicketPriority = "low" | "medium" | "high";
export type TicketType = "repair" | "replacement" | "software" | "access" | "other";
export type TicketGroup = "helpdesk" | "network" | "print" | "software";

export interface Ticket {
  id: number;
  title: string;
  description: string;
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  group: TicketGroup | null; // группа исполнителей
  createdById: number; // заявитель (FK → users)
  assignedToId: number | null;
  equipmentId: number | null;
  createdAt: string; // ISO — дата создания
  updatedAt: string; // ISO — дата изменения
}

// Конфигурация типа заявки. То, что задаёт суперадмин:
// от типа зависят приоритет, группа исполнителей и срок исполнения (SLA).
export interface TicketTypeConfig {
  priority: TicketPriority;
  group: TicketGroup;
  slaHours: number; // нормативный срок исполнения, часов
}

// Строка для таблицы/карточки — заявка с «развёрнутыми» именами (на бэке придут из JOIN).
export type TicketRow = Ticket & {
  requesterName: string;
  assigneeName: string | null;
};

// Лента действий по заявке (на бэке — отдельная таблица истории/комментариев).
export type ActivityKind = "created" | "status" | "assignee" | "comment";
export interface ActivityEntry {
  id: number;
  kind: ActivityKind;
  at: string; // ISO
  author: string;
  status?: TicketStatus; // для kind="status"
  assignee?: string | null; // для kind="assignee"
  comment?: string; // для kind="comment"
}

// ---- Инвентаризация ----
export type EquipmentStatus = "in_use" | "repair" | "decommissioned";
export type EquipmentType = "workstation" | "printer" | "multimedia";

export interface Equipment {
  id: number;
  inventoryNo: string;
  type: EquipmentType;
  model: string;
  serialNumber: string;
  status: EquipmentStatus;
  location: string;
  warrantyUntil: string | null; // ISO
  assignedToId: number | null; // за кем закреплён (FK → users)
}

// ---- Бронирование ----
export type BookingStatus = "confirmed" | "cancelled";

export interface Room {
  id: number;
  name: string;
  capacity: number;
  equipment: string[];
}

export interface Booking {
  id: number;
  roomId: number;
  userId: number;
  startTime: string; // ISO
  endTime: string; // ISO
  purpose: string;
  status: BookingStatus;
}
