import { api } from "./client";
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
