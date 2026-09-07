import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  TimePicker,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { type Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import { useBooking } from "@/store/BookingContext";
import { useUsers } from "@/store/UsersContext";
import { useAuth } from "@/auth/AuthContext";
import type { Booking } from "@/types";

interface FormValues {
  roomId: number;
  date: Dayjs;
  range: [Dayjs, Dayjs];
  purpose: string;
}

export function BookingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { users } = useUsers();
  const { rooms, bookings, createBooking, cancelBooking } = useBooking();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<FormValues>();

  const userName = useMemo(() => {
    const map = new Map(users.map((u) => [u.id, u.fullName]));
    return (id: number) => map.get(id) ?? `#${id}`;
  }, [users]);
  const roomName = useMemo(() => {
    const map = new Map(rooms.map((r) => [r.id, r.name]));
    return (id: number) => map.get(id) ?? `#${id}`;
  }, [rooms]);

  const sorted = useMemo(
    () => [...bookings].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [bookings],
  );

  const submit = async () => {
    const v = await form.validateFields();
    const mk = (time: Dayjs) =>
      v.date.hour(time.hour()).minute(time.minute()).second(0).millisecond(0);
    setSubmitting(true);
    const ok = await createBooking({
      roomId: v.roomId,
      startTime: mk(v.range[0]).toISOString(),
      endTime: mk(v.range[1]).toISOString(),
      purpose: v.purpose,
    });
    setSubmitting(false);
    if (ok) {
      setOpen(false);
      form.resetFields();
    }
  };

  const columns: ColumnsType<Booking> = [
    { title: t("booking.room"), dataIndex: "roomId", render: (id: number) => roomName(id) },
    {
      title: t("booking.date"),
      dataIndex: "startTime",
      render: (_: string, b) =>
        `${dayjs(b.startTime).format("DD.MM.YYYY")} · ${dayjs(b.startTime).format("HH:mm")}–${dayjs(b.endTime).format("HH:mm")}`,
    },
    { title: t("booking.organizer"), dataIndex: "userId", render: (id: number) => userName(id) },
    { title: t("booking.purpose"), dataIndex: "purpose" },
    {
      title: t("booking.status"),
      dataIndex: "status",
      render: (s: Booking["status"]) =>
        s === "confirmed" ? (
          <Tag color="green">{t("booking.confirmed")}</Tag>
        ) : (
          <Tag>{t("booking.cancelled")}</Tag>
        ),
    },
    {
      title: "",
      key: "actions",
      render: (_: unknown, b) => {
        const canCancel =
          b.status === "confirmed" && (b.userId === user.id || !!user.canManageBookings);
        return canCancel ? (
          <Button size="small" danger onClick={() => cancelBooking(b.id)}>
            {t("booking.cancel")}
          </Button>
        ) : null;
      },
    },
  ];

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <Row justify="space-between" align="middle">
        <Typography.Title level={3} style={{ margin: 0 }}>
          {t("booking.title")}
        </Typography.Title>
        <Button type="primary" onClick={() => setOpen(true)}>
          {t("booking.new")}
        </Button>
      </Row>

      <div>
        <Typography.Title level={5}>{t("booking.rooms")}</Typography.Title>
        <Row gutter={[16, 16]}>
          {rooms.map((r) => (
            <Col key={r.id} xs={24} sm={12} lg={8}>
              <Card size="small" title={r.name}>
                <Space direction="vertical" size={8}>
                  <Typography.Text type="secondary">
                    {t("booking.capacity")}: {r.capacity} {t("booking.people")}
                  </Typography.Text>
                  <Space wrap size={[4, 4]}>
                    {r.equipment.map((e) => (
                      <Tag key={e}>{e}</Tag>
                    ))}
                  </Space>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <div>
        <Typography.Title level={5}>{t("booking.upcoming")}</Typography.Title>
        <Table<Booking>
          rowKey="id"
          columns={columns}
          dataSource={sorted}
          pagination={{ pageSize: 8, hideOnSinglePage: true }}
          locale={{ emptyText: <Empty description={t("booking.noBookings")} /> }}
        />
      </div>

      <Modal
        title={t("booking.create")}
        open={open}
        onOk={submit}
        confirmLoading={submitting}
        onCancel={() => setOpen(false)}
        okText={t("booking.create")}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="roomId"
            label={t("booking.room")}
            rules={[{ required: true, message: t("booking.required") }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={rooms.map((r) => ({ value: r.id, label: r.name }))}
            />
          </Form.Item>
          <Form.Item
            name="date"
            label={t("booking.date")}
            rules={[{ required: true, message: t("booking.required") }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD.MM.YYYY" />
          </Form.Item>
          <Form.Item
            name="range"
            label={t("booking.time")}
            rules={[{ required: true, message: t("booking.required") }]}
            extra={t("booking.overlapHint")}
          >
            <TimePicker.RangePicker style={{ width: "100%" }} format="HH:mm" minuteStep={15} />
          </Form.Item>
          <Form.Item
            name="purpose"
            label={t("booking.purpose")}
            rules={[{ required: true, message: t("booking.required") }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
