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
import { ticketsApi } from "@/api/tickets";
import { ApiError } from "@/api/client";
import type { ActivityEntry, TicketRow, TicketStatus } from "@/types";

// Данные заявок приходят из API. Бэкенд сам фильтрует список по правам пользователя.

interface TicketsContextValue {
  tickets: TicketRow[];
  activity: Record<number, ActivityEntry[]>;
  loading: boolean;
  createTicket: (ticket: TicketRow) => void;
  updateTicket: (ticket: TicketRow) => void;
  setStatus: (id: number, status: TicketStatus) => void;
  setAssignee: (id: number, userId: number | null) => void;
  addComment: (id: number, text: string) => void;
  deleteTicket: (id: number) => void;
  loadActivity: (id: number) => void;
}

const TicketsContext = createContext<TicketsContextValue | null>(null);

export function TicketsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { message } = App.useApp();
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [activity, setActivity] = useState<Record<number, ActivityEntry[]>>({});
  const [loading, setLoading] = useState(true);

  const fail = useCallback(
    (e: unknown) => {
      const text = e instanceof ApiError ? e.message : "Не удалось выполнить операцию";
      message.error(text);
    },
    [message],
  );

  const replaceRow = useCallback((row: TicketRow) => {
    setTickets((prev) => prev.map((r) => (r.id === row.id ? row : r)));
  }, []);

  const refreshActivity = useCallback(
    async (id: number) => {
      try {
        const list = await ticketsApi.activity(id);
        setActivity((prev) => ({ ...prev, [id]: list }));
      } catch (e) {
        fail(e);
      }
    },
    [fail],
  );

  // Загрузка списка при входе и при смене пользователя (роль влияет на выдачу).
  useEffect(() => {
    let alive = true;
    setLoading(true);
    ticketsApi
      .list()
      .then((list) => {
        if (alive) setTickets(list);
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
  }, [user.id, fail]);

  const value = useMemo<TicketsContextValue>(
    () => ({
      tickets,
      activity,
      loading,
      loadActivity: (id) => void refreshActivity(id),
      createTicket: (ticket) => {
        ticketsApi
          .create({
            title: ticket.title,
            description: ticket.description,
            type: ticket.type,
            priority: ticket.priority,
            equipmentId: ticket.equipmentId,
            createdById: ticket.createdById,
          })
          .then((row) => {
            setTickets((prev) => [row, ...prev]);
            message.success("Заявка создана");
          })
          .catch(fail);
      },
      updateTicket: (ticket) => {
        ticketsApi
          .update(ticket.id, {
            title: ticket.title,
            description: ticket.description,
            type: ticket.type,
            priority: ticket.priority,
            equipmentId: ticket.equipmentId,
          })
          .then((row) => {
            replaceRow(row);
            void refreshActivity(row.id);
          })
          .catch(fail);
      },
      updateTicket: (ticket) => {
        setTickets((prev) => prev.map((r) => (r.id === ticket.id ? ticket : r)));
        push(ticket.id, { kind: "edited" });
      },
      setStatus: (id, status) => {
        ticketsApi
          .setStatus(id, status)
          .then((row) => {
            replaceRow(row);
            void refreshActivity(id);
          })
          .catch(fail);
      },
      setAssignee: (id, userId) => {
        ticketsApi
          .setAssignee(id, userId)
          .then((row) => {
            replaceRow(row);
            void refreshActivity(id);
          })
          .catch(fail);
      },
      addComment: (id, text) => {
        ticketsApi
          .addComment(id, text)
          .then(() => Promise.all([refreshActivity(id), ticketsApi.get(id).then(replaceRow)]))
          .catch(fail);
      },
      deleteTicket: (id) => {
        ticketsApi
          .remove(id)
          .then(() => {
            setTickets((prev) => prev.filter((r) => r.id !== id));
            setActivity((prev) => {
              const next = { ...prev };
              delete next[id];
              return next;
            });
            message.success("Заявка удалена");
          })
          .catch(fail);
      },
    }),
    [tickets, activity, loading, message, fail, replaceRow, refreshActivity],
  );

  return <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>;
}

export function useTickets(): TicketsContextValue {
  const ctx = useContext(TicketsContext);
  if (!ctx) throw new Error("useTickets must be used within <TicketsProvider>");
  return ctx;
}
