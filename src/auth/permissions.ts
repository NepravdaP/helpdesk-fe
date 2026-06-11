import type { Role } from "@/types";

// Модель прав. Каждой роли сопоставлен набор «способностей» (capabilities).
// Экраны, кнопки и доступ к роутам проверяют права через can(role, capability).
// Менять политику доступа нужно только здесь.

export type Capability =
  | "tickets.viewAll" // видеть все заявки (иначе — только свои)
  | "tickets.filter" // фильтры и настройка столбцов
  | "tickets.create"
  | "tickets.edit" // смена статуса, назначение исполнителя
  | "tickets.delete"
  | "booking.view" // оставлять заявки на бронь
  | "booking.manage" // администрирование броней залов
  | "booking.assignManagers" // назначать сотрудников управляющими бронями
  | "assets.view"
  | "assets.create"
  | "assets.edit"
  | "assets.delete"
  | "users.view"
  | "users.edit"
  | "directory.view" // справочник сотрудников (доступен всем)
  | "dashboard.own" // дашборд по своим заявкам
  | "dashboard.full" // полный дашборд
  | "reports.view"
  | "config.manage"; // типы заявок/оборудования, списки статусов

export const ALL_CAPABILITIES: Capability[] = [
  "tickets.viewAll",
  "tickets.filter",
  "tickets.create",
  "tickets.edit",
  "tickets.delete",
  "booking.view",
  "booking.manage",
  "booking.assignManagers",
  "assets.view",
  "assets.create",
  "assets.edit",
  "assets.delete",
  "users.view",
  "users.edit",
  "directory.view",
  "dashboard.own",
  "dashboard.full",
  "reports.view",
  "config.manage",
];

const IT: Capability[] = [
  "tickets.viewAll",
  "tickets.filter",
  "tickets.create",
  "tickets.edit",
  "booking.view",
  "assets.view",
  "assets.edit",
  "users.view",
  "users.edit",
  "directory.view",
  "dashboard.own",
];

const ADMIN: Capability[] = [
  ...IT,
  "tickets.delete",
  "assets.create",
  "assets.delete",
  "booking.assignManagers",
  "reports.view",
  "dashboard.full",
];

export const ROLE_CAPABILITIES: Record<Role, Capability[]> = {
  // Сотрудник: только свои заявки (создание), бронирование и справочник.
  employee: ["tickets.create", "booking.view", "directory.view"],
  // IT-специалист: заявки с фильтрами и редактированием, активы, пользователи, бронь, дашборд по своим.
  it: IT,
  // Администратор: всё, что у IT, плюс отчёты, полный дашборд, удаление заявок и техники.
  admin: ADMIN,
  // Суперадминистратор: всё, включая конфигурацию.
  superadmin: ALL_CAPABILITIES,
};

// booking.manage не выдаётся ролью: суперадмин назначает сотрудников
// для управления бронями в конфигураторе (флаг canManageBookings у пользователя).

export function can(role: Role, capability: Capability): boolean {
  return ROLE_CAPABILITIES[role].includes(capability);
}
