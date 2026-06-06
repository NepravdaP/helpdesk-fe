import { useEffect, useState } from "react";
import { ConfigProvider } from "antd";
import type { Locale } from "antd/es/locale";
import ruRU from "antd/locale/ru_RU";
import enUS from "antd/locale/en_US";
import { Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { theme } from "@/theme/theme";
import { AppLayout } from "@/components/AppLayout";
import { RoleGuard, HomeRedirect } from "@/components/RoleGuard";
import { DashboardPage } from "@/pages/DashboardPage";
import { TicketsPage } from "@/pages/TicketsPage";
import {
  InventoryPage,
  BookingPage,
  UsersPage,
  ReportsPage,
} from "@/pages/Placeholders";

// Локаль AntD держим синхронной с языком приложения (i18n).
// Так встроенные тексты компонентов (пагинация, "нет данных", date-picker)
// переключаются вместе с интерфейсом.
const ANTD_LOCALES: Record<string, Locale> = { ru: ruRU, en: enUS };

export default function App() {
  const { i18n } = useTranslation();
  const [antdLocale, setAntdLocale] = useState<Locale>(
    ANTD_LOCALES[i18n.language.slice(0, 2)] ?? ruRU,
  );

  useEffect(() => {
    const onChange = (lng: string) =>
      setAntdLocale(ANTD_LOCALES[lng.slice(0, 2)] ?? ruRU);
    i18n.on("languageChanged", onChange);
    return () => i18n.off("languageChanged", onChange);
  }, [i18n]);

  return (
    <ConfigProvider theme={theme} locale={antdLocale}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomeRedirect />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="helpdesk" element={<TicketsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="booking" element={<BookingPage />} />
          <Route
            path="users"
            element={
              <RoleGuard allow={["admin"]}>
                <UsersPage />
              </RoleGuard>
            }
          />
          <Route
            path="reports"
            element={
              <RoleGuard allow={["admin"]}>
                <ReportsPage />
              </RoleGuard>
            }
          />
        </Route>
      </Routes>
    </ConfigProvider>
  );
}
