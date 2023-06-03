import { Drawer, Layout, Menu } from "antd";
import { useState } from "react";
import HeaderComponent from "./Header";
import { useNavigate } from "react-router-dom";
import Copyright from "./Copyright";
import { COLORS, MENU_ITEM } from "../helpers/constants";
import useRole from "../hooks/useRole";
import { CloseOutlined } from "@ant-design/icons";

const { Content, Footer, Sider } = Layout;
const rootSubmenuKeys = ["1", "2", "3", "4", "5"];

export default function Wrapper({ children }) {
	const { role_id } = useRole();
	const [drawer, setDrawer] = useState(false);
	const [openKeys, setOpenKeys] = useState(["1"]);
	const navigate = useNavigate();

	const onOpenChange = (keys) => {
		const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
		if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
			setOpenKeys(keys);
		} else {
			setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
		}
	};

	const showDrawer = () => {
		setDrawer(true);
	};

	const onClose = () => {
		setDrawer(false);
	};

	const navigating = (route) => {
		if (drawer) {
			setDrawer(false);
		}

		navigate(route);
	};

	const items = MENU_ITEM.map(
		(item) =>
			item.roles.includes(role_id) &&
			(item?.children
				? {
						...item,
						children: item?.children.map((child) => ({
							...child,
							onClick: () => navigating(child?.nav),
						})),
				  }
				: { ...item, onClick: () => navigating(item?.nav) })
	);

	return (
		<Layout>
			<Sider
				style={{
					overflow: "auto",
					height: "100vh",
					position: "sticky",
					top: 0,
					left: 0,
				}}
				theme="light"
				width={280}
				trigger={null}
				className="hidden md:grid"
			>
				<div className="h-8 m-4 bg-gray-400" />
				<Menu
					mode="inline"
					className="font-medium menu-wide"
					defaultSelectedKeys={["1"]}
					openKeys={openKeys}
					onOpenChange={onOpenChange}
					items={items}
				/>
			</Sider>
			<Drawer
				title={<span className="text-white">{process.env.REACT_APP_NAME}</span>}
				closeIcon={<CloseOutlined style={{ color: COLORS.white }} />}
				placement={`left`}
				onClose={onClose}
				open={drawer}
				width={300}
				headerStyle={{ backgroundColor: COLORS.main }}
				bodyStyle={{ padding: 0, backgroundColor: COLORS.main }}
			>
				<Menu
					mode="inline"
					className="font-medium menu-wide"
					defaultSelectedKeys={["1"]}
					openKeys={openKeys}
					onOpenChange={onOpenChange}
					items={items}
				/>
			</Drawer>
			<Layout>
				<HeaderComponent onDrawer={() => showDrawer()} />
				<Content className="p-2.5 m-2.5 bg-white min-h-fit rounded-md">
					{children}
				</Content>
				<Footer className="text-center m-0 p-4">
					<Copyright />
				</Footer>
			</Layout>
		</Layout>
	);
}
