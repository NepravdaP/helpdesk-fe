import { api } from "./client";
import type { Role } from "@/types";
import type { ServiceConfig, PositionWeight, AssetTypeConfig } from "@/store/ConfigContext";

export interface FullConfig {
  services: ServiceConfig[];
  weights: PositionWeight[];
  assetTypes: AssetTypeConfig[];
}

export const configApi = {
  get: () => api<FullConfig>("/config"),
  putServices: (services: ServiceConfig[]) =>
    api<FullConfig>("/config/services", { method: "PUT", body: { services } }),
  putWeights: (weights: PositionWeight[]) =>
    api<FullConfig>("/config/position-weights", { method: "PUT", body: { weights } }),
  putAssetTypes: (assetTypes: AssetTypeConfig[]) =>
    api<FullConfig>("/config/asset-types", { method: "PUT", body: { assetTypes } }),
};

// ——— LDAP / Active Directory (Конфигурация → LDAP) ———

export interface LdapSettingsBase {
  url: string;
  bindTemplate: string;
  searchBase: string;
  searchFilter: string;
  syncBindDn: string;
  syncFilter: string;
  groupSuperadmin: string;
  groupAdmin: string;
  groupIt: string;
  groupBookingManagers: string;
  tlsRejectUnauthorized: boolean;
  timeoutMs: number;
}

// Пароль сервисной учётки сервер никогда не возвращает — только признак, что он задан.
export interface LdapSettings extends LdapSettingsBase {
  hasSyncBindPassword: boolean;
  source: "db" | "env";
  updatedAt: string | null;
  updatedBy: string | null;
  authDevBypass: boolean;
}

// syncBindPassword: пусто — оставить прежний; clearSyncBindPassword — стереть.
export interface LdapSettingsInput extends LdapSettingsBase {
  syncBindPassword?: string;
  clearSyncBindPassword?: boolean;
}

export interface LdapTestStep {
  key: "serviceBind" | "search" | "userAuth";
  ok: boolean;
  message: string;
  durationMs: number;
}

export interface LdapTestResult {
  ok: boolean;
  steps: LdapTestStep[];
  user?: {
    userName: string;
    fullName: string;
    email: string;
    orgTitle?: string;
    role: Role;
    canManageBookings: boolean;
    groupsCount: number;
  };
}

export const ldapConfigApi = {
  get: () => api<LdapSettings>("/config/ldap"),
  save: (settings: LdapSettingsInput) => api<LdapSettings>("/config/ldap", { method: "PUT", body: settings }),
  reset: () => api<LdapSettings>("/config/ldap", { method: "DELETE" }),
  // settings — проверить черновик до сохранения; без него проверяются действующие настройки.
  test: (body: { settings?: LdapSettingsInput; testUser?: { userName: string; password: string } }) =>
    api<LdapTestResult>("/config/ldap/test", { method: "POST", body }),
};
