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
		<section className="flex w-full h-screen place-items-center items-center flex-col">
			<div className="relative mx-0 my-auto rounded-md p-8 h-auto bg-main shadow-lg md:m-auto md:w-6/12 lg:w-3/12">
				<div className="flex flex-col items-center">
					<img alt="Logo" className="w-20 mb-2 md:w-28" src={logoPortal} />
					<h1 className="font-bold text-xl mt-2 text-white tracking-wider md:text-2xl">
						{process.env.REACT_APP_NAME}
					</h1>
				</div>
				<Form
					form={form}
					layout="vertical"
					name="basic"
					onFinish={handleSubmit}
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
					<Form.Item className="mt-8">
						<Button
							loading={loading}
							block
							shape="round"
							type="primary"
							htmlType="submit"
						>
							Masuk
						</Button>
					</Form.Item>
				</Form>
			</div>
		</section>
	);
}
