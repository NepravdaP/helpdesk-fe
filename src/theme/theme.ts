import type { ThemeConfig } from "antd";

// Единая тема Ant Design. Здесь же — брендовый акцент системы.
export const theme: ThemeConfig = {
  token: {
    colorPrimary: "#185FA5",
    borderRadius: 8,
    fontSize: 14,
  },
  components: {
    Layout: {
      siderBg: "#f5f5f4",
      headerBg: "#ffffff",
      headerHeight: 56,
    },
    Menu: {
      itemBg: "transparent",
    },
  },
};
