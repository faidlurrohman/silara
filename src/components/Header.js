import { App, Avatar, Button, Dropdown } from "antd";
import {
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout } from "antd";
import { useAppDispatch } from "../hooks/useRedux";
import { logoutAction } from "../store/actions/session";
const { Header: HeaderAntd } = Layout;

export default function Header({ onSider, sider, onDrawer }) {
  const { modal } = App.useApp();
  const dispatch = useAppDispatch();

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
                // {
                //   key: "1",
                //   label: "Ubah Kata Sandi",
                // },
                {
                  key: "1",
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
    </HeaderAntd>
  );
}
