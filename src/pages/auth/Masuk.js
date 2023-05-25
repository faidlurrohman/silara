import { Form, Input, Button, Checkbox } from "antd";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { loginAction } from "../../store/actions/session";

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
      <div className="relative mx-6 my-auto md:m-auto md:w-6/12 lg:w-3/12 rounded-md p-8 h-auto">
        <div className="mb-10 flex flex-col items-center">
          <img alt="Logo" className="w-20 mb-2 md:w-40" src="/img_tmp.jpg" />
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
            rules={[
              { required: true, message: "Nama Pengguna tidak boleh kosong" },
            ]}
          >
            <Input size="large" allowClear />
          </Form.Item>

          <Form.Item
            label="Kata Sandi"
            name="password"
            rules={[
              { required: true, message: "Kata Sandi tidak boleh kosong" },
            ]}
          >
            <Input.Password size="large" allowClear />
          </Form.Item>
          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>Pengingat Saya</Checkbox>
          </Form.Item>
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
