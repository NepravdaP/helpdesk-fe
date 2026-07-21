import type { ActivityEntry, TicketPriority, TicketRow, TicketStatus } from "@/types";
import { api } from "./client";

export interface CreateTicketInput {
  title: string;
  description: string;
  type: string;
  priority: TicketPriority;
  equipmentId?: number | null;
  createdById?: number;
}
export type UpdateTicketInput = Partial<CreateTicketInput>;

export const ticketsApi = {
  list: () => api<TicketRow[]>("/tickets"),
  get: (id: number) => api<TicketRow>(`/tickets/${id}`),
  create: (input: CreateTicketInput) =>
    api<TicketRow>("/tickets", { method: "POST", body: input }),
  update: (id: number, input: UpdateTicketInput) =>
    api<TicketRow>(`/tickets/${id}`, { method: "PATCH", body: input }),
  setStatus: (id: number, status: TicketStatus) =>
    api<TicketRow>(`/tickets/${id}/status`, { method: "PATCH", body: { status } }),
  setAssignee: (id: number, assignedToId: number | null) =>
    api<TicketRow>(`/tickets/${id}/assignee`, { method: "PATCH", body: { assignedToId } }),
  addComment: (id: number, text: string) =>
    api<ActivityEntry>(`/tickets/${id}/comments`, { method: "POST", body: { text } }),
  activity: (id: number) => api<ActivityEntry[]>(`/tickets/${id}/activity`),
  remove: (id: number) => api<void>(`/tickets/${id}`, { method: "DELETE" }),
};
