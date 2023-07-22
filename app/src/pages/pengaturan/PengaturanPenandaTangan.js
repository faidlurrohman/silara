import {
	App,
	Button,
	Divider,
	Form,
	Input,
	InputNumber,
	Modal,
	Space,
	Table,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { addSigner, getSigner, setActiveSigner } from "../../services/signer";
import { PAGINATION } from "../../helpers/constants";
import { actionColumn, activeColumn, searchColumn } from "../../helpers/table";
import ExportButton from "../../components/button/ExportButton";
import ReloadButton from "../../components/button/ReloadButton";
import AddButton from "../../components/button/AddButton";
import { messageAction, responseGet } from "../../helpers/response";
import axios from "axios";

export default function PengaturanPenandaTangan() {
	const { modal } = App.useApp();
	const [form] = Form.useForm();

	const [signer, setSigner] = useState([]);
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
				getSigner(params),
				getSigner({
					...params,
					pagination: { ...params.pagination, pageSize: 0 },
				}),
			])
			.then(
				axios.spread((_data, _export) => {
					setLoading(false);
					setSigner(responseGet(_data).data);
					setExports(responseGet(_export).data);
					setTablePage({
						pagination: {
							...params.pagination,
							total: responseGet(_data).total_count,
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
			setSigner([]);
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
				nip: value?.nip,
				fullname: value?.fullname,
				title: value?.title,
				position: value?.position,
			});
		} else {
			form.resetFields();
			setEdit(false);
		}
	};

	const onActiveChange = (value) => {
		modal.confirm({
			title: `${value?.active ? `Nonaktifkan` : `Aktifkan`} data :`,
			content: <>{value?.nip}</>,
			okText: "Ya",
			cancelText: "Tidak",
			centered: true,
			onOk() {
				setActiveSigner(value?.id).then(() => {
					messageAction(true);
					reloadTable();
				});
			},
		});
	};

	const handleAddUpdate = (values) => {
		setConfirmLoading(true);
		addSigner(values).then((response) => {
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
			"nip",
			"Nip",
			tableFiltered,
			true,
			tableSorted
		),
		searchColumn(
			tableFilterInputRef,
			"fullname",
			"Nama",
			tableFiltered,
			true,
			tableSorted
		),
		searchColumn(
			tableFilterInputRef,
			"title",
			"Jabatan",
			tableFiltered,
			true,
			tableSorted
		),
		searchColumn(
			tableFilterInputRef,
			"position",
			"Posisi",
			tableFiltered,
			true,
			tableSorted
		),
		activeColumn(tableFiltered),
		actionColumn(addUpdateRow, onActiveChange),
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
						master={`signer`}
						pdfOrientation="landscape"
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
				dataSource={signer}
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
				title={`${isEdit ? `Ubah` : `Tambah`} Data Penanda Tangan`}
				onCancel={() => addUpdateRow()}
				footer={null}
			>
				<Divider />
				<Form
					form={form}
					name="basic"
					labelCol={{ span: 6 }}
					labelAlign="left"
					onFinish={handleAddUpdate}
					autoComplete="off"
					initialValues={{ id: "" }}
				>
					<Form.Item name="id" hidden>
						<Input />
					</Form.Item>
					<Form.Item
						label="NIP"
						name="nip"
						rules={[
							{
								required: true,
								message: "NIP tidak boleh kosong!",
							},
						]}
					>
						<InputNumber className="w-full" disabled={confirmLoading} />
					</Form.Item>
					<Form.Item
						label="Nama"
						name="fullname"
						rules={[
							{
								required: true,
								message: "Nama tidak boleh kosong!",
							},
						]}
					>
						<Input disabled={confirmLoading} />
					</Form.Item>
					<Form.Item
						label="Jabatan"
						name="title"
						rules={[
							{
								required: true,
								message: "Jabatan tidak boleh kosong!",
							},
						]}
					>
						<Input disabled={confirmLoading} />
					</Form.Item>
					<Form.Item
						label="Posisi"
						name="position"
						rules={[
							{
								required: true,
								message: "Posisi tidak boleh kosong!",
							},
						]}
					>
						<Input disabled={confirmLoading} />
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
