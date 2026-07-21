import type { Equipment } from "@/types";
import { api } from "./client";

export type AssetInput = Omit<Equipment, "id">;

export const assetsApi = {
  list: () => api<Equipment[]>("/assets"),
  create: (input: AssetInput) => api<Equipment>("/assets", { method: "POST", body: input }),
  update: (id: number, input: AssetInput) =>
    api<Equipment>(`/assets/${id}`, { method: "PATCH", body: input }),
  remove: (id: number) => api<void>(`/assets/${id}`, { method: "DELETE" }),
};
