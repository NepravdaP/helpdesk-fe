import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { POSITION_WEIGHTS } from "@/config/positionWeights";
import { ASSET_TYPE_ATTRIBUTES } from "@/config/assetTypes";
import type { EquipmentType } from "@/types";

// Тип заявки внутри сервиса: задаёт название и срок (SLA). Приоритет выбирается при создании заявки.
export interface TicketTypeConfig {
  key: string;
  name: string;
  slaHours: number;
}
// Сервис — логическая категория работ, внутри которой несколько типов заявок.
export interface ServiceConfig {
  key: string;
  name: string;
  ticketTypes: TicketTypeConfig[];
}
export interface PositionWeight {
  title: string;
  weight: number;
}
export interface AssetAttributeConfig {
  key: string;
  label: string;
}
export interface AssetTypeConfig {
  key: EquipmentType;
  name: string;
  attributes: AssetAttributeConfig[];
}

// Найденный тип заявки + его сервис.
export interface ResolvedTicketType extends TicketTypeConfig {
  serviceKey: string;
  serviceName: string;
}

const initialServices: ServiceConfig[] = [
  {
    key: "hardware",
    name: "Техника",
    ticketTypes: [
      { key: "repair", name: "Ремонт оборудования", slaHours: 8 },
      { key: "replacement", name: "Замена оборудования", slaHours: 24 },
    ],
  },
  {
    key: "software",
    name: "Программное обеспечение",
    ticketTypes: [{ key: "software", name: "Установка ПО", slaHours: 16 }],
  },
  {
    key: "access",
    name: "Доступы",
    ticketTypes: [{ key: "access", name: "Предоставление доступа", slaHours: 8 }],
  },
  {
    key: "other",
    name: "Прочее",
    ticketTypes: [{ key: "other", name: "Прочее", slaHours: 48 }],
  },
];

const ASSET_TYPE_NAMES: Record<EquipmentType, string> = {
  workstation: "АРМ",
  printer: "Принтер",
  multimedia: "Мультимедиа",
};
const ATTR_LABELS: Record<string, string> = {
  macAddress: "MAC-адрес",
  ipAddress: "IP-адрес",
};

const initialWeights: PositionWeight[] = Object.entries(POSITION_WEIGHTS).map(([title, weight]) => ({ title, weight }));

const initialAssetTypes: AssetTypeConfig[] = (Object.keys(ASSET_TYPE_ATTRIBUTES) as EquipmentType[]).map((key) => ({
  key,
  name: ASSET_TYPE_NAMES[key],
  attributes: ASSET_TYPE_ATTRIBUTES[key].map((a) => ({ key: a, label: ATTR_LABELS[a] ?? a })),
}));

interface ConfigContextValue {
  services: ServiceConfig[];
  setServices: (s: ServiceConfig[]) => void;
  weights: PositionWeight[];
  setWeights: (w: PositionWeight[]) => void;
  assetTypes: AssetTypeConfig[];
  setAssetTypes: (a: AssetTypeConfig[]) => void;
  ticketTypeByKey: (key: string) => ResolvedTicketType | undefined;
  positionWeight: (title?: string) => number;
  attributesForType: (type: EquipmentType) => AssetAttributeConfig[];
  assetTypeName: (type: EquipmentType) => string;
  allAssetAttributes: () => AssetAttributeConfig[];
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<ServiceConfig[]>(initialServices);
  const [weights, setWeights] = useState<PositionWeight[]>(initialWeights);
  const [assetTypes, setAssetTypes] = useState<AssetTypeConfig[]>(initialAssetTypes);

  const value = useMemo<ConfigContextValue>(() => {
    const weightMap = new Map(weights.map((w) => [w.title, w.weight]));
    const typeIndex = new Map<string, ResolvedTicketType>();
    for (const svc of services) {
      for (const tt of svc.ticketTypes) {
        typeIndex.set(tt.key, { ...tt, serviceKey: svc.key, serviceName: svc.name });
      }
    }
    return {
      services,
      setServices,
      weights,
      setWeights,
      assetTypes,
      setAssetTypes,
      ticketTypeByKey: (key) => typeIndex.get(key),
      positionWeight: (title) => (title ? (weightMap.get(title) ?? 0) : 0),
      attributesForType: (type) => assetTypes.find((a) => a.key === type)?.attributes ?? [],
      assetTypeName: (type) => assetTypes.find((a) => a.key === type)?.name ?? type,
      allAssetAttributes: () => {
        const seen = new Map<string, AssetAttributeConfig>();
        for (const at of assetTypes) for (const a of at.attributes) if (!seen.has(a.key)) seen.set(a.key, a);
        return [...seen.values()];
      },
    };
  }, [services, weights, assetTypes]);

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used within <ConfigProvider>");
  return ctx;
}
