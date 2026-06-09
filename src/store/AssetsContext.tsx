import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { EQUIPMENT } from "@/data/mock";
import type { Equipment } from "@/types";

interface AssetsContextValue {
  assets: Equipment[];
  createAsset: (asset: Omit<Equipment, "id">) => void;
  updateAsset: (asset: Equipment) => void;
  deleteAsset: (id: number) => void;
}

const AssetsContext = createContext<AssetsContextValue | null>(null);

let assetSeq = 1000;

export function AssetsProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Equipment[]>(EQUIPMENT);

  const value = useMemo<AssetsContextValue>(
    () => ({
      assets,
      createAsset: (asset) => setAssets((prev) => [{ ...asset, id: ++assetSeq }, ...prev]),
      updateAsset: (asset) => setAssets((prev) => prev.map((a) => (a.id === asset.id ? asset : a))),
      deleteAsset: (id) => setAssets((prev) => prev.filter((a) => a.id !== id)),
    }),
    [assets],
  );

  return <AssetsContext.Provider value={value}>{children}</AssetsContext.Provider>;
}

export function useAssets(): AssetsContextValue {
  const ctx = useContext(AssetsContext);
  if (!ctx) throw new Error("useAssets must be used within <AssetsProvider>");
  return ctx;
}
