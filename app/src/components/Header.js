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
	MenuFoldOutlined,
	MenuOutlined,
	MenuUnfoldOutlined,
	UserOutlined,
} from "@ant-design/icons";
import { Layout } from "antd";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { logoutAction } from "../store/actions/session";
import { useState } from "react";
import useRole from "../hooks/useRole";
import { updatePasswordUser } from "../services/user";
import { messageAction } from "../helpers/response";
const { Header: HeaderAntd } = Layout;

export default function Header({ onSider, sider, onDrawer }) {
	const session = useAppSelector((state) => state.session.user);
	const { role_id } = useRole();
	const dispatch = useAppDispatch();
	const { message, modal } = App.useApp();
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
				message.success(messageAction(true));
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
			className="bg-white px-2.5 sticky top-0 w-full shadow-sm"
			style={{ zIndex: 11 }}
		>
			<div className="flex justify-between">
				<div className="relative hidden items-center md:grid">
					<Button
						type="text"
						shape="circle"
						icon={sider ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
						onClick={onSider}
					/>
				</div>
				<div className="relative grid items-center md:hidden">
					<Button
						type="text"
						shape="circle"
						icon={<MenuOutlined />}
						onClick={onDrawer}
					/>
				</div>
				<div className="float-left">
					<Dropdown
						className="cursor-pointer"
						placement="bottomLeft"
						menu={{
							items: [
								role_id !== 1 && {
									key: "1",
									label: "Ubah Kata Sandi",
									onClick: () => showChangePassword(true),
								},
								{
									key: "2",
									label: "Keluar",
									onClick: () => showConfirm(),
								},
							],
						}}
						arrow={{
							pointAtCenter: true,
						}}
					>
						<Avatar size="default" icon={<UserOutlined />} />
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
							readOnly
							style={{ background: "#FFF", color: "#000" }}
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
