import { useEffect, useState } from "react";
import { Card, Col, Row, Spin, Statistic, Table, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { reportsApi, type ReportSummary } from "@/api/reports";
import { useConfig } from "@/store/ConfigContext";
import type { EquipmentType } from "@/types";

interface CountRow {
  label: string;
  count: number;
}

function CountCard({ title, rows }: { title: string; rows: CountRow[] }) {
  const { t } = useTranslation();
  return (
    <Card size="small" title={title}>
      <Table<CountRow>
        rowKey="label"
        size="small"
        showHeader={false}
        pagination={false}
        dataSource={rows}
        locale={{ emptyText: t("reports.empty") }}
        columns={[
          { dataIndex: "label" },
          { dataIndex: "count", align: "right", width: 80 },
        ]}
      />
    </Card>
  );
}

export function ReportsPage() {
  const { t } = useTranslation();
  const { ticketTypeByKey, assetTypeName } = useConfig();
  const [data, setData] = useState<ReportSummary | null>(null);

  useEffect(() => {
    let alive = true;
    reportsApi
      .summary()
      .then((d) => {
        if (alive) setData(d);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  if (!data) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <Spin />
      </div>
    );
  }

  const statusRows = (m: Record<string, number>): CountRow[] =>
    Object.entries(m).map(([k, count]) => ({ label: t(`tickets.status.${k}`), count }));
  const priorityRows = (m: Record<string, number>): CountRow[] =>
    Object.entries(m).map(([k, count]) => ({ label: t(`tickets.priority.${k}`), count }));
  const ticketTypeRows: CountRow[] = data.tickets.byType.map((x) => ({
    label: ticketTypeByKey(x.key)?.name ?? x.key,
    count: x.count,
  }));
  const assetStatusRows: CountRow[] = Object.entries(data.assets.byStatus).map(([k, count]) => ({
    label: t(`assets.status.${k}`, { defaultValue: k }),
    count,
  }));
  const assetTypeRows: CountRow[] = data.assets.byType.map((x) => ({
    label: assetTypeName(x.key as EquipmentType),
    count: x.count,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t("reports.title")}
      </Typography.Title>

      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title={t("reports.tickets")} value={data.tickets.total} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title={t("reports.assets")} value={data.assets.total} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title={t("reports.upcomingBookings")} value={data.bookings.upcoming} />
          </Card>
        </Col>
      </Row>

      <Typography.Title level={5} style={{ margin: 0 }}>
        {t("reports.tickets")}
      </Typography.Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <CountCard title={t("reports.byStatus")} rows={statusRows(data.tickets.byStatus)} />
        </Col>
        <Col xs={24} md={8}>
          <CountCard title={t("reports.byPriority")} rows={priorityRows(data.tickets.byPriority)} />
        </Col>
        <Col xs={24} md={8}>
          <CountCard title={t("reports.byType")} rows={ticketTypeRows} />
        </Col>
      </Row>

      <Typography.Title level={5} style={{ margin: 0 }}>
        {t("reports.assets")}
      </Typography.Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <CountCard title={t("reports.byStatus")} rows={assetStatusRows} />
        </Col>
        <Col xs={24} md={8}>
          <CountCard title={t("reports.byType")} rows={assetTypeRows} />
        </Col>
      </Row>
    </div>
  );
}
