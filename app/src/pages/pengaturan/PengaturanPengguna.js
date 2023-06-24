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
import { getCityList } from "../../services/city";
import { getRoleList } from "../../services/role";
import { addUser, getUsers, setActiveUser } from "../../services/user";
import { PAGINATION, REGEX_USERNAME } from "../../helpers/constants";
import { actionColumn, activeColumn, searchColumn } from "../../helpers/table";
import ExportButton from "../../components/button/ExportButton";
import ReloadButton from "../../components/button/ReloadButton";
import AddButton from "../../components/button/AddButton";
import { messageAction, responseGet } from "../../helpers/response";
import axios from "axios";

export default function PengaturanPengguna() {
	const { message, modal } = App.useApp();
	const [form] = Form.useForm();

	const searchInput = useRef(null);

	const [filtered, setFiltered] = useState({});
	const [sorted, setSorted] = useState({});
	const [tableParams, setTableParams] = useState(PAGINATION);

	const [isShow, setShow] = useState(false);
	const [isEdit, setEdit] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const [users, setUsers] = useState([]);
	const [cities, setCities] = useState([]);
	const [roles, setRoles] = useState([]);
	const [exports, setExports] = useState([]);
	const [loading, setLoading] = useState(false);

	const reloadData = () => {
		setLoading(true);
		axios
			.all([
				getUsers(tableParams),
				getUsers({
					...tableParams,
					pagination: { ...tableParams.pagination, pageSize: 0 },
				}),
				getCityList(),
				getRoleList(),
			])
			.then(
				axios.spread((_users, _export, _cities, _roles) => {
					setLoading(false);
					setUsers(responseGet(_users).data);
					setExports(responseGet(_export).data);
					setTableParams({
						...tableParams,
						pagination: {
							...tableParams.pagination,
							total: responseGet(_users).total_count,
						},
					});
					setCities(_cities?.data?.data);
					setRoles(_roles?.data?.data);
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
			setUsers([]);
		}
	};

	const reloadTable = () => {
		setFiltered({});
		setSorted({});
		setTableParams(PAGINATION);
	};

	const addUpdateRow = (isEdit = false, value = null) => {
		setShow(!isShow);

		if (isEdit) {
			setEdit(true);

			form.setFieldsValue({
				id: value?.id,
				fullname: value?.fullname,
				username: value?.username,
				password: "",
				title: value?.title,
				role_id: value?.role_id,
				city_id: value?.city_id,
			});
		} else {
			form.resetFields();
			setEdit(false);
		}
	};

	const onActiveChange = (value) => {
		modal.confirm({
			title: `${value?.active ? `Nonaktifkan` : `Aktifkan`} data :`,
			content: <>{value?.username}</>,
			okText: "Ya",
			cancelText: "Tidak",
			centered: true,
			onOk() {
				setActiveUser(value?.id).then(() => {
					message.success(messageAction(true));
					reloadTable();
				});
			},
		});
	};

	const handleAddUpdate = (values) => {
		setConfirmLoading(true);
		addUser(values).then((response) => {
			setConfirmLoading(false);

			if (response?.data?.code === 0) {
				message.success(messageAction(isEdit));
				addUpdateRow();
				reloadTable();
			}
		});
	};

	const columns = [
		searchColumn(
			searchInput,
			"username",
			"Nama Pengguna",
			filtered,
			true,
			sorted
		),
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
				{!!exports?.length && (
					<ExportButton
						data={exports}
						master={`user`}
						pdfOrientation="landscape"
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
					dataSource={users}
					columns={columns}
					rowKey={(record) => record?.id}
					onChange={onTableChange}
					pagination={tableParams.pagination}
					tableLayout="auto"
				/>
			</div>
			<Modal
				style={{ margin: 10 }}
				centered
				open={isShow}
				title={`${isEdit ? `Ubah` : `Tambah`} Data Pengguna`}
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
						label="Nama Pengguna"
						name="username"
						rules={[
							{
								required: true,
								message: "Nama Pengguna tidak boleh kosong!",
							},
							() => ({
								validator(_, value) {
									const _validation = REGEX_USERNAME.exec(value);

									if (value && value.length < 6)
										return Promise.reject("Nama Pengguna Min 6 Huruf");

									if (!!_validation) return Promise.resolve();

									return Promise.reject("Nama Pengguna format tidak benar");
								},
							}),
						]}
					>
						<Input disabled={confirmLoading} />
					</Form.Item>
					<Form.Item
						label="Kata Sandi"
						name="password"
						rules={[
							{
								required: !isEdit,
								message: "Kata Sandi tidak boleh kosong!",
							},
							() => ({
								validator(_, value) {
									if (value && value.length < 8)
										return Promise.reject("Kata Sandi Min 8 Huruf");

									return Promise.resolve();
								},
							}),
						]}
					>
						<Input.Password disabled={confirmLoading} />
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
						label="Akses Pengguna"
						name="role_id"
						rules={[
							{
								required: true,
								message: "Akses Pengguna tidak boleh kosong!",
							},
						]}
					>
						<Select
							disabled={confirmLoading}
							loading={loading}
							options={roles}
						/>
					</Form.Item>
					<Form.Item
						label="Akses Kota"
						name="city_id"
						rules={[
							{
								required: true,
								message: "Akses Kota tidak boleh kosong!",
							},
						]}
					>
						<Select
							disabled={confirmLoading}
							loading={loading}
							options={cities}
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
