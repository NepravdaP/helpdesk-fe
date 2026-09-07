import type { Booking, Room } from "@/types";
import { api } from "./client";

export interface CreateBookingInput {
  roomId: number;
  startTime: string;
  endTime: string;
  purpose: string;
  userId?: number;
}

export const bookingApi = {
  rooms: () => api<Room[]>("/booking/rooms"),
  list: (params?: { from?: string; to?: string; roomId?: number }) => {
    const q = new URLSearchParams();
    if (params?.from) q.set("from", params.from);
    if (params?.to) q.set("to", params.to);
    if (params?.roomId) q.set("roomId", String(params.roomId));
    const qs = q.toString();
    return api<Booking[]>(`/booking/bookings${qs ? `?${qs}` : ""}`);
  },
  create: (input: CreateBookingInput) =>
    api<Booking>("/booking/bookings", { method: "POST", body: input }),
  cancel: (id: number) =>
    api<Booking>(`/booking/bookings/${id}/cancel`, { method: "PATCH" }),
};
