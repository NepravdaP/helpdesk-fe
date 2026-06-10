import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  AppstoreOutlined,
  DesktopOutlined,
  OrderedListOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import {
  useConfig,
  type ServiceConfig,
  type TicketTypeConfig,
  type AssetAttributeConfig,
  type AssetTypeConfig,
  type PositionWeight,
} from "@/store/ConfigContext";
import { palette } from "@/theme/colors";
import type { TicketGroup, TicketPriority } from "@/types";

const PRIORITIES: TicketPriority[] = ["low", "medium", "high"];
const GROUPS: TicketGroup[] = ["helpdesk", "network", "print", "software"];

type Nav =
  | { level: "home" }
  | { level: "services" }
  | { level: "service"; serviceKey: string }
  | { level: "assetTypes" }
  | { level: "assetType"; typeKey: string }
  | { level: "weights" };

export function ConfigPage() {
  const { t } = useTranslation();
  const config = useConfig();
  const location = useLocation();
  const [nav, setNav] = useState<Nav>({ level: "home" });

  // Повторный клик по «Конфигурация» в меню возвращает на главную (и закрывает drill-down/модалки).
  useEffect(() => {
    setNav({ level: "home" });
  }, [location.key]);

  const service =
    nav.level === "service" ? config.services.find((s) => s.key === nav.serviceKey) ?? null : null;
  const assetType =
    nav.level === "assetType" ? config.assetTypes.find((a) => a.key === nav.typeKey) ?? null : null;

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <div>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t("nav.config")}
        </Typography.Title>
        <Typography.Text type="secondary">{t("config.subtitle")}</Typography.Text>
      </div>

      {nav.level !== "home" && (
        <Breadcrumb
          items={[
            { title: <a onClick={() => setNav({ level: "home" })}>{t("nav.config")}</a> },
            ...(nav.level === "services" || nav.level === "service"
              ? [{ title: <a onClick={() => setNav({ level: "services" })}>{t("config.services.title")}</a> }]
              : []),
            ...(nav.level === "service" && service ? [{ title: service.name }] : []),
            ...(nav.level === "assetTypes" || nav.level === "assetType"
              ? [{ title: <a onClick={() => setNav({ level: "assetTypes" })}>{t("config.assetTypes.title")}</a> }]
              : []),
            ...(nav.level === "assetType" && assetType ? [{ title: assetType.name }] : []),
            ...(nav.level === "weights" ? [{ title: t("config.weights.title") }] : []),
          ]}
        />
      )}

      {nav.level === "home" && <Home onOpen={setNav} />}
      {nav.level === "services" && <ServicesList onOpen={(serviceKey) => setNav({ level: "service", serviceKey })} />}
      {nav.level === "service" && service && <ServiceDetail service={service} />}
      {nav.level === "assetTypes" && (
        <AssetTypesList onOpen={(typeKey) => setNav({ level: "assetType", typeKey })} />
      )}
      {nav.level === "assetType" && assetType && <AssetTypeDetail assetType={assetType} />}
      {nav.level === "weights" && <WeightsList />}
    </Space>
  );
}

// ——— Главная: плитки ———
function Home({ onOpen }: { onOpen: (n: Nav) => void }) {
  const { t } = useTranslation();
  const { services, assetTypes, weights } = useConfig();
  const tiles = [
    { nav: { level: "services" } as Nav, key: "services", icon: <AppstoreOutlined />, count: t("config.itemsCount", { count: services.length }) },
    { nav: { level: "assetTypes" } as Nav, key: "assetTypes", icon: <DesktopOutlined />, count: t("config.itemsCount", { count: assetTypes.length }) },
    { nav: { level: "weights" } as Nav, key: "weights", icon: <OrderedListOutlined />, count: t("config.itemsCount", { count: weights.length }) },
  ];
  return (
    <Row gutter={[16, 16]}>
      {tiles.map((tile) => (
        <Col key={tile.key} xs={24} sm={12} lg={8}>
          <Card hoverable onClick={() => onOpen(tile.nav)} style={{ height: "100%" }}>
            <Space align="start" size={16}>
              <div
                style={{
                  fontSize: 22,
                  color: palette.primary,
                  background: palette.section,
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {tile.icon}
              </div>
              <div>
                <Typography.Text strong>{t(`config.${tile.key}.title`)}</Typography.Text>
                <Typography.Paragraph type="secondary" style={{ margin: "4px 0 8px", fontSize: 13 }}>
                  {t(`config.${tile.key}.desc`)}
                </Typography.Paragraph>
                <Tag>{tile.count}</Tag>
              </div>
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

// ——— Список сервисов ———
function ServicesList({ onOpen }: { onOpen: (serviceKey: string) => void }) {
  const { t } = useTranslation();
  const { services, setServices } = useConfig();
  const [editing, setEditing] = useState<ServiceConfig | null>(null);
  const [open, setOpen] = useState(false);

  const save = (name: string) => {
    if (editing) setServices(services.map((s) => (s.key === editing.key ? { ...s, name } : s)));
    else setServices([...services, { key: `svc_${Date.now()}`, name, ticketTypes: [] }]);
    setOpen(false);
  };

  return (
    <Card>
      <List
        dataSource={services}
        locale={{ emptyText: <Empty description="—" /> }}
        renderItem={(s) => (
          <List.Item
            style={{ cursor: "pointer" }}
            onClick={() => onOpen(s.key)}
            actions={[
              <Button
                key="e"
                type="text"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(s);
                  setOpen(true);
                }}
              />,
              <Popconfirm
                key="d"
                title={t("config.deleteConfirm")}
                okButtonProps={{ danger: true }}
                onConfirm={() => setServices(services.filter((x) => x.key !== s.key))}
              >
                <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
              </Popconfirm>,
              <RightOutlined key="r" style={{ color: "#bbb" }} />,
            ]}
          >
            <List.Item.Meta title={s.name} description={t("config.typesCount", { count: s.ticketTypes.length })} />
          </List.Item>
        )}
      />
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        block
        style={{ marginTop: 12 }}
        onClick={() => {
          setEditing(null);
          setOpen(true);
        }}
      >
        {t("config.addService")}
      </Button>
      <NameModal
        open={open}
        title={editing ? t("config.editServiceTitle") : t("config.newService")}
        initial={editing?.name ?? ""}
        onClose={() => setOpen(false)}
        onSave={save}
      />
    </Card>
  );
}

// ——— Детали сервиса: его типы заявок ———
function ServiceDetail({ service }: { service: ServiceConfig }) {
  const { t } = useTranslation();
  const { services, setServices } = useConfig();
  const [editing, setEditing] = useState<TicketTypeConfig | null>(null);
  const [open, setOpen] = useState(false);

  const writeTypes = (types: TicketTypeConfig[]) =>
    setServices(services.map((s) => (s.key === service.key ? { ...s, ticketTypes: types } : s)));

  const save = (tt: TicketTypeConfig) => {
    if (editing) writeTypes(service.ticketTypes.map((x) => (x.key === editing.key ? tt : x)));
    else writeTypes([...service.ticketTypes, tt]);
    setOpen(false);
  };

  return (
    <Card title={service.name}>
      <List
        dataSource={service.ticketTypes}
        locale={{ emptyText: <Empty description="—" /> }}
        renderItem={(tt) => (
          <List.Item
            style={{ cursor: "pointer" }}
            onClick={() => {
              setEditing(tt);
              setOpen(true);
            }}
            actions={[
              <Popconfirm
                key="d"
                title={t("config.deleteConfirm")}
                okButtonProps={{ danger: true }}
                onConfirm={() => writeTypes(service.ticketTypes.filter((x) => x.key !== tt.key))}
              >
                <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              title={tt.name}
              description={
                <Space size={6} wrap>
                  <Tag>{t(`tickets.priority.${tt.priority}`)}</Tag>
                  <Tag>{t(`tickets.ticketGroup.${tt.group}`)}</Tag>
                  <Typography.Text type="secondary">
                    {t("config.fields.sla")}: {tt.slaHours}
                  </Typography.Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        block
        style={{ marginTop: 12 }}
        onClick={() => {
          setEditing(null);
          setOpen(true);
        }}
      >
        {t("config.addTicketType")}
      </Button>
      <TicketTypeModal open={open} editing={editing} onClose={() => setOpen(false)} onSave={save} />
    </Card>
  );
}

// ——— Список типов активов ———
function AssetTypesList({ onOpen }: { onOpen: (typeKey: string) => void }) {
  const { t } = useTranslation();
  const { assetTypes } = useConfig();
  return (
    <Card>
      <List
        dataSource={assetTypes}
        renderItem={(a) => (
          <List.Item
            style={{ cursor: "pointer" }}
            onClick={() => onOpen(a.key)}
            actions={[<RightOutlined key="r" style={{ color: "#bbb" }} />]}
          >
            <List.Item.Meta title={a.name} description={t("config.attrCount", { count: a.attributes.length })} />
          </List.Item>
        )}
      />
    </Card>
  );
}

// ——— Детали типа актива: имя + поля ———
function AssetTypeDetail({ assetType }: { assetType: AssetTypeConfig }) {
  const { t } = useTranslation();
  const { assetTypes, setAssetTypes } = useConfig();
  const [editing, setEditing] = useState<AssetAttributeConfig | null>(null);
  const [open, setOpen] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);

  const write = (patch: Partial<AssetTypeConfig>) =>
    setAssetTypes(assetTypes.map((a) => (a.key === assetType.key ? { ...a, ...patch } : a)));

  const saveAttr = (attr: AssetAttributeConfig) => {
    if (editing) write({ attributes: assetType.attributes.map((x) => (x.key === editing.key ? attr : x)) });
    else write({ attributes: [...assetType.attributes, attr] });
    setOpen(false);
  };

  return (
    <Card
      title={
        <Space>
          {assetType.name}
          <Button size="small" type="text" icon={<EditOutlined />} onClick={() => setNameOpen(true)} />
        </Space>
      }
    >
      <Typography.Text type="secondary">{t("config.fields.attributes")}</Typography.Text>
      <List
        dataSource={assetType.attributes}
        locale={{ emptyText: <Empty description="—" /> }}
        renderItem={(attr) => (
          <List.Item
            style={{ cursor: "pointer" }}
            onClick={() => {
              setEditing(attr);
              setOpen(true);
            }}
            actions={[
              <Popconfirm
                key="d"
                title={t("config.deleteConfirm")}
                okButtonProps={{ danger: true }}
                onConfirm={() => write({ attributes: assetType.attributes.filter((x) => x.key !== attr.key) })}
              >
                <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta title={attr.label} description={<Tag>{attr.key}</Tag>} />
          </List.Item>
        )}
      />
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        block
        style={{ marginTop: 12 }}
        onClick={() => {
          setEditing(null);
          setOpen(true);
        }}
      >
        {t("config.addAttribute")}
      </Button>

      <AttributeModal open={open} editing={editing} onClose={() => setOpen(false)} onSave={saveAttr} />
      <NameModal
        open={nameOpen}
        title={t("config.assetTypes.title")}
        initial={assetType.name}
        onClose={() => setNameOpen(false)}
        onSave={(name) => {
          write({ name });
          setNameOpen(false);
        }}
      />
    </Card>
  );
}

// ——— Должности и веса ———
function WeightsList() {
  const { t } = useTranslation();
  const { weights, setWeights } = useConfig();
  const [editing, setEditing] = useState<{ data: PositionWeight; index: number } | null>(null);
  const [open, setOpen] = useState(false);

  const save = (w: PositionWeight) => {
    if (editing) setWeights(weights.map((x, i) => (i === editing.index ? w : x)));
    else setWeights([...weights, w]);
    setOpen(false);
  };

  const sorted = [...weights]
    .map((w, index) => ({ w, index }))
    .sort((a, b) => b.w.weight - a.w.weight);

  return (
    <Card>
      <List
        dataSource={sorted}
        style={{ maxHeight: 520, overflow: "auto" }}
        renderItem={({ w, index }) => (
          <List.Item
            style={{ cursor: "pointer" }}
            onClick={() => {
              setEditing({ data: w, index });
              setOpen(true);
            }}
            actions={[
              <Popconfirm
                key="d"
                title={t("config.deleteConfirm")}
                okButtonProps={{ danger: true }}
                onConfirm={() => setWeights(weights.filter((_, i) => i !== index))}
              >
                <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta title={w.title} />
            <Tag>{w.weight}</Tag>
          </List.Item>
        )}
      />
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        block
        style={{ marginTop: 12 }}
        onClick={() => {
          setEditing(null);
          setOpen(true);
        }}
      >
        {t("config.addWeight")}
      </Button>
      <WeightModal open={open} editing={editing?.data ?? null} onClose={() => setOpen(false)} onSave={save} />
    </Card>
  );
}

// ——— Маленькие модальные формы одного элемента ———
function NameModal({
  open,
  title,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  title: string;
  initial: string;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  return (
    <Modal
      open={open}
      title={title}
      centered
      destroyOnClose
      onCancel={onClose}
      okText={t("common.save")}
      cancelText={t("common.cancel")}
      afterOpenChange={(o) => o && form.setFieldsValue({ name: initial })}
      onOk={() => form.submit()}
    >
      <Form form={form} layout="vertical" onFinish={(v) => onSave((v.name as string).trim())}>
        <Form.Item name="name" label={t("config.fields.name")} rules={[{ required: true, message: t("assets.form.required") }]}>
          <Input maxLength={120} autoFocus />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function TicketTypeModal({
  open,
  editing,
  onClose,
  onSave,
}: {
  open: boolean;
  editing: TicketTypeConfig | null;
  onClose: () => void;
  onSave: (tt: TicketTypeConfig) => void;
}) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  return (
    <Modal
      open={open}
      title={editing ? t("config.editTicketType") : t("config.newTicketType")}
      centered
      destroyOnClose
      onCancel={onClose}
      okText={t("common.save")}
      cancelText={t("common.cancel")}
      afterOpenChange={(o) =>
        o && form.setFieldsValue(editing ?? { priority: "medium", group: "helpdesk", slaHours: 24 })
      }
      onOk={() => form.submit()}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(v) =>
          onSave({
            key: editing?.key ?? `tt_${Date.now()}`,
            name: (v.name as string).trim(),
            priority: v.priority,
            group: v.group,
            slaHours: v.slaHours,
          })
        }
      >
        <Form.Item name="name" label={t("config.fields.name")} rules={[{ required: true, message: t("assets.form.required") }]}>
          <Input maxLength={120} />
        </Form.Item>
        <Form.Item name="priority" label={t("config.fields.priority")} rules={[{ required: true }]}>
          <Select options={PRIORITIES.map((p) => ({ value: p, label: t(`tickets.priority.${p}`) }))} />
        </Form.Item>
        <Form.Item name="group" label={t("config.fields.group")} rules={[{ required: true }]}>
          <Select options={GROUPS.map((g) => ({ value: g, label: t(`tickets.ticketGroup.${g}`) }))} />
        </Form.Item>
        <Form.Item name="slaHours" label={t("config.fields.sla")} rules={[{ required: true }]}>
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function AttributeModal({
  open,
  editing,
  onClose,
  onSave,
}: {
  open: boolean;
  editing: AssetAttributeConfig | null;
  onClose: () => void;
  onSave: (attr: AssetAttributeConfig) => void;
}) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  return (
    <Modal
      open={open}
      title={editing ? t("config.editAttribute") : t("config.newAttribute")}
      centered
      destroyOnClose
      onCancel={onClose}
      okText={t("common.save")}
      cancelText={t("common.cancel")}
      afterOpenChange={(o) => o && form.setFieldsValue(editing ?? { key: "", label: "" })}
      onOk={() => form.submit()}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(v) =>
          onSave({
            key: editing?.key ?? ((v.key as string).trim() || `attr_${Date.now()}`),
            label: (v.label as string).trim(),
          })
        }
      >
        <Form.Item name="key" label={t("config.fields.key")} rules={[{ required: true, message: t("assets.form.required") }]}>
          <Input disabled={!!editing} maxLength={40} placeholder="ipAddress" />
        </Form.Item>
        <Form.Item name="label" label={t("config.fields.label")} rules={[{ required: true, message: t("assets.form.required") }]}>
          <Input maxLength={60} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function WeightModal({
  open,
  editing,
  onClose,
  onSave,
}: {
  open: boolean;
  editing: PositionWeight | null;
  onClose: () => void;
  onSave: (w: PositionWeight) => void;
}) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  return (
    <Modal
      open={open}
      title={editing ? t("config.editWeight") : t("config.newWeight")}
      centered
      destroyOnClose
      onCancel={onClose}
      okText={t("common.save")}
      cancelText={t("common.cancel")}
      afterOpenChange={(o) => o && form.setFieldsValue(editing ?? { title: "", weight: 0 })}
      onOk={() => form.submit()}
    >
      <Form form={form} layout="vertical" onFinish={(v) => onSave({ title: (v.title as string).trim(), weight: v.weight })}>
        <Form.Item name="title" label={t("config.fields.position")} rules={[{ required: true, message: t("assets.form.required") }]}>
          <Input maxLength={120} />
        </Form.Item>
        <Form.Item name="weight" label={t("config.fields.weight")} rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
