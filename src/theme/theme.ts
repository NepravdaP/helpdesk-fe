import type { ThemeConfig } from "antd";
import { palette } from "./colors";

// Тема Ant Design на фирменной палитре «Минстрой».
export const theme: ThemeConfig = {
  token: {
    colorPrimary: palette.primary,
    colorLink: palette.accent,
    colorLinkHover: palette.primary,
    colorTextHeading: palette.ink,
    colorText: palette.text,
    colorBgLayout: palette.section,
    colorBorderSecondary: palette.panel,
    borderRadius: 8,
    fontSize: 14,
  },
  components: {
    Layout: {
      siderBg: palette.white,
      headerBg: palette.white,
      bodyBg: palette.section,
      headerHeight: 56,
    },
    Menu: {
      itemBg: "transparent",
      itemSelectedBg: palette.chip,
      itemSelectedColor: palette.accent,
      itemHoverColor: palette.accent,
    },
    Table: {
      headerBg: palette.section,
      headerColor: palette.ink,
      rowHoverBg: palette.chip,
    },
  },
};
