import { Empty, Typography } from "antd";
import { useTranslation } from "react-i18next";

// Заглушки для разделов, которые рисуем следующими.
function Placeholder({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();
  return (
    <>
      <Typography.Title level={4}>{t(titleKey)}</Typography.Title>
      <Empty description={t("common.inDevelopment")} />
    </>
  );
}

export const BookingPage = () => <Placeholder titleKey="nav.booking" />;
export const ReportsPage = () => <Placeholder titleKey="nav.reports" />;
