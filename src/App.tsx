import { useEffect, useMemo, useState } from "react";
import { ConfigProvider, App as AntApp } from "antd";
import type { Locale } from "antd/es/locale";
import ruRU from "antd/locale/ru_RU";
import enUS from "antd/locale/en_US";
import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { getTheme, type ThemeMode } from "@/theme/theme";
import { ThemeModeContext } from "@/theme/themeMode";
import { usePersistentState } from "@/hooks/usePersistentState";
import { ConfigProvider as AppConfigProvider } from "@/store/ConfigContext";
import { UsersProvider } from "@/store/UsersContext";
import { TicketsProvider } from "@/store/TicketsContext";
import { AssetsProvider } from "@/store/AssetsContext";
import { BookingProvider } from "@/store/BookingContext";
import { EntityCardsProvider } from "@/store/EntityCards";
import { AppLayout } from "@/components/AppLayout";
import { RoleGuard, HomeRedirect } from "@/components/RoleGuard";
import { RequireAuth } from "@/auth/RequireAuth";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { TicketsPage } from "@/pages/TicketsPage";
import { AssetsPage } from "@/pages/AssetsPage";
import { UsersPage } from "@/pages/UsersPage";
import { DirectoryPage } from "@/pages/DirectoryPage";
import { ConfigPage } from "@/pages/ConfigPage";
import { BookingPage } from "@/pages/BookingPage";
import { ReportsPage } from "@/pages/ReportsPage";

// Хранилища данных монтируются только после входа: им нужен пользователь (useAuth),
// а при выходе они размонтируются — данные одного пользователя не достаются следующему.
function DataProviders({ children }: { children: ReactNode }) {
  return (
    <AppConfigProvider>
      <UsersProvider>
        <TicketsProvider>
          <AssetsProvider>
            <BookingProvider>
              <EntityCardsProvider>{children}</EntityCardsProvider>
            </BookingProvider>
          </AssetsProvider>
        </TicketsProvider>
      </UsersProvider>
    </AppConfigProvider>
  );
}

// Локаль AntD держим синхронной с языком приложения (i18n).
const ANTD_LOCALES: Record<string, Locale> = { ru: ruRU, en: enUS };

export default function App() {
  const { i18n } = useTranslation();
  const [mode, setMode] = usePersistentState<ThemeMode>("theme.mode", "light");
  const [antdLocale, setAntdLocale] = useState<Locale>(
    ANTD_LOCALES[i18n.language.slice(0, 2)] ?? ruRU,
  );

  useEffect(() => {
    const onChange = (lng: string) =>
      setAntdLocale(ANTD_LOCALES[lng.slice(0, 2)] ?? ruRU);
    i18n.on("languageChanged", onChange);
    return () => i18n.off("languageChanged", onChange);
  }, [i18n]);

  const themeMode = useMemo(
    () => ({ mode, toggle: () => setMode((m) => (m === "dark" ? "light" : "dark")) }),
    [mode, setMode],
  );

  return (
    <ThemeModeContext.Provider value={themeMode}>
      <ConfigProvider theme={getTheme(mode)} locale={antdLocale}>
        <AntApp>
          <Routes>
            <Route path="login" element={<LoginPage />} />
            <Route
              element={
                <RequireAuth>
                  <DataProviders>
                    <AppLayout />
                  </DataProviders>
                </RequireAuth>
              }
            >
              <Route index element={<HomeRedirect />} />
              <Route
                path="dashboard"
                element={
                  <RoleGuard cap="dashboard.own">
                    <DashboardPage />
                  </RoleGuard>
                }
              />
              <Route
                path="helpdesk"
                element={
                  <RoleGuard cap="tickets.create">
                    <TicketsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="assets"
                element={
                  <RoleGuard cap="assets.view">
                    <AssetsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="booking"
                element={
                  <RoleGuard cap="booking.view">
                    <BookingPage />
                  </RoleGuard>
                }
              />
              <Route
                path="directory"
                element={
                  <RoleGuard cap="directory.view">
                    <DirectoryPage />
                  </RoleGuard>
                }
              />
              <Route
                path="users"
                element={
                  <RoleGuard cap="users.view">
                    <UsersPage />
                  </RoleGuard>
                }
              />
              <Route
                path="reports"
                element={
                  <RoleGuard cap="reports.view">
                    <ReportsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="config"
                element={
                  <RoleGuard cap="config.manage">
                    <ConfigPage />
                  </RoleGuard>
                }
              />
              <Route path="*" element={<HomeRedirect />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AntApp>
      </ConfigProvider>
    </ThemeModeContext.Provider>
  );
}
