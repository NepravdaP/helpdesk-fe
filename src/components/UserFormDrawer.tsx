import { useMemo } from "react";
import { Alert, Button, Drawer, Form, Input, Select, Switch } from "antd";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/auth/AuthContext";
import { can } from "@/auth/permissions";
import type { Role, User } from "@/types";

const ROLES: Role[] = ["employee", "it", "admin", "superadmin"];

export function UserFormDrawer({
  open,
  user,
  onClose,
  onSave,
}: {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (user: User) => void;
}) {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const canAssignBooking = can(currentUser.role, "booking.assignManagers");
  const [form] = Form.useForm();

  const initialValues = useMemo(() => user ?? {}, [user]);

  const close = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = (values: Record<string, unknown>) => {
    if (!user) return;
    const lastName = (values.lastName as string) ?? "";
    const firstName = (values.firstName as string) ?? "";
    const middleName = (values.middleName as string) ?? "";
    const fullName = [lastName, firstName, middleName].filter(Boolean).join(" ");
    onSave({
      ...user,
      firstName,
      lastName,
      middleName: middleName || undefined,
      fullName,
      role: values.role as Role,
      innerPhone: (values.innerPhone as string) || undefined,
      mobilePhone: (values.mobilePhone as string) || undefined,
      room: (values.room as string) || undefined,
      orgName: (values.orgName as string) || undefined,
      orgDepartment: (values.orgDepartment as string) || undefined,
      orgDivision: (values.orgDivision as string) || undefined,
      orgTitle: (values.orgTitle as string) || undefined,
      canManageBookings: canAssignBooking ? !!values.canManageBookings : user.canManageBookings,
    });
    close();
  };

  return (
    <Drawer
      title={t("userForm.title")}
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
        <Alert type="info" showIcon style={{ marginBottom: 16 }} message={t("userForm.adHint")} />

        <Form.Item label={t("userForm.login")}>
          <Input value={user?.userName} disabled />
        </Form.Item>
        <Form.Item label={t("userCard.email")}>
          <Input value={user?.email} disabled />
        </Form.Item>

        <Form.Item name="lastName" label={t("userForm.lastName")} rules={[{ required: true, message: t("assets.form.required") }]}>
          <Input maxLength={60} />
        </Form.Item>
        <Form.Item name="firstName" label={t("userForm.firstName")} rules={[{ required: true, message: t("assets.form.required") }]}>
          <Input maxLength={60} />
        </Form.Item>
        <Form.Item name="middleName" label={t("userForm.middleName")}>
          <Input maxLength={60} />
        </Form.Item>

        <Form.Item name="role" label={t("userCard.role")} rules={[{ required: true, message: t("assets.form.required") }]}>
          <Select options={ROLES.map((r) => ({ value: r, label: t(`roles.${r}`) }))} />
        </Form.Item>

        <Form.Item name="innerPhone" label={t("userCard.innerPhone")}>
          <Input maxLength={20} />
        </Form.Item>
        <Form.Item name="mobilePhone" label={t("userCard.mobilePhone")}>
          <Input maxLength={30} />
        </Form.Item>
        <Form.Item name="room" label={t("userCard.room")}>
          <Input maxLength={40} />
        </Form.Item>

        <Form.Item name="orgName" label={t("userCard.orgName")}>
          <Input maxLength={120} />
        </Form.Item>
        <Form.Item name="orgDivision" label={t("userCard.orgDivision")}>
          <Input maxLength={120} />
        </Form.Item>
        <Form.Item name="orgDepartment" label={t("userCard.orgDepartment")}>
          <Input maxLength={120} />
        </Form.Item>
        <Form.Item name="orgTitle" label={t("userCard.orgTitle")}>
          <Input maxLength={120} />
        </Form.Item>

        {canAssignBooking && (
          <Form.Item name="canManageBookings" label={t("userForm.bookingManager")} valuePropName="checked">
            <Switch />
          </Form.Item>
        )}
      </Form>
    </Drawer>
  );
}
