import { Drawer, Layout, Menu } from "antd";
import { useEffect, useState } from "react";
import HeaderComponent from "./Header";
import { useLocation, useNavigate } from "react-router-dom";
import Copyright from "./Copyright";
import { COLORS, MENU_ITEM } from "../helpers/constants";
import useRole from "../hooks/useRole";
import { CloseOutlined } from "@ant-design/icons";

const { Content, Footer, Sider } = Layout;

export default function Wrapper({ children }) {
	const { role_id } = useRole();
	const location = useLocation();
	const [drawer, setDrawer] = useState(false);
	const [openKeys, setOpenKeys] = useState([]);
	const [currentMenu, setCurrentMenu] = useState([]);
	const navigate = useNavigate();

	const onOpenChange = (keys) => {
		const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);

		if (MENU_ITEM.map(({ key }) => key).indexOf(latestOpenKey) === -1) {
			setOpenKeys(keys);
		} else {
			setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
		}
	};

	const onMenuClick = (current) => {
		// trigger from location react router
		if (current?.pathname) {
			let spl = current?.pathname.split("/");

			if (spl.length > 2) {
				onOpenChange([`/${spl[1]}`]);
			} else {
				onOpenChange([]);
			}

			setCurrentMenu(current?.pathname);
		}
		// trigger from on click menu
		else {
			setCurrentMenu(current?.keyPath);
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

	useEffect(() => {
		onMenuClick(location);
	}, []);

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
				className="hidden lg:grid"
			>
				<div className="h-8 m-4 text-center">
					<h2 className="text-white tracking-wider">
						{process.env.REACT_APP_NAME}
					</h2>
				</div>
				<Menu
					mode="inline"
					className="font-medium menu-wide"
					selectedKeys={currentMenu}
					openKeys={openKeys}
					onOpenChange={onOpenChange}
					onClick={onMenuClick}
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
					selectedKeys={currentMenu}
					openKeys={openKeys}
					onOpenChange={onOpenChange}
					onClick={onMenuClick}
					items={items}
				/>
			</Drawer>
			<Layout>
				<HeaderComponent onDrawer={() => showDrawer()} />
				<Content className="p-2.5 m-2.5 bg-white min-h-fit rounded-md shadow-sm">
					{children}
				</Content>
				<Footer className="text-center m-0 p-4">
					<Copyright />
				</Footer>
			</Layout>
		</Layout>
	);
}
