import { useMemo } from "react";
import { Button, DatePicker, Drawer, Form, Input, Select } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { MOCK_USERS } from "@/data/mock";
import { ASSET_TYPE_ATTRIBUTES } from "@/config/assetTypes";
import type { Equipment, EquipmentStatus, EquipmentType } from "@/types";

const TYPES: EquipmentType[] = ["workstation", "printer", "multimedia"];
const STATUSES: EquipmentStatus[] = ["in_use", "repair", "decommissioned"];

export function AssetFormDrawer({
  open,
  asset,
  onClose,
  onCreate,
  onUpdate,
}: {
  open: boolean;
  asset: Equipment | null; // null → создание, иначе редактирование
  onClose: () => void;
  onCreate: (asset: Omit<Equipment, "id">) => void;
  onUpdate: (asset: Equipment) => void;
}) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const selectedType = Form.useWatch("type", form) as EquipmentType | undefined;

  const initialValues = useMemo(
    () =>
      asset
        ? {
            ...asset,
            warrantyUntil: asset.warrantyUntil ? dayjs(asset.warrantyUntil) : null,
            attributes: asset.attributes ?? {},
          }
        : { status: "in_use" as EquipmentStatus, attributes: {} },
    [asset],
  );

  const close = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = (values: Record<string, unknown>) => {
    const type = values.type as EquipmentType;
    const rawAttrs = (values.attributes as Record<string, string>) ?? {};
    const attributes: Record<string, string> = {};
    for (const key of ASSET_TYPE_ATTRIBUTES[type]) {
      if (rawAttrs[key]) attributes[key] = rawAttrs[key];
    }
    const warranty = values.warrantyUntil as dayjs.Dayjs | null | undefined;
    const payload = {
      inventoryNo: values.inventoryNo as string,
      type,
      model: values.model as string,
      serialNumber: (values.serialNumber as string) ?? "",
      status: values.status as EquipmentStatus,
      location: (values.location as string) ?? "",
      warrantyUntil: warranty ? warranty.format("YYYY-MM-DD") : null,
      assignedToId: (values.assignedToId as number | undefined) ?? null,
      attributes,
    };
    if (asset) onUpdate({ ...payload, id: asset.id });
    else onCreate(payload);
    close();
  };

  return (
    <Drawer
      title={asset ? t("assets.form.edit") : t("assets.form.create")}
      width={480}
      open={open}
      onClose={close}
      destroyOnClose
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={close}>{t("common.cancel")}</Button>
          <Button type="primary" onClick={() => form.submit()}>
            {t("assets.form.submit")}
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" initialValues={initialValues} onFinish={handleSubmit}>
        <Form.Item name="type" label={t("assetCard.type")} rules={[{ required: true, message: t("assets.form.required") }]}>
          <Select
            placeholder={t("assets.form.typePlaceholder")}
            options={TYPES.map((tp) => ({ value: tp, label: t(`equipmentType.${tp}`) }))}
          />
        </Form.Item>

        <Form.Item name="model" label={t("assets.col.model")} rules={[{ required: true, message: t("assets.form.required") }]}>
          <Input maxLength={120} />
        </Form.Item>

        <Form.Item name="inventoryNo" label={t("assetCard.inventoryNo")} rules={[{ required: true, message: t("assets.form.required") }]}>
          <Input maxLength={40} />
        </Form.Item>

        <Form.Item name="serialNumber" label="S/N">
          <Input maxLength={60} />
        </Form.Item>

        <Form.Item name="status" label={t("assetCard.status")} rules={[{ required: true, message: t("assets.form.required") }]}>
          <Select
            placeholder={t("assets.form.statusPlaceholder")}
            options={STATUSES.map((s) => ({ value: s, label: t(`equipmentStatus.${s}`) }))}
          />
        </Form.Item>

        <Form.Item name="location" label={t("assetCard.location")}>
          <Input maxLength={80} />
        </Form.Item>

        <Form.Item name="warrantyUntil" label={t("assetCard.warranty")}>
          <DatePicker style={{ width: "100%" }} placeholder={t("assets.form.warrantyPlaceholder")} format="DD.MM.YYYY" />
        </Form.Item>

        <Form.Item name="assignedToId" label={t("assetCard.owner")}>
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder={t("assets.form.assigneePlaceholder")}
            options={MOCK_USERS}
          />
        </Form.Item>

        {/* Динамические поля по типу актива */}
        {selectedType &&
          ASSET_TYPE_ATTRIBUTES[selectedType].map((key) => (
            <Form.Item key={key} name={["attributes", key]} label={t(`assetAttr.${key}`)}>
              <Input maxLength={60} />
            </Form.Item>
          ))}
      </Form>
    </Drawer>
  );
}
