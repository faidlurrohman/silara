import { Form, Input, Button, Checkbox } from "antd";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { loginAction } from "../../store/actions/session";
import logoPortal from "../../assets/images/logo-portal-kepriprov.png";

export default function Masuk() {
	const dispatch = useAppDispatch();
	const loading = useAppSelector(
		(state) => state.session.request_login?.loading
	);
	const [form] = Form.useForm();

	const handleSubmit = (params) => {
		dispatch(loginAction(params));

		if (params?.remember) {
			localStorage.setItem("sk-u", params?.username || "");
			localStorage.setItem("sk-p", params?.password || "");
			localStorage.setItem("sk-c", params?.remember || false);
		} else {
			localStorage.setItem("sk-u", "");
			localStorage.setItem("sk-p", "");
			localStorage.setItem("sk-c", false);
		}
	};

	useEffect(() => {
		const remember = localStorage.getItem("sk-c");

		if (remember && remember === "true") {
			form.setFieldsValue({
				username: localStorage.getItem("sk-u"),
				password: localStorage.getItem("sk-p"),
				remember: true,
			});
		}
	}, []);

	return (
		<section className="flex flex-col w-full h-screen place-items-center items-center">
			<div className="relative w-full m-auto">
				<div className="flex flex-col items-center">
					<img alt="Logo" className="w-20 md:w-28" src={logoPortal} />
					<h1 className="font-black text-xl text-main tracking-wider">
						{process.env.REACT_APP_NAME}
					</h1>
				</div>
				<Form
					form={form}
					layout="vertical"
					onFinish={handleSubmit}
					className="bg-main px-4 pt-4 pb-1 rounded-lg shadow-lg m-4 md:m-auto lg:m-auto md:w-1/3 lg:w-1/4"
				>
					<Form.Item
						label={<span className="text-white">Nama Pengguna</span>}
						name="username"
						rules={[
							{ required: true, message: "Nama Pengguna tidak boleh kosong" },
						]}
					>
						<Input allowClear />
					</Form.Item>
					<Form.Item
						label={<span className="text-white">Kata Sandi</span>}
						name="password"
						rules={[
							{ required: true, message: "Kata Sandi tidak boleh kosong" },
						]}
					>
						<Input.Password allowClear />
					</Form.Item>
					<Form.Item name="remember" valuePropName="checked">
						<Checkbox className="checkbox-login">Pengingat Saya</Checkbox>
					</Form.Item>
					<Form.Item>
						<Button loading={loading} block type="primary" htmlType="submit">
							Masuk
						</Button>
					</Form.Item>
				</Form>
			</div>
		</section>
	);
}
