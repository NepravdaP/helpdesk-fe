import { Button, Segmented, Space, Tooltip } from "antd";
import { BulbFilled, BulbOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useThemeMode } from "@/theme/themeMode";

// Переключатели темы и языка — общие для шапки приложения и экрана входа.
export function ThemeLangControls() {
  const { t, i18n } = useTranslation();
  const { mode, toggle } = useThemeMode();
  const isDark = mode === "dark";
  const themeLabel = isDark ? t("common.themeLight") : t("common.themeDark");

  return (
    <Space size={12}>
      <Tooltip title={themeLabel}>
        <Button
          type="text"
          aria-label={themeLabel}
          icon={isDark ? <BulbFilled /> : <BulbOutlined />}
          onClick={toggle}
        />
      </Tooltip>
      <Segmented
        size="small"
        value={i18n.language.startsWith("en") ? "en" : "ru"}
        options={[
          { label: "RU", value: "ru" },
          { label: "EN", value: "en" },
        ]}
        onChange={(v) => i18n.changeLanguage(v as string)}
      />
    </Space>
  );
}
