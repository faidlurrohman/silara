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

export default function PengaturanPenandaTangan() {
	const { message, modal } = App.useApp();
	const [form] = Form.useForm();

	const searchInput = useRef(null);

	const [filtered, setFiltered] = useState({});
	const [sorted, setSorted] = useState({});
	const [tableParams, setTableParams] = useState(PAGINATION);

	const [isShow, setShow] = useState(false);
	const [isEdit, setEdit] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const [signer, setSigner] = useState([]);
	const [loading, setLoading] = useState(false);

	const reloadData = () => {
		setLoading(true);
		getSigner(tableParams).then((response) => {
			setLoading(false);
			setSigner(responseGet(response).data);
			setTableParams({
				...tableParams,
				pagination: {
					...tableParams.pagination,
					total: responseGet(response).total_count,
				},
			});
		});
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
			setSigner([]);
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
				nip: value?.nip,
				fullname: value?.fullname,
				title: value?.title,
			});
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
					message.success(messageAction(true));
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
				message.success(messageAction(isEdit));
				addUpdateRow(isEdit);
				reloadTable();
			}
		});
	};

	const columns = [
		searchColumn(searchInput, "nip", "Nip", filtered, true, sorted),
		searchColumn(searchInput, "fullname", "Nama", filtered, true, sorted),
		searchColumn(searchInput, "title", "Jabatan", filtered, true, sorted),
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
				{!!signer?.length && (
					<ExportButton
						data={signer}
						target={`signer`}
						stateLoading={loading}
					/>
				)}
			</div>
			<div className="mt-4">
				<Table
					scroll={{
						scrollToFirstRowOnChange: true,
						x: "100%",
					}}
					bordered
					loading={loading}
					dataSource={signer}
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
				title={`${isEdit ? `Ubah` : `Tambah`} Data Penanda Tangan`}
				onCancel={() => addUpdateRow(isEdit)}
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
