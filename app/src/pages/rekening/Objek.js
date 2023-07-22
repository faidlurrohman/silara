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
	setAllocationAccount,
} from "../../services/account";
import { PAGINATION } from "../../helpers/constants";
import { messageAction, responseGet } from "../../helpers/response";
import { actionColumn, activeColumn, searchColumn } from "../../helpers/table";
import { getCityList } from "../../services/city";
import ReloadButton from "../../components/button/ReloadButton";
import AddButton from "../../components/button/AddButton";
import ExportButton from "../../components/button/ExportButton";
import axios from "axios";
import { useParams } from "react-router-dom";
import { checkParams } from "../../helpers/url";
import { lower } from "../../helpers/typo";

export default function Objek() {
	const { modal } = App.useApp();
	const [form] = Form.useForm();
	const { id } = useParams();

	const [accountObject, setAccountObject] = useState([]);
	const [accountType, setAccountType] = useState([]);
	const [cities, setCities] = useState([]);
	const [exports, setExports] = useState([]);
	const [loading, setLoading] = useState(false);

	const tableFilterInputRef = useRef(null);
	const [tableFiltered, setTableFiltered] = useState({});
	const [tableSorted, setTableSorted] = useState({});
	const [tablePage, setTablePage] = useState(PAGINATION);

	const [isShow, setShow] = useState(false);
	const [isEdit, setEdit] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const [isShowAllocation, setShowAllocation] = useState(false);
	const [selectedObject, setSelectedObject] = useState({});

	const getData = (params) => {
		setLoading(true);
		axios
			.all([
				getAccount("object", checkParams(params, id, "account_type_id")),
				getAccount("object", checkParams(params, id, "account_type_id", true)),
				getAccountList("type"),
				getCityList(),
			])
			.then(
				axios.spread((_objects, _export, _types, _cities) => {
					setLoading(false);
					setAccountObject(responseGet(_objects).data);
					setExports(responseGet(_export).data);
					setAccountType(_types?.data?.data || []);
					setCities(_cities?.data?.data || []);
					setTablePage({
						pagination: {
							...params.pagination,
							total: responseGet(_objects).total_count,
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
			setAccountObject([]);
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
				account_type_id: value?.account_type_id,
				label: value?.label,
				remark: value?.remark,
			});
		} else {
			form.resetFields();
			setEdit(false);

			if (id && accountType.find((i) => i?.id === Number(id))) {
				form.setFieldsValue({ account_type_id: Number(id) });
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
				setActiveAccount("object", value?.id).then(() => {
					messageAction(true);
					reloadTable();
				});
			},
		});
	};

	const onAllocationChange = (isShowAllocation = false, value = {}) => {
		setShowAllocation(isShowAllocation);

		if (isShowAllocation) {
			setSelectedObject(value);
			form.setFieldsValue({
				id: value?.id,
				allocation_cities: value?.allocation_cities || [],
			});
		} else {
			form.resetFields();
			setSelectedObject({});
		}
	};

	const handleAddAllocation = (values) => {
		setConfirmLoading(true);
		setAllocationAccount("object", values).then((response) => {
			setConfirmLoading(false);
			if (response?.data?.code === 0) {
				messageAction(true);
				onAllocationChange();
				reloadTable();
			}
		});
	};

	const handleAddUpdate = (values) => {
		setConfirmLoading(true);
		addAccount("object", values).then((response) => {
			setConfirmLoading(false);

			if (response?.data?.code === 0) {
				messageAction(isEdit);
				addUpdateRow();
				reloadTable();
			}
		});
	};

	const columns = [
		searchColumn(
			tableFilterInputRef,
			"account_type_label",
			"Jenis Rekening",
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
		actionColumn(addUpdateRow, onActiveChange, onAllocationChange),
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
						master={`account_object`}
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
				dataSource={accountObject}
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
				title={`${isEdit ? `Ubah` : `Tambah`} Data Rekening Objek`}
				onCancel={() => addUpdateRow()}
				footer={null}
			>
				<Divider />
				<Form
					form={form}
					name="action"
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
						label="Jenis Rekening"
						name="account_type_id"
						rules={[
							{
								required: true,
								message: "Jenis Rekening tidak boleh kosong!",
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
							options={accountType}
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
			<Modal
				style={{ margin: 10 }}
				centered
				open={isShowAllocation}
				title={`Alokasi - ${selectedObject?.account_object_label || ``}`}
				onCancel={() => onAllocationChange()}
				footer={null}
			>
				<Divider />
				<Form
					form={form}
					name="allocation"
					labelCol={{ span: 4 }}
					labelAlign="left"
					onFinish={handleAddAllocation}
					autoComplete="off"
					initialValues={{ id: "", allocation_cities: [] }}
				>
					<Form.Item name="id" hidden>
						<Input />
					</Form.Item>
					<Form.Item label="Kota" name="allocation_cities">
						<Select
							allowClear
							mode="multiple"
							showSearch
							optionFilterProp="children"
							filterOption={(input, option) =>
								(lower(option?.label) ?? "").includes(lower(input))
							}
							disabled={confirmLoading}
							loading={loading}
							options={cities}
						/>
					</Form.Item>
					<Divider />
					<Form.Item className="text-right mb-0">
						<Space direction="horizontal">
							<Button
								disabled={confirmLoading}
								onClick={() => onAllocationChange()}
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
