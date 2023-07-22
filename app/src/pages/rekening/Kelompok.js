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
import { useNavigate, useParams } from "react-router-dom";
import { checkParams } from "../../helpers/url";
import { lower } from "../../helpers/typo";

export default function Kelompok() {
	const { modal } = App.useApp();
	const [form] = Form.useForm();
	const navigate = useNavigate();
	const { id } = useParams();

	const [accountGroup, setAccountGroup] = useState([]);
	const [accountBase, setAccountBase] = useState([]);
	const [exports, setExports] = useState([]);
	const [loading, setLoading] = useState(false);

	const tableFilterInputRef = useRef(null);
	const [tableFiltered, setTableFiltered] = useState({});
	const [tableSorted, setTableSorted] = useState({});
	const [tablePage, setTablePage] = useState(PAGINATION);

	const [isShow, setShow] = useState(false);
	const [isEdit, setEdit] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const getData = (params) => {
		setLoading(true);
		axios
			.all([
				getAccount("group", checkParams(params, id, "account_base_id")),
				getAccount("group", checkParams(params, id, "account_base_id", true)),
				getAccountList("base"),
			])
			.then(
				axios.spread((_groups, _export, _bases) => {
					setLoading(false);
					setAccountGroup(responseGet(_groups).data);
					setExports(responseGet(_export).data);
					setAccountBase(_bases?.data?.data || []);
					setTablePage({
						pagination: {
							...params.pagination,
							total: responseGet(_groups).total_count,
						},
					});
				})
			);
	};

	const onTableChange = (pagination, filters, sorter) => {
		setTableFiltered(filters);
		setTableSorted(sorter);
		getData({ pagination, filters, ...sorter });

		// `dataSource` is useless since `pageSize` changed
		if (pagination.pageSize !== tablePage.pagination?.pageSize) {
			setAccountGroup([]);
		}
	};

	const reloadTable = () => {
		setTableFiltered({});
		setTableSorted({});
		getData(PAGINATION);
	};

	const addUpdateRow = (isEdit = false, value = null) => {
		setShow(!isShow);

		if (isEdit) {
			setEdit(true);
			form.setFieldsValue({
				id: value?.id,
				account_base_id: value?.account_base_id,
				label: value?.label,
				remark: value?.remark,
			});
		} else {
			form.resetFields();
			setEdit(false);

			if (id && accountBase.find((i) => i?.id === Number(id))) {
				form.setFieldsValue({ account_base_id: Number(id) });
			}
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
					messageAction(true);
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
				messageAction(isEdit);
				addUpdateRow();
				reloadTable();
			}
		});
	};

	const onNavigateDetail = (values) => {
		navigate(`/rekening/jenis/${values?.id}`);
	};

	const columns = [
		searchColumn(
			tableFilterInputRef,
			"account_base_label",
			"Akun Rekening",
			tableFiltered,
			true,
			tableSorted
		),
		searchColumn(
			tableFilterInputRef,
			"label",
			"Label",
			tableFiltered,
			true,
			tableSorted
		),
		searchColumn(
			tableFilterInputRef,
			"remark",
			"Keterangan",
			tableFiltered,
			true,
			tableSorted
		),
		activeColumn(tableFiltered),
		actionColumn(addUpdateRow, onActiveChange, null, onNavigateDetail),
	];

	useEffect(() => getData(PAGINATION), []);

	return (
		<>
			<div className="flex flex-col mb-2 space-y-2 sm:space-y-0 sm:space-x-2 sm:flex-row md:space-y-0 md:space-x-2 md:flex-row">
				<ReloadButton onClick={reloadTable} stateLoading={loading} />
				<AddButton onClick={addUpdateRow} stateLoading={loading} />
				{!!exports?.length && (
					<ExportButton
						data={exports}
						master={`account_group`}
						pdfOrientation={`landscape`}
					/>
				)}
			</div>
			<Table
				scroll={{
					scrollToFirstRowOnChange: true,
					x: "100%",
				}}
				bordered
				size="small"
				loading={loading}
				dataSource={accountGroup}
				columns={columns}
				rowKey={(record) => record?.id}
				onChange={onTableChange}
				pagination={tablePage.pagination}
				tableLayout="auto"
			/>
			<Modal
				style={{ margin: 10 }}
				centered
				open={isShow}
				title={`${isEdit ? `Ubah` : `Tambah`} Data Rekening Kelompok`}
				onCancel={() => addUpdateRow()}
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
								(lower(option?.label) ?? "").includes(lower(input))
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
							<Button disabled={confirmLoading} onClick={() => addUpdateRow()}>
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
