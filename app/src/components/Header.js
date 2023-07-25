import {
	App,
	Avatar,
	Button,
	Divider,
	Dropdown,
	Form,
	Input,
	Modal,
	Space,
} from "antd";
import {
	LockOutlined,
	LoginOutlined,
	MenuOutlined,
	UserOutlined,
} from "@ant-design/icons";
import { Layout } from "antd";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { logoutAction } from "../store/actions/session";
import { useState } from "react";
import useRole from "../hooks/useRole";
import { updatePasswordUser } from "../services/user";
import { messageAction } from "../helpers/response";
import { COLORS } from "../helpers/constants";
import { upper } from "../helpers/typo";
const { Header: HeaderAntd } = Layout;

export default function Header({ onDrawer }) {
	const session = useAppSelector((state) => state.session.user);
	const { role_id } = useRole();
	const dispatch = useAppDispatch();
	const { modal } = App.useApp();
	const [form] = Form.useForm();
	const [isShow, setShow] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const showChangePassword = (_isShow = false) => {
		setShow(_isShow);
		if (_isShow) {
			form.setFieldsValue({
				username: session?.username,
			});
		} else {
			form.resetFields();
		}
	};

	const handleUpdatePassword = (values) => {
		setConfirmLoading(true);
		updatePasswordUser(values).then((response) => {
			setConfirmLoading(false);
			if (response?.data?.code === 0) {
				messageAction(true);
				showChangePassword(false);
			}
		});
	};

	const showConfirm = () => {
		modal.confirm({
			title: "Apakah anda yakin untuk keluar?",
			okText: "Ya",
			cancelText: "Tidak",
			centered: true,
			onOk() {
				dispatch(logoutAction());
			},
		});
	};

	return (
		<HeaderAntd
			className="bg-main px-2.5 sticky top-0 w-full"
			style={{ zIndex: 100 }}
		>
			<div className="flex justify-between">
				<div className="relative grid items-center lg:hidden">
					<Button
						type="text"
						shape="circle"
						icon={<MenuOutlined style={{ color: COLORS.white }} />}
						onClick={onDrawer}
					/>
				</div>
				<div className="flex-1 text-end">
					<Dropdown
						className="cursor-pointer"
						placement="bottomLeft"
						menu={{
							items: [
								{
									label: (
										<span>
											Hi,{" "}
											<span className="font-bold underline">
												{session?.username}
											</span>
											!
										</span>
									),
									key: "0",
									icon: <UserOutlined />,
								},
								{ type: "divider" },
								role_id !== 1 && {
									key: "1",
									label: "Ubah Kata Sandi",
									icon: <LockOutlined />,
									onClick: () => showChangePassword(true),
								},
								{
									key: "2",
									label: "Keluar",
									icon: <LoginOutlined />,
									onClick: () => showConfirm(),
								},
							],
						}}
						arrow={{
							pointAtCenter: true,
						}}
						trigger={["click"]}
					>
						<Avatar
							size="default"
							style={{
								backgroundColor: COLORS.secondary,
								color: COLORS.white,
							}}
						>
							{session?.username ? (
								upper(String(session?.username.charAt(0)))
							) : (
								<UserOutlined />
							)}
						</Avatar>
					</Dropdown>
				</div>
			</div>
			<Modal
				style={{ margin: 10 }}
				centered
				open={isShow}
				title={`Ubah kata sandi`}
				onCancel={() => showChangePassword(false)}
				footer={null}
			>
				<Divider />
				<Form
					form={form}
					name="password"
					labelCol={{ span: 11 }}
					labelAlign="left"
					onFinish={handleUpdatePassword}
					autoComplete="off"
					initialValues={{ username: "" }}
				>
					<Form.Item
						label="Nama Pengguna"
						name="username"
						rules={[
							{
								required: true,
								message: "Nama Pengguna tidak boleh kosong!",
							},
						]}
					>
						<Input
							disabled
							style={{ background: COLORS.white, color: COLORS.black }}
						/>
					</Form.Item>
					<Form.Item
						label="Kata Sandi Baru"
						name="new_password"
						rules={[
							{
								required: true,
								message: "Kata Sandi Baru tidak boleh kosong!",
							},
							() => ({
								validator(_, value) {
									if (value && value.length < 8)
										return Promise.reject("Kata Sandi Min 8 Huruf");

									return Promise.resolve();
								},
							}),
						]}
					>
						<Input.Password disabled={confirmLoading} />
					</Form.Item>
					<Form.Item
						label="Konfirmasi Kata Sandi Baru"
						name="new_password_confirmation"
						rules={[
							{
								required: true,
								message: "Konfirmasi Kata Sandi Baru tidak boleh kosong!",
							},
							({ getFieldValue }) => ({
								validator(_, value) {
									if (value && value !== getFieldValue("new_password"))
										return Promise.reject(
											"Konfirmasi Kata Sandi baru tidak sama"
										);

									return Promise.resolve();
								},
							}),
						]}
					>
						<Input.Password disabled={confirmLoading} />
					</Form.Item>
					<Divider />
					<Form.Item className="text-right mb-0">
						<Space direction="horizontal">
							<Button
								disabled={confirmLoading}
								onClick={() => showChangePassword(false)}
							>
								Kembali
							</Button>
							<Button loading={confirmLoading} htmlType="submit" type="primary">
								Simpan
							</Button>
						</Space>
					</Form.Item>
				</Form>
			</Modal>
		</HeaderAntd>
	);
}
