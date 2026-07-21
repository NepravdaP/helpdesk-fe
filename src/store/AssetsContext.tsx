import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { App } from "antd";
import { useAuth } from "@/auth/AuthContext";
import { can } from "@/auth/permissions";
import { assetsApi } from "@/api/assets";
import { ApiError } from "@/api/client";
import type { Equipment } from "@/types";

// Активы приходят из API. Список грузим только при наличии права assets.view.

interface AssetsContextValue {
  assets: Equipment[];
  loading: boolean;
  createAsset: (asset: Omit<Equipment, "id">) => void;
  updateAsset: (asset: Equipment) => void;
  deleteAsset: (id: number) => void;
}

const AssetsContext = createContext<AssetsContextValue | null>(null);

export function AssetsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { message } = App.useApp();
  const [assets, setAssets] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  const canView = can(user.role, "assets.view");

  const fail = useCallback(
    (e: unknown) => {
      message.error(e instanceof ApiError ? e.message : "Не удалось выполнить операцию");
    },
    [message],
  );

  useEffect(() => {
    if (!canView) {
      setAssets([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    assetsApi
      .list()
      .then((list) => {
        if (alive) setAssets(list);
      })
      .catch((e) => {
        if (alive) fail(e);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [canView, user.id, fail]);

  const value = useMemo<AssetsContextValue>(
    () => ({
      assets,
      loading,
      createAsset: (asset) => {
        assetsApi
          .create(asset)
          .then((row) => {
            setAssets((prev) => [row, ...prev]);
            message.success("Актив добавлен");
          })
          .catch(fail);
      },
      updateAsset: (asset) => {
        const { id, ...input } = asset;
        assetsApi
          .update(id, input)
          .then((row) => setAssets((prev) => prev.map((a) => (a.id === row.id ? row : a))))
          .catch(fail);
      },
      deleteAsset: (id) => {
        assetsApi
          .remove(id)
          .then(() => {
            setAssets((prev) => prev.filter((a) => a.id !== id));
            message.success("Актив удалён");
          })
          .catch(fail);
      },
    }),
    [assets, loading, message, fail],
  );

  return <AssetsContext.Provider value={value}>{children}</AssetsContext.Provider>;
}

export function useAssets(): AssetsContextValue {
  const ctx = useContext(AssetsContext);
  if (!ctx) throw new Error("useAssets must be used within <AssetsProvider>");
  return ctx;
}
