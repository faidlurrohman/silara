import { Form, Input, Button } from "antd";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { loginAction } from "../../store/actions/session";

export default function Masuk() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(
    (state) => state.session.request_login?.loading
  );
  const errors = useAppSelector((state) => state.session.request_login?.errors);
  const [form] = Form.useForm();

  const handleSubmit = (params) => {
    console.log("params", params);
    dispatch(loginAction(params));
  };

  useEffect(() => {
    if (errors) {
      console.log("errors", errors);
    }
  }, [errors, form]);

  return (
    <section className="flex w-full h-screen place-items-center items-center flex-col">
      <div className="relative mx-6 my-auto md:m-auto w-full md:w-6/12 lg:w-3/12 rounded-md p-8 h-auto">
        <div className="mb-10 flex flex-col items-center">
          <img alt="Logo" className="w-40 mb-2" src="/img_tmp.jpg" />
          <h1 className="font-bold text-xl md:text-3xl mt-2">
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
            label="Nama Pengguna"
            name="username"
            rules={[{ required: true, message: "Nama Pengguna dibutuhkan" }]}
          >
            <Input size="large" allowClear />
          </Form.Item>

          <Form.Item
            label="Kata Sandi"
            name="password"
            rules={[{ required: true, message: "Kata Sandi dibutuhkan" }]}
          >
            <Input.Password size="large" allowClear />
          </Form.Item>
          <p className="text-right text-gray-500">
            <Link to="/auth/lupa-sandi">Lupa Kata Sandi</Link>
          </p>

          <Form.Item className="mt-8">
            <Button
              loading={loading}
              block
              shape="round"
              size="large"
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