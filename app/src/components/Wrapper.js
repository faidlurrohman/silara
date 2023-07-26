import { useEffect, useState } from "react";
import { Breadcrumb, Drawer, Layout, Menu } from "antd";
import HeaderComponent from "./Header";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Copyright from "./Copyright";
import { COLORS, MENU_ITEM, MENU_NAVIGATION } from "../helpers/constants";
import useRole from "../hooks/useRole";
import { CloseOutlined } from "@ant-design/icons";
import _ from "lodash";

const { Content, Footer, Sider } = Layout;

const initLink = [
	{
		title: (
			<Link to="/" style={{ color: COLORS.main }}>
				Beranda
			</Link>
		),
		key: "beranda",
	},
];

export default function Wrapper({ children }) {
	const { role_id } = useRole();
	const location = useLocation();
	const [drawer, setDrawer] = useState(false);
	const [openKeys, setOpenKeys] = useState([]);
	const [currentMenu, setCurrentMenu] = useState([]);
	const [navLink, setNavLink] = useState(initLink);
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

			if (current?.pathname.includes("rekening")) setCurrentMenu(`/${spl[1]}`);
			else setCurrentMenu(current?.pathname);
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

		const pathSnippets = location.pathname.split("/").filter((i) => i);

		if (!!pathSnippets.length) {
			if (pathSnippets[0] === "rekening") {
				const trg = {
					rekening: ["rekening"],
					kelompok: ["rekening", "kelompok"],
					jenis: ["rekening", "kelompok", "jenis"],
					objek: ["rekening", "kelompok", "jenis", "objek"],
				};

				const ltrg = {
					rekening: "rekening",
					kelompok: "/rekening/kelompok",
					jenis: "/rekening/jenis",
					objek: "/rekening/objek",
				};

				const ftrg = [];

				_.map(trg[pathSnippets[1] || pathSnippets[0]], (path) => {
					if (MENU_NAVIGATION[path]) {
						ftrg.push({
							key: path,
							title: (
								<Link to={ltrg[path]} style={{ color: COLORS.main }}>
									{MENU_NAVIGATION[path]}
								</Link>
							),
						});
					}
				});

				setNavLink(initLink.concat(ftrg));
			} else {
				_.map(pathSnippets, (_, index) => {
					const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;

					if (MENU_NAVIGATION[url]) {
						setNavLink([
							...initLink,
							{
								key: url,
								title: (
									<Link to={url} style={{ color: COLORS.main }}>
										{MENU_NAVIGATION[url]}
									</Link>
								),
							},
						]);
					}
				});
			}
		} else {
			setNavLink(initLink);
		}
	}, [location]);

	const items = _.map(
		MENU_ITEM.filter((i) => i.roles.includes(role_id)),
		(nest) => {
			if (nest?.children) {
				nest = {
					...nest,
					children: nest?.children
						.filter((j) => j.roles.includes(role_id))
						.map((k) => ({
							...k,
							onClick: () => navigating(k?.nav),
						})),
				};
			} else {
				nest = { ...nest, onClick: () => navigating(nest?.nav) };
			}

			return nest;
		}
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
				<Breadcrumb items={navLink} className="px-4 pt-3" />
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
