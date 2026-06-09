import { createContext, useContext, useState, type ReactNode } from "react";
import { useTickets } from "./TicketsContext";
import { useAssets } from "./AssetsContext";
import { TicketDetailDrawer } from "@/components/TicketDetailDrawer";
import { UserCardDrawer } from "@/components/UserCardDrawer";
import { AssetCardDrawer } from "@/components/AssetCardDrawer";
import { AssetFormDrawer } from "@/components/AssetFormDrawer";
import type { Equipment } from "@/types";

// Общие карточки-сущности + форма актива. Любой экран может открыть карточку
// заявки/пользователя/актива и форму актива через useEntityCards();
// сами Drawer'ы рендерятся один раз здесь, поверх всего приложения.
interface EntityCardsValue {
  openTicket: (id: number) => void;
  openUser: (id: number) => void;
  openAsset: (id: number) => void;
  openAssetForm: (asset: Equipment | null) => void;
}

const EntityCardsContext = createContext<EntityCardsValue | null>(null);

export function EntityCardsProvider({ children }: { children: ReactNode }) {
  const { tickets, activity, setStatus, setAssignee, addComment, deleteTicket } = useTickets();
  const { assets, createAsset, updateAsset, deleteAsset } = useAssets();

  const [ticketId, setTicketId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [assetId, setAssetId] = useState<number | null>(null);
  const [assetFormOpen, setAssetFormOpen] = useState(false);
  const [assetEditing, setAssetEditing] = useState<Equipment | null>(null);

  const openTicket = (id: number) => {
    setUserId(null);
    setAssetId(null);
    setTicketId(id);
  };
  const openUser = (id: number) => setUserId(id);
  const openAsset = (id: number) => setAssetId(id);
  const openAssetForm = (asset: Equipment | null) => {
    setAssetEditing(asset);
    setAssetFormOpen(true);
  };

  const selectedTicket = tickets.find((t) => t.id === ticketId) ?? null;
  const selectedAsset = assets.find((a) => a.id === assetId) ?? null;

  return (
    <EntityCardsContext.Provider value={{ openTicket, openUser, openAsset, openAssetForm }}>
      {children}

      <TicketDetailDrawer
        ticket={selectedTicket}
        activity={selectedTicket ? (activity[selectedTicket.id] ?? []) : []}
        onClose={() => setTicketId(null)}
        onStatusChange={setStatus}
        onAssigneeChange={setAssignee}
        onAddComment={addComment}
        onOpenUser={openUser}
        onOpenAsset={openAsset}
        onDelete={(id) => {
          deleteTicket(id);
          setTicketId(null);
        }}
      />
      <UserCardDrawer
        userId={userId}
        tickets={tickets}
        onClose={() => setUserId(null)}
        onOpenTicket={openTicket}
        onOpenAsset={openAsset}
      />
      <AssetCardDrawer
        assetId={assetId}
        tickets={tickets}
        onClose={() => setAssetId(null)}
        onOpenTicket={openTicket}
        onOpenUser={openUser}
        onEdit={() => selectedAsset && openAssetForm(selectedAsset)}
        onDelete={() => {
          if (assetId != null) {
            deleteAsset(assetId);
            setAssetId(null);
          }
        }}
      />
      <AssetFormDrawer
        open={assetFormOpen}
        asset={assetEditing}
        onClose={() => setAssetFormOpen(false)}
        onCreate={createAsset}
        onUpdate={updateAsset}
      />
    </EntityCardsContext.Provider>
  );
}

export function useEntityCards(): EntityCardsValue {
  const ctx = useContext(EntityCardsContext);
  if (!ctx) throw new Error("useEntityCards must be used within <EntityCardsProvider>");
  return ctx;
}
