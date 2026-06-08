import { createContext, useContext, useState, type ReactNode } from "react";
import { useTickets } from "./TicketsContext";
import { TicketDetailDrawer } from "@/components/TicketDetailDrawer";
import { UserCardDrawer } from "@/components/UserCardDrawer";
import { AssetCardDrawer } from "@/components/AssetCardDrawer";

// Общие карточки-сущности. Любой экран может открыть карточку заявки,
// пользователя или актива через useEntityCards(); сами Drawer'ы рендерятся
// один раз здесь, поверх всего приложения.
interface EntityCardsValue {
  openTicket: (id: number) => void;
  openUser: (id: number) => void;
  openAsset: (id: number) => void;
}

const EntityCardsContext = createContext<EntityCardsValue | null>(null);

export function EntityCardsProvider({ children }: { children: ReactNode }) {
  const { tickets, activity, setStatus, setAssignee, addComment, deleteTicket } = useTickets();
  const [ticketId, setTicketId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [assetId, setAssetId] = useState<number | null>(null);

  // Открытие заявки выводит её на передний план, закрывая карточки над ней;
  // карточки пользователя/актива открываются поверх текущей.
  const openTicket = (id: number) => {
    setUserId(null);
    setAssetId(null);
    setTicketId(id);
  };
  const openUser = (id: number) => setUserId(id);
  const openAsset = (id: number) => setAssetId(id);

  const selected = tickets.find((t) => t.id === ticketId) ?? null;

  return (
    <EntityCardsContext.Provider value={{ openTicket, openUser, openAsset }}>
      {children}

      <TicketDetailDrawer
        ticket={selected}
        activity={selected ? (activity[selected.id] ?? []) : []}
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
      />
    </EntityCardsContext.Provider>
  );
}

export function useEntityCards(): EntityCardsValue {
  const ctx = useContext(EntityCardsContext);
  if (!ctx) throw new Error("useEntityCards must be used within <EntityCardsProvider>");
  return ctx;
}
