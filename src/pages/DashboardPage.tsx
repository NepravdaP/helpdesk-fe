import { Card, Col, Row, Statistic, Typography } from "antd";
import { useTranslation } from "react-i18next";

export function DashboardPage() {
  const { t } = useTranslation();
  return (
    <>
      <Typography.Title level={4}>{t("dashboard.title")}</Typography.Title>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title={t("dashboard.openTickets")} value={3} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title={t("dashboard.equipment")} value={128} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title={t("dashboard.bookingsToday")} value={5} />
          </Card>
        </Col>
      </Row>
    </>
  );
}
