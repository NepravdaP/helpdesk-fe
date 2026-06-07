import { theme as antdAlgorithms, type ThemeConfig } from "antd";
import { palette } from "./colors";

export type ThemeMode = "light" | "dark";

// Тема Ant Design как функция от режима.
// Светлый — фирменные светлые поверхности «Минстрой».
// Тёмный — тёмные фоны от darkAlgorithm; брендовый синий остаётся основным цветом.
export function getTheme(mode: ThemeMode): ThemeConfig {
  const isDark = mode === "dark";
  return {
    algorithm: isDark ? antdAlgorithms.darkAlgorithm : antdAlgorithms.defaultAlgorithm,
    token: {
      colorPrimary: palette.primary,
      borderRadius: 8,
      fontSize: 14,
      // Текст/ссылки/заголовки фиксируем только в светлой теме;
      // в тёмной их выводит алгоритм для нужного контраста.
      ...(isDark
        ? {}
        : {
            colorLink: palette.accent,
            colorLinkHover: palette.primary,
            colorTextHeading: palette.ink,
            colorText: palette.text,
            colorBorderSecondary: palette.panel,
          }),
    },
    components: {
      Layout: {
        headerHeight: 56,
        ...(isDark
          ? {}
          : {
              siderBg: palette.white,
              headerBg: palette.white,
              bodyBg: palette.section,
            }),
      },
      Menu: {
        itemBg: "transparent",
        ...(isDark
          ? {}
          : { itemSelectedBg: palette.chip, itemSelectedColor: palette.accent, itemHoverColor: palette.accent }),
      },
      Table: {
        ...(isDark ? {} : { headerBg: palette.section, headerColor: palette.ink, rowHoverBg: palette.chip }),
      },
    },
  };
}
