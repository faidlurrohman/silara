import { Avatar, Button, Dropdown, Modal, Tooltip } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  QuestionCircleFilled,
  UserOutlined,
} from "@ant-design/icons";
import { Layout } from "antd";
import { useAppDispatch } from "../hooks/useRedux";
import { logoutAction } from "../store/actions/session";
const { Header: HeaderAntd } = Layout;

const showConfirm = (dispatch) => {
  Modal.confirm({
    title: "Apakah anda yakin untuk keluar?",
    okText: "Ya",
    cancelText: "Tidak",
    centered: true,
    onOk() {
      dispatch(logoutAction());
    },
  });
};

export default function Header({ onCollapse, collapsed }) {
  const dispatch = useAppDispatch();

  return (
    <HeaderAntd
      className="bg-white px-2.5 sticky top-0 w-full shadow-sm"
      style={{ zIndex: 1 }}
    >
      <div className="flex justify-between">
        <div className="relative">
          <Tooltip title={`${collapsed ? `Show` : `Hide`} Menu`}>
            <Button
              type="text"
              shape="circle"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={onCollapse}
            />
          </Tooltip>
        </div>
        <div className="float-left">
          <Dropdown
            className="cursor-pointer"
            placement="bottomLeft"
            menu={{
              items: [
                {
                  key: "1",
                  label: "Ubah Kata Sandi",
                },
                {
                  key: "2",
                  label: "Keluar",
                  onClick: () => showConfirm(dispatch),
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
