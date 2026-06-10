// Общие типы предметной области.
// Держим их в одном месте — позже они должны совпасть со схемой Prisma на бэке.

export type Role = "employee" | "it" | "admin" | "superadmin";

export interface User {
  id: number;
  userName: string; // логин (sAMAccountName/UPN из AD), уникальный
  role: Role;
  firstName: string;
  lastName: string;
  middleName?: string; // отчество
  fullName: string; // ФИО (displayName из AD): «Фамилия Имя Отчество»
  email: string;
  innerPhone?: string; // внутренний телефон
  mobilePhone?: string;
  room?: string; // кабинет
  avatarUrl?: string | null;
  orgName?: string; // организация (company)
  orgDepartment?: string; // отдел (department)
  orgDivision?: string; // подразделение (division)
  orgTitle?: string; // должность (title)
  canManageBookings?: boolean; // назначается суперадмином в конфигураторе
}

// ---- HelpDesk ----
export type TicketStatus = "request" | "open" | "clarification" | "closed";
export type TicketPriority = "low" | "medium" | "high";
// Сервис заявки (бывш. «тип») — теперь конфигурируемый суперадмином, поэтому строка-ключ.
export type TicketType = string;
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
export type ActivityKind = "created" | "status" | "assignee" | "comment" | "edited";
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
  attributes?: Record<string, string>; // поля, зависящие от типа (MAC, IP и т.п.)
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
