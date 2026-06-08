import { App } from "antd";
import { useTranslation } from "react-i18next";

// Копирование e-mail в буфер обмена с уведомлением.
export function useCopyEmail() {
  const { message } = App.useApp();
  const { t } = useTranslation();
  return async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      message.success(t("common.copied"));
    } catch {
      message.error(t("common.copyFailed"));
    }
  };
}
