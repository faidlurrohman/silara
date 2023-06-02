import { Button, DatePicker, Input, InputNumber, Space } from "antd";
import {
	CheckCircleOutlined,
	ClusterOutlined,
	EditOutlined,
	SearchOutlined,
	StopOutlined,
} from "@ant-design/icons";
import { convertDate, viewDate } from "./date";
import { COLORS, DATE_FORMAT_VIEW } from "./constants";
import { dbDate } from "./date";
import { formatterNumber } from "./number";
const { RangePicker } = DatePicker;

export const searchColumn = (
	searchRef,
	key,
	labelHeader,
	stateFilter,
	useSort = false,
	stateSort,
	sortType = "string"
) => ({
	title: labelHeader,
	dataIndex: key,
	key: key,
	filterDropdown: ({
		setSelectedKeys,
		selectedKeys,
		confirm,
		clearFilters,
	}) => (
		<div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
			{sortType === "int" ? (
				<InputNumber
					ref={searchRef}
					placeholder={`Cari ${labelHeader}`}
					className="w-full"
					value={selectedKeys[0]}
					onChange={(e) => setSelectedKeys(e ? [e] : [])}
					onPressEnter={() => confirm()}
					style={{
						marginBottom: 8,
						display: "block",
					}}
				/>
			) : key.includes("date") ? (
				<div className="block">
					<RangePicker
						allowClear
						className="w-64 md:72"
						value={
							selectedKeys[0] && selectedKeys[0].map((i) => convertDate(i))
						}
						placeholder={["Tanggal Awal", "Tanggal Akhir"]}
						style={{ marginBottom: 8 }}
						format={DATE_FORMAT_VIEW}
						onChange={(e) =>
							setSelectedKeys(e ? [e.map((i) => dbDate(i))] : [])
						}
					/>
				</div>
			) : (
				<Input
					ref={searchRef}
					placeholder={`Cari ${labelHeader}`}
					value={selectedKeys[0]}
					onChange={(e) =>
						setSelectedKeys(e.target.value ? [e.target.value] : [])
					}
					onPressEnter={() => confirm()}
					style={{
						marginBottom: 8,
						display: "block",
					}}
				/>
			)}
			<Space>
				<Button
					type="primary"
					onClick={() => confirm()}
					icon={<SearchOutlined />}
					size="small"
				>
					Cari
				</Button>
				<Button onClick={() => clearFilters()} size="small">
					Hapus
				</Button>
			</Space>
		</div>
	),
	filterIcon: (filtered) => (
		<SearchOutlined style={{ color: filtered ? COLORS.primary : undefined }} />
	),
	filteredValue: stateFilter[key] || null,
	onFilterDropdownOpenChange: (visible) => {
		if (visible && !key.includes("date")) {
			setTimeout(() => searchRef.current?.select(), 100);
		}
	},
	render: (value) => {
		if (key.includes("date")) return viewDate(value);

		if (key.includes("amount")) return formatterNumber(value);

		return value;
	},
	// IF USING SORT
	...(useSort && {
		sorter: true,
		sortOrder: stateSort.columnKey === key ? stateSort.order : null,
	}),
});

export const activeColumn = (stateFilter) => ({
	title: "Aktif",
	dataIndex: "active",
	key: "active",
	width: 100,
	filters: [
		{ text: "Ya", value: true },
		{ text: "Tidak", value: false },
	],
	filteredValue: stateFilter.active || null,
	render: (value) => (value ? "Ya" : "Tidak"),
});

export const actionColumn = (
	onAddUpdate = null,
	onActiveChange = null,
	onAllocationChange = null
) => ({
	title: "#",
	key: "action",
	align: "center",
	width: 100,
	render: (value) => (
		<Space size="small">
			{onAddUpdate && (
				<Button
					size="small"
					disabled={!value?.active}
					icon={<EditOutlined />}
					style={{
						color: value?.active ? COLORS.primary : COLORS.disable,
						borderColor: value?.active ? COLORS.primary : COLORS.disable,
					}}
					onClick={() => onAddUpdate(true, value)}
				>
					Ubah
				</Button>
			)}
			{value?.use_allocation_button && (
				<Button
					size="small"
					disabled={!value?.active}
					icon={<ClusterOutlined />}
					style={{
						color: value?.active ? COLORS.secondary : COLORS.disable,
						borderColor: value?.active ? COLORS.secondary : COLORS.disable,
					}}
					onClick={() => onAllocationChange(true, value)}
				>
					Alokasi
				</Button>
			)}
			{onActiveChange && value?.role_id !== 1 && (
				<>
					<Button
						size="small"
						icon={value?.active ? <StopOutlined /> : <CheckCircleOutlined />}
						danger={value?.active}
						style={{
							color: value?.active ? COLORS.success : COLORS.danger,
							borderColor: value?.active ? COLORS.success : COLORS.danger,
						}}
						onClick={() => onActiveChange(value)}
					>
						{value?.active ? `Nonaktifkan` : `Aktifkan`}
					</Button>
				</>
			)}
		</Space>
	),
});
