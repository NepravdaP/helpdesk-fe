// Общие типы предметной области.
// Держим их в одном месте — позже они должны совпасть со схемой Prisma на бэке.

export type Role = "employee" | "it" | "admin";

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
}

// ---- HelpDesk ----
export type TicketStatus = "open" | "in_progress" | "closed";
export type TicketPriority = "low" | "medium" | "high";

export interface Ticket {
  id: number;
  title: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdById: number;
  assignedToId: number | null;
  equipmentId: number | null;
  createdAt: string; // ISO
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
