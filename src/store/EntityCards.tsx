import { createContext, useContext, useState, type ReactNode } from "react";
import { useTickets } from "./TicketsContext";
import { useAssets } from "./AssetsContext";
import { useUsers } from "./UsersContext";
import { TicketDetailDrawer } from "@/components/TicketDetailDrawer";
import { TicketFormDrawer } from "@/components/TicketFormDrawer";
import { UserCardDrawer } from "@/components/UserCardDrawer";
import { UserFormDrawer } from "@/components/UserFormDrawer";
import { AssetCardDrawer } from "@/components/AssetCardDrawer";
import { AssetFormDrawer } from "@/components/AssetFormDrawer";
import type { Equipment, TicketRow, User } from "@/types";

interface EntityCardsValue {
  openTicket: (id: number) => void;
  openTicketForm: (ticket: TicketRow | null) => void;
  openUser: (id: number) => void;
  openUserForm: (user: User) => void;
  openAsset: (id: number) => void;
  openAssetForm: (asset: Equipment | null) => void;
}

const EntityCardsContext = createContext<EntityCardsValue | null>(null);

export function EntityCardsProvider({ children }: { children: ReactNode }) {
  const { tickets, activity, createTicket, updateTicket, setStatus, setAssignee, addComment, deleteTicket, loadActivity } =
    useTickets();
  const { assets, createAsset, updateAsset, deleteAsset } = useAssets();
  const { users, updateUser } = useUsers();

  const [ticketId, setTicketId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [assetId, setAssetId] = useState<number | null>(null);

  const [ticketFormOpen, setTicketFormOpen] = useState(false);
  const [ticketEditing, setTicketEditing] = useState<TicketRow | null>(null);
  const [assetFormOpen, setAssetFormOpen] = useState(false);
  const [assetEditing, setAssetEditing] = useState<Equipment | null>(null);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [userEditing, setUserEditing] = useState<User | null>(null);

  const openTicket = (id: number) => {
    setUserId(null);
    setAssetId(null);
    setTicketId(id);
    loadActivity(id);
  };
  const openUser = (id: number) => setUserId(id);
  const openAsset = (id: number) => setAssetId(id);
  const openTicketForm = (ticket: TicketRow | null) => {
    setTicketEditing(ticket);
    setTicketFormOpen(true);
  };
  const openAssetForm = (asset: Equipment | null) => {
    setAssetEditing(asset);
    setAssetFormOpen(true);
  };
  const openUserForm = (user: User) => {
    setUserEditing(user);
    setUserFormOpen(true);
  };

  const selectedTicket = tickets.find((t) => t.id === ticketId) ?? null;
  const selectedAsset = assets.find((a) => a.id === assetId) ?? null;
  const selectedUser = users.find((u) => u.id === userId) ?? null;

  return (
    <EntityCardsContext.Provider
      value={{ openTicket, openTicketForm, openUser, openUserForm, openAsset, openAssetForm }}
    >
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
        onEdit={() => selectedTicket && openTicketForm(selectedTicket)}
        onDelete={(id) => {
          deleteTicket(id);
          setTicketId(null);
        }}
      />
      <TicketFormDrawer
        open={ticketFormOpen}
        ticket={ticketEditing}
        onClose={() => setTicketFormOpen(false)}
        onCreate={createTicket}
        onUpdate={updateTicket}
      />

      <UserCardDrawer
        userId={userId}
        tickets={tickets}
        onClose={() => setUserId(null)}
        onOpenTicket={openTicket}
        onOpenAsset={openAsset}
        onEdit={() => selectedUser && openUserForm(selectedUser)}
      />
      <UserFormDrawer
        open={userFormOpen}
        user={userEditing}
        onClose={() => setUserFormOpen(false)}
        onSave={updateUser}
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
