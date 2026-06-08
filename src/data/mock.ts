import type { Equipment, TicketRow, User } from "@/types";

// Общие мок-данные. Позже придут из API: пользователи из LDAP, активы из инвентаризации.

export const USERS: User[] = [
  { id: 1, fullName: "А. Иванов", email: "a.ivanov@org.local", role: "it", phone: "+7 495 123-45-01", office: "к. 312" },
  { id: 2, fullName: "С. Орлов", email: "s.orlov@org.local", role: "it", phone: "+7 495 123-45-02", office: "к. 312" },
  { id: 3, fullName: "О. Кузнецова", email: "o.kuznetsova@org.local", role: "employee", phone: "+7 495 123-45-03", office: "к. 210" },
  { id: 4, fullName: "П. Сидоров", email: "p.sidorov@org.local", role: "it", phone: "+7 495 123-45-04", office: "к. 312" },
  { id: 5, fullName: "Е. Петрова", email: "e.petrova@org.local", role: "employee", phone: "+7 495 123-45-05", office: "к. 304" },
  { id: 6, fullName: "Д. Волков", email: "d.volkov@org.local", role: "employee", phone: "+7 495 123-45-06", office: "к. 118" },
  { id: 7, fullName: "К. Смирнов", email: "k.smirnov@org.local", role: "employee", phone: "+7 495 123-45-07", office: "к. 225" },
  { id: 8, fullName: "М. Зайцева", email: "m.zaytseva@org.local", role: "admin", phone: "+7 495 123-45-08", office: "к. 401" },
  { id: 9, fullName: "Н. Морозова", email: "n.morozova@org.local", role: "employee", phone: "+7 495 123-45-09", office: "к. 117" },
];

export const EQUIPMENT: Equipment[] = [
  { id: 21, inventoryNo: "ПР-000021", type: "printer", model: "Принтер HP LaserJet M404", serialNumber: "CNB1F2A304", status: "in_use", location: "каб. 304", warrantyUntil: "2026-09-01", assignedToId: 5 },
  { id: 58, inventoryNo: "АРМ-000058", type: "workstation", model: "Монитор Dell U2419", serialNumber: "DLU2419-058", status: "repair", location: "АРМ-58", warrantyUntil: "2025-12-15", assignedToId: 7 },
  { id: 12, inventoryNo: "ММ-000012", type: "multimedia", model: "Проектор Epson EB-2247U", serialNumber: "EPB2247-012", status: "in_use", location: "переговорная", warrantyUntil: null, assignedToId: null },
  { id: 73, inventoryNo: "АРМ-000073", type: "workstation", model: "Системный блок Lenovo M70", serialNumber: "LNVM70-073", status: "in_use", location: "АРМ-73", warrantyUntil: "2027-03-01", assignedToId: 6 },
  { id: 31, inventoryNo: "ПР-000031", type: "printer", model: "МФУ Kyocera M2540", serialNumber: "KYM2540-031", status: "in_use", location: "каб. 210", warrantyUntil: "2026-05-20", assignedToId: 3 },
  { id: 64, inventoryNo: "АРМ-000064", type: "workstation", model: "Ноутбук HP ProBook 450", serialNumber: "HPPB450-064", status: "in_use", location: "АРМ-64", warrantyUntil: "2026-11-10", assignedToId: 1 },
  { id: 19, inventoryNo: "АРМ-000019", type: "workstation", model: "Системный блок Dell OptiPlex", serialNumber: "DLOPT-019", status: "in_use", location: "АРМ-19", warrantyUntil: "2027-01-01", assignedToId: 2 },
  { id: 88, inventoryNo: "ММ-000088", type: "multimedia", model: "ТВ-панель Samsung 55\"", serialNumber: "SMS55-088", status: "decommissioned", location: "склад", warrantyUntil: null, assignedToId: null },
];

// Опции для выпадающих списков (форма создания, назначение исполнителя и т.п.).
export const MOCK_USERS = USERS.map((u) => ({ value: u.id, label: u.fullName }));
export const MOCK_EQUIPMENT = EQUIPMENT.map((e) => ({
  value: e.id,
  label: `${e.model} — ${e.location}`,
}));

// Стартовые заявки. Позже заменим на GET /api/tickets.
export const INITIAL_TICKETS: TicketRow[] = [
  { id: 142, title: "Не печатает принтер в 304", description: "Принтер не реагирует на печать, мигает индикатор.", type: "repair", priority: "high", status: "open", group: "print", createdById: 5, assignedToId: null, equipmentId: 21, createdAt: "2025-06-01T09:12:00Z", updatedAt: "2025-06-01T09:12:00Z", requesterName: "Е. Петрова", assigneeName: null },
  { id: 141, title: "Замена монитора, АРМ-58", description: "Монитор периодически гаснет, требуется замена.", type: "replacement", priority: "medium", status: "in_progress", group: "helpdesk", createdById: 7, assignedToId: 1, equipmentId: 58, createdAt: "2025-05-31T14:03:00Z", updatedAt: "2025-06-02T10:20:00Z", requesterName: "К. Смирнов", assigneeName: "А. Иванов" },
  { id: 140, title: "Проектор в переговорной мигает", description: "Изображение мерцает при подключении по HDMI.", type: "repair", priority: "medium", status: "open", group: "print", createdById: 3, assignedToId: null, equipmentId: 12, createdAt: "2025-05-31T11:40:00Z", updatedAt: "2025-05-31T11:40:00Z", requesterName: "О. Кузнецова", assigneeName: null },
  { id: 139, title: "Доступ к сетевой папке отдела", description: "Нужен доступ на чтение/запись к общей папке отдела.", type: "access", priority: "low", status: "in_progress", group: "network", createdById: 6, assignedToId: 4, equipmentId: null, createdAt: "2025-05-30T13:05:00Z", updatedAt: "2025-06-01T08:00:00Z", requesterName: "Д. Волков", assigneeName: "П. Сидоров" },
  { id: 138, title: "Установить ПО для бухгалтерии", description: "Установить и настроить бухгалтерское ПО на 2 АРМ.", type: "software", priority: "low", status: "closed", group: "software", createdById: 9, assignedToId: 4, equipmentId: null, createdAt: "2025-05-29T08:20:00Z", updatedAt: "2025-05-30T16:45:00Z", requesterName: "Н. Морозова", assigneeName: "П. Сидоров" },
  { id: 137, title: "Не работает сетевой диск", description: "Сетевой диск не монтируется после перезагрузки.", type: "repair", priority: "high", status: "closed", group: "network", createdById: 2, assignedToId: 1, equipmentId: null, createdAt: "2025-05-28T16:55:00Z", updatedAt: "2025-05-29T09:30:00Z", requesterName: "С. Орлов", assigneeName: "А. Иванов" },
];
