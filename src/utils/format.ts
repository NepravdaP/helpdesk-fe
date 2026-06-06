// Форматирование даты-времени под текущий язык интерфейса.
export function formatDateTime(iso: string, lang: string): string {
  const locale = lang.startsWith("en") ? "en-GB" : "ru-RU";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
