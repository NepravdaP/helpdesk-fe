import type { EquipmentType } from "@/types";

// Атрибуты, зависящие от типа актива. Ключ переводится через i18n (assetAttr.<key>).
// Позже типы и их атрибуты будет конфигурировать суперадмин.
export const ASSET_TYPE_ATTRIBUTES: Record<EquipmentType, string[]> = {
  printer: ["macAddress", "ipAddress"],
  workstation: ["ipAddress"],
  multimedia: [],
};

// Объединение всех атрибутов — для конфигуратора столбцов таблицы.
export const ALL_ASSET_ATTRIBUTES: string[] = Array.from(
  new Set(Object.values(ASSET_TYPE_ATTRIBUTES).flat()),
);
