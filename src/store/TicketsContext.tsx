import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/auth/AuthContext";
import { INITIAL_TICKETS, MOCK_USERS } from "@/data/mock";
import type { ActivityEntry, TicketRow, TicketStatus } from "@/types";

// Стартовая история для мок-заявок: создание + (если есть) назначение/смена статуса.
function seedActivity(tickets: TicketRow[]): Record<number, ActivityEntry[]> {
  const map: Record<number, ActivityEntry[]> = {};
  for (const tk of tickets) {
    const entries: ActivityEntry[] = [
      { id: tk.id * 10 + 1, kind: "created", at: tk.createdAt, author: tk.requesterName },
    ];
    if (tk.assigneeName) {
      entries.push({ id: tk.id * 10 + 2, kind: "assignee", at: tk.updatedAt, author: tk.assigneeName, assignee: tk.assigneeName });
    }
    if (tk.status !== "open") {
      entries.push({ id: tk.id * 10 + 3, kind: "status", at: tk.updatedAt, author: tk.assigneeName ?? tk.requesterName, status: tk.status });
    }
    map[tk.id] = entries;
  }
  return map;
}

let activitySeq = 1;

interface TicketsContextValue {
  tickets: TicketRow[];
  activity: Record<number, ActivityEntry[]>;
  createTicket: (ticket: TicketRow) => void;
  setStatus: (id: number, status: TicketStatus) => void;
  setAssignee: (id: number, userId: number | null) => void;
  addComment: (id: number, text: string) => void;
  deleteTicket: (id: number) => void;
}

const TicketsContext = createContext<TicketsContextValue | null>(null);

export function TicketsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketRow[]>(INITIAL_TICKETS);
  const [activity, setActivity] = useState<Record<number, ActivityEntry[]>>(() =>
    seedActivity(INITIAL_TICKETS),
  );

  const value = useMemo<TicketsContextValue>(() => {
    const push = (id: number, entry: Omit<ActivityEntry, "id" | "at" | "author">) => {
      const full: ActivityEntry = {
        id: Date.now() * 100 + activitySeq++,
        at: new Date().toISOString(),
        author: user.fullName,
        ...entry,
      };
      setActivity((prev) => ({ ...prev, [id]: [...(prev[id] ?? []), full] }));
    };
    const touch = (id: number) =>
      setTickets((prev) => prev.map((r) => (r.id === id ? { ...r, updatedAt: new Date().toISOString() } : r)));

    return {
      tickets,
      activity,
      createTicket: (ticket) => {
        setTickets((prev) => [ticket, ...prev]);
        setActivity((prev) => ({
          ...prev,
          [ticket.id]: [
            { id: Date.now() * 100 + activitySeq++, kind: "created", at: ticket.createdAt, author: ticket.requesterName },
          ],
        }));
      },
      setStatus: (id, status) => {
        setTickets((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r)),
        );
        push(id, { kind: "status", status });
      },
      setAssignee: (id, userId) => {
        const u = MOCK_USERS.find((x) => x.value === userId) ?? null;
        setTickets((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, assignedToId: userId, assigneeName: u?.label ?? null, updatedAt: new Date().toISOString() }
              : r,
          ),
        );
        push(id, { kind: "assignee", assignee: u?.label ?? null });
      },
      addComment: (id, text) => {
        push(id, { kind: "comment", comment: text });
        touch(id);
      },
      deleteTicket: (id) => {
        setTickets((prev) => prev.filter((r) => r.id !== id));
        setActivity((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      },
    };
  }, [tickets, activity, user.fullName]);

  return <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>;
}

export function useTickets(): TicketsContextValue {
  const ctx = useContext(TicketsContext);
  if (!ctx) throw new Error("useTickets must be used within <TicketsProvider>");
  return ctx;
}
