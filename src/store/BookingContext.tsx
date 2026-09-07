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
import { bookingApi, type CreateBookingInput } from "@/api/booking";
import { ApiError } from "@/api/client";
import type { Booking, Room } from "@/types";

interface BookingContextValue {
  rooms: Room[];
  bookings: Booking[];
  loading: boolean;
  createBooking: (input: CreateBookingInput) => Promise<boolean>;
  cancelBooking: (id: number) => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { message } = App.useApp();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fail = useCallback(
    (e: unknown) => {
      message.error(e instanceof ApiError ? e.message : "Не удалось выполнить операцию");
    },
    [message],
  );

  const reloadBookings = useCallback(() => {
    bookingApi
      .list()
      .then(setBookings)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([bookingApi.rooms(), bookingApi.list()])
      .then(([r, b]) => {
        if (!alive) return;
        setRooms(r);
        setBookings(b);
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

  const value = useMemo<BookingContextValue>(
    () => ({
      rooms,
      bookings,
      loading,
      createBooking: async (input) => {
        try {
          await bookingApi.create(input);
          reloadBookings();
          message.success("Бронь создана");
          return true;
        } catch (e) {
          fail(e);
          return false;
        }
      },
      cancelBooking: (id) => {
        bookingApi
          .cancel(id)
          .then((updated) => {
            setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
            message.success("Бронь отменена");
          })
          .catch(fail);
      },
    }),
    [rooms, bookings, loading, message, fail, reloadBookings],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within <BookingProvider>");
  return ctx;
}
