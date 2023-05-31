import {
	App,
	Button,
	Divider,
	Form,
	Input,
	Modal,
	Select,
	Space,
	Table,
} from "antd";
import { useEffect, useRef, useState } from "react";
import {
	addAccount,
	getAccount,
	getAccountList,
	setActiveAccount,
} from "../../services/account";
import { PAGINATION } from "../../helpers/constants";
import { actionColumn, activeColumn, searchColumn } from "../../helpers/table";
import ReloadButton from "../../components/button/ReloadButton";
import AddButton from "../../components/button/AddButton";
import ExportButton from "../../components/button/ExportButton";
import { messageAction, responseGet } from "../../helpers/response";
import axios from "axios";

export default function RekeningKelompok() {
	const { message, modal } = App.useApp();
	const [form] = Form.useForm();

	const searchInput = useRef(null);

	const [filtered, setFiltered] = useState({});
	const [sorted, setSorted] = useState({});
	const [tableParams, setTableParams] = useState(PAGINATION);

	const [isShow, setShow] = useState(false);
	const [isEdit, setEdit] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const [accountGroup, setAccountGroup] = useState([]);
	const [accountBase, setAccountBase] = useState([]);
	const [loading, setLoading] = useState(false);

	const reloadData = () => {
		setLoading(true);
		axios.all([getAccount("group", tableParams), getAccountList("base")]).then(
			axios.spread((_groups, _bases) => {
				setLoading(false);
				setAccountGroup(responseGet(_groups).data);
				setTableParams({
					...tableParams,
					pagination: {
						...tableParams.pagination,
						total: responseGet(_groups).total_count,
					},
				});
				setAccountBase(_bases?.data?.data);
			})
		);
	};

	const onTableChange = (pagination, filters, sorter) => {
		setFiltered(filters);
		setSorted(sorter);

		setTableParams({
			pagination,
			filters,
			...sorter,
		});

		// `dataSource` is useless since `pageSize` changed
		if (pagination.pageSize !== tableParams.pagination?.pageSize) {
			setAccountGroup([]);
		}
	};

	const reloadTable = () => {
		setFiltered({});
		setSorted({});
		setTableParams(PAGINATION);
	};

	const addUpdateRow = (isEdit = false, value = null) => {
		setShow(!isShow);

		if (!isEdit) {
			form.resetFields();
			setEdit(false);
		} else {
			setEdit(true);
			form.setFieldsValue({
				id: value?.id,
				account_base_id: value?.account_base_id,
				label: value?.label,
				remark: value?.remark,
			});
		}
	};

	const onActiveChange = (value) => {
		modal.confirm({
			title: `${value?.active ? `Nonaktifkan` : `Aktifkan`} data :`,
			content: (
				<>
					({value?.label}) {value?.remark}
				</>
			),
			okText: "Ya",
			cancelText: "Tidak",
			centered: true,
			onOk() {
				setActiveAccount("group", value?.id).then(() => {
					message.success(messageAction(true));
					reloadTable();
				});
			},
		});
	};

	const handleAddUpdate = (values) => {
		setConfirmLoading(true);
		addAccount("group", values).then((response) => {
			setConfirmLoading(false);

			if (response?.data?.code === 0) {
				message.success(messageAction(isEdit));
				addUpdateRow(isEdit);
				reloadTable();
			}
		});
	};

	const columns = [
		searchColumn(
			searchInput,
			"account_base_label",
			"Akun Rekening",
			filtered,
			true,
			sorted
		),
		searchColumn(searchInput, "label", "Label", filtered, true, sorted),
		searchColumn(searchInput, "remark", "Keterangan", filtered, true, sorted),
		activeColumn(filtered),
		actionColumn(addUpdateRow, onActiveChange),
	];

	useEffect(() => {
		reloadData();
	}, [JSON.stringify(tableParams)]);

	return (
		<>
			<div className="flex flex-col space-y-2 sm:space-y-0 sm:space-x-2 sm:flex-row md:space-y-0 md:space-x-2 md:flex-row">
				<ReloadButton onClick={reloadTable} stateLoading={loading} />
				<AddButton onClick={addUpdateRow} stateLoading={loading} />
				{!!accountGroup?.length && (
					<ExportButton
						data={accountGroup}
						target={`account_group`}
						stateLoading={loading}
					/>
				)}
			</div>
			<div className="mt-4">
				<Table
					scroll={{
						scrollToFirstRowOnChange: true,
						x: "max-content",
					}}
					bordered
					loading={loading}
					dataSource={accountGroup}
					columns={columns}
					rowKey={(record) => record?.id}
					onChange={onTableChange}
					pagination={tableParams.pagination}
				/>
			</div>
			<Modal
				style={{ margin: 10 }}
				centered
				open={isShow}
				title={`${isEdit ? `Ubah` : `Tambah`} Data Rekening Kelompok`}
				onCancel={() => addUpdateRow(isEdit)}
				footer={null}
			>
				<Divider />
				<Form
					form={form}
					name="basic"
					labelCol={{ span: 8 }}
					labelAlign="left"
					onFinish={handleAddUpdate}
					autoComplete="off"
					initialValues={{ id: "" }}
				>
					<Form.Item name="id" hidden>
						<Input />
					</Form.Item>
					<Form.Item
						label="Akun Rekening"
						name="account_base_id"
						rules={[
							{
								required: true,
								message: "Akun Rekening tidak boleh kosong!",
							},
						]}
					>
						<Select
							showSearch
							optionFilterProp="children"
							filterOption={(input, option) =>
								(option?.label ?? "")
									.toLowerCase()
									.includes(input.toLowerCase())
							}
							disabled={confirmLoading}
							loading={loading}
							options={accountBase}
						/>
					</Form.Item>
					<Form.Item
						label="Label"
						name="label"
						rules={[
							{
								required: true,
								message: "Label tidak boleh kosong!",
							},
						]}
					>
						<Input disabled={confirmLoading} />
					</Form.Item>
					<Form.Item
						label="Keterangan"
						name="remark"
						rules={[
							{
								required: true,
								message: "Keterangan tidak boleh kosong!",
							},
						]}
					>
						<Input.TextArea
							autoSize={{ minRows: 2, maxRows: 6 }}
							disabled={confirmLoading}
						/>
					</Form.Item>
					<Divider />
					<Form.Item className="text-right mb-0">
						<Space direction="horizontal">
							<Button
								disabled={confirmLoading}
								onClick={() => addUpdateRow(isEdit)}
							>
								Kembali
							</Button>
							<Button loading={confirmLoading} htmlType="submit" type="primary">
								Simpan
							</Button>
						</Space>
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
}
