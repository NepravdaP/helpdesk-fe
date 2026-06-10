import type { Equipment, TicketRow, User } from "@/types";

// Общие мок-данные. Позже придут из API: пользователи из LDAP, активы из инвентаризации.

export const USERS: User[] = [
  { id: 1, userName: "a.ivanov", role: "it", firstName: "Алексей", lastName: "Иванов", middleName: "Сергеевич", fullName: "Иванов Алексей Сергеевич", email: "a.ivanov@org.local", innerPhone: "1201", mobilePhone: "+7 916 100-10-01", room: "к. 312", avatarUrl: null, orgName: "Минстрой", orgDepartment: "Отдел ИТ", orgDivision: "Управление цифрового развития", orgTitle: "Главный специалист-эксперт" },
  { id: 2, userName: "s.orlov", role: "it", firstName: "Сергей", lastName: "Орлов", middleName: "Петрович", fullName: "Орлов Сергей Петрович", email: "s.orlov@org.local", innerPhone: "1202", mobilePhone: "+7 916 100-10-02", room: "к. 312", avatarUrl: null, orgName: "Минстрой", orgDepartment: "Отдел ИТ", orgDivision: "Управление цифрового развития", orgTitle: "Ведущий специалист-эксперт" },
  { id: 3, userName: "o.kuznetsova", role: "employee", firstName: "Ольга", lastName: "Кузнецова", middleName: "Ивановна", fullName: "Кузнецова Ольга Ивановна", email: "o.kuznetsova@org.local", innerPhone: "1310", mobilePhone: "+7 916 100-10-03", room: "к. 210", avatarUrl: null, orgName: "Минстрой", orgDepartment: "Бухгалтерия", orgDivision: "Финансовое управление", orgTitle: "Консультант" },
  { id: 4, userName: "p.sidorov", role: "it", firstName: "Павел", lastName: "Сидоров", middleName: "Андреевич", fullName: "Сидоров Павел Андреевич", email: "p.sidorov@org.local", innerPhone: "1203", mobilePhone: "+7 916 100-10-04", room: "к. 312", avatarUrl: null, orgName: "Минстрой", orgDepartment: "Отдел ИТ", orgDivision: "Управление цифрового развития", orgTitle: "Специалист-эксперт" },
  { id: 5, userName: "e.petrova", role: "employee", firstName: "Елена", lastName: "Петрова", middleName: "Викторовна", fullName: "Петрова Елена Викторовна", email: "e.petrova@org.local", innerPhone: "1405", mobilePhone: "+7 916 100-10-05", room: "к. 304", avatarUrl: null, orgName: "Минстрой", orgDepartment: "Канцелярия", orgDivision: "Административное управление", orgTitle: "Специалист 1 разряда" },
  { id: 6, userName: "d.volkov", role: "employee", firstName: "Дмитрий", lastName: "Волков", middleName: "Олегович", fullName: "Волков Дмитрий Олегович", email: "d.volkov@org.local", innerPhone: "1322", mobilePhone: "+7 916 100-10-06", room: "к. 118", avatarUrl: null, orgName: "Минстрой", orgDepartment: "Юридический отдел", orgDivision: "Правовое управление", orgTitle: "Советник" },
  { id: 7, userName: "k.smirnov", role: "employee", firstName: "Кирилл", lastName: "Смирнов", middleName: "Александрович", fullName: "Смирнов Кирилл Александрович", email: "k.smirnov@org.local", innerPhone: "1225", mobilePhone: "+7 916 100-10-07", room: "к. 225", avatarUrl: null, orgName: "Минстрой", orgDepartment: "Отдел закупок", orgDivision: "Управление обеспечения", orgTitle: "Ведущий консультант" },
  { id: 8, userName: "m.zaytseva", role: "admin", firstName: "Марина", lastName: "Зайцева", middleName: "Николаевна", fullName: "Зайцева Марина Николаевна", email: "m.zaytseva@org.local", innerPhone: "1401", mobilePhone: "+7 916 100-10-08", room: "к. 401", avatarUrl: null, orgName: "Минстрой", orgDepartment: "Отдел ИТ", orgDivision: "Управление цифрового развития", orgTitle: "Начальник отдела" },
  { id: 9, userName: "n.morozova", role: "employee", firstName: "Наталья", lastName: "Морозова", middleName: "Павловна", fullName: "Морозова Наталья Павловна", email: "n.morozova@org.local", innerPhone: "1317", mobilePhone: "+7 916 100-10-09", room: "к. 117", avatarUrl: null, orgName: "Минстрой", orgDepartment: "Бухгалтерия", orgDivision: "Финансовое управление", orgTitle: "Главный специалист-эксперт" },
];

export const EQUIPMENT: Equipment[] = [
  { id: 21, inventoryNo: "ПР-000021", type: "printer", model: "Принтер HP LaserJet M404", serialNumber: "CNB1F2A304", status: "in_use", location: "каб. 304", warrantyUntil: "2026-09-01", assignedToId: 5, attributes: { macAddress: "00:1B:44:11:3A:B7", ipAddress: "10.0.30.21" } },
  { id: 58, inventoryNo: "ММ-000058", type: "multimedia", model: "Монитор Dell U2419", serialNumber: "DLU2419-058", status: "repair", location: "АРМ-58", warrantyUntil: "2025-12-15", assignedToId: 7, attributes: {} },
  { id: 12, inventoryNo: "ММ-000012", type: "multimedia", model: "Проектор Epson EB-2247U", serialNumber: "EPB2247-012", status: "in_use", location: "переговорная", warrantyUntil: null, assignedToId: null, attributes: {} },
  { id: 73, inventoryNo: "АРМ-000073", type: "workstation", model: "Системный блок Lenovo M70", serialNumber: "LNVM70-073", status: "in_use", location: "АРМ-73", warrantyUntil: "2027-03-01", assignedToId: 6, attributes: { ipAddress: "10.0.73.10" } },
  { id: 31, inventoryNo: "ПР-000031", type: "printer", model: "МФУ Kyocera M2540", serialNumber: "KYM2540-031", status: "in_use", location: "каб. 210", warrantyUntil: "2026-05-20", assignedToId: 3, attributes: { macAddress: "00:1B:44:11:3A:C2", ipAddress: "10.0.21.31" } },
  { id: 64, inventoryNo: "АРМ-000064", type: "workstation", model: "Ноутбук HP ProBook 450", serialNumber: "HPPB450-064", status: "in_use", location: "АРМ-64", warrantyUntil: "2026-11-10", assignedToId: 1, attributes: { ipAddress: "10.0.64.12" } },
  { id: 19, inventoryNo: "АРМ-000019", type: "workstation", model: "Системный блок Dell OptiPlex", serialNumber: "DLOPT-019", status: "in_use", location: "АРМ-19", warrantyUntil: "2027-01-01", assignedToId: 2, attributes: { ipAddress: "10.0.19.5" } },
  { id: 88, inventoryNo: "ММ-000088", type: "multimedia", model: "ТВ-панель Samsung 55\"", serialNumber: "SMS55-088", status: "decommissioned", location: "склад", warrantyUntil: null, assignedToId: null, attributes: {} },
];

// Опции для выпадающих списков (форма создания, назначение исполнителя и т.п.).
export const MOCK_USERS = USERS.map((u) => ({ value: u.id, label: u.fullName }));
export const MOCK_EQUIPMENT = EQUIPMENT.map((e) => ({
  value: e.id,
  label: `${e.model} — ${e.location}`,
}));

// Стартовые заявки. Позже заменим на GET /api/tickets.
export const INITIAL_TICKETS: TicketRow[] = [
  { id: 142, title: "Не печатает принтер в 304", description: "Принтер не реагирует на печать, мигает индикатор.", type: "repair", priority: "high", status: "request", group: "print", createdById: 5, assignedToId: null, equipmentId: 21, createdAt: "2025-06-01T09:12:00Z", updatedAt: "2025-06-01T09:12:00Z", requesterName: "Петрова Елена Викторовна", assigneeName: null },
  { id: 141, title: "Замена монитора, АРМ-58", description: "Монитор периодически гаснет, требуется замена.", type: "replacement", priority: "medium", status: "open", group: "helpdesk", createdById: 7, assignedToId: 1, equipmentId: 58, createdAt: "2025-05-31T14:03:00Z", updatedAt: "2025-06-02T10:20:00Z", requesterName: "Смирнов Кирилл Александрович", assigneeName: "Иванов Алексей Сергеевич" },
  { id: 140, title: "Проектор в переговорной мигает", description: "Изображение мерцает при подключении по HDMI.", type: "repair", priority: "medium", status: "open", group: "print", createdById: 3, assignedToId: null, equipmentId: 12, createdAt: "2025-05-31T11:40:00Z", updatedAt: "2025-05-31T11:40:00Z", requesterName: "Кузнецова Ольга Ивановна", assigneeName: null },
  { id: 139, title: "Доступ к сетевой папке отдела", description: "Нужен доступ на чтение/запись к общей папке отдела.", type: "access", priority: "low", status: "clarification", group: "network", createdById: 6, assignedToId: 4, equipmentId: null, createdAt: "2025-05-30T13:05:00Z", updatedAt: "2025-06-01T08:00:00Z", requesterName: "Волков Дмитрий Олегович", assigneeName: "Сидоров Павел Андреевич" },
  { id: 138, title: "Установить ПО для бухгалтерии", description: "Установить и настроить бухгалтерское ПО на 2 АРМ.", type: "software", priority: "low", status: "closed", group: "software", createdById: 9, assignedToId: 4, equipmentId: null, createdAt: "2025-05-29T08:20:00Z", updatedAt: "2025-05-30T16:45:00Z", requesterName: "Морозова Наталья Павловна", assigneeName: "Сидоров Павел Андреевич" },
  { id: 137, title: "Не работает сетевой диск", description: "Сетевой диск не монтируется после перезагрузки.", type: "repair", priority: "high", status: "closed", group: "network", createdById: 2, assignedToId: 1, equipmentId: null, createdAt: "2025-05-28T16:55:00Z", updatedAt: "2025-05-29T09:30:00Z", requesterName: "Орлов Сергей Петрович", assigneeName: "Иванов Алексей Сергеевич" },
];
