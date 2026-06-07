import { createContext, useContext } from "react";
import type { ThemeMode } from "./theme";

// Контекст режима темы: текущий режим + переключатель.
// Значение задаётся в App, читается в шапке (кнопка) и в Layout (тема Sider/Menu).
export const ThemeModeContext = createContext<{
  mode: ThemeMode;
  toggle: () => void;
}>({
  mode: "light",
  toggle: () => {},
});

export const useThemeMode = () => useContext(ThemeModeContext);
