import {
	App,
	Button,
	Divider,
	Form,
	Input,
	Modal,
	Space,
	Table,
	Upload,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { addCity, getCities, setActiveCity } from "../../services/city";
import { PAGINATION } from "../../helpers/constants";
import { actionColumn, activeColumn, searchColumn } from "../../helpers/table";
import ExportButton from "../../components/button/ExportButton";
import ReloadButton from "../../components/button/ReloadButton";
import AddButton from "../../components/button/AddButton";
import { messageAction, responseGet } from "../../helpers/response";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

export default function PengaturanKota() {
	const { modal } = App.useApp();
	const [form] = Form.useForm();

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

	const getData = (params) => {
		setLoading(true);
		axios
			.all([
				getCities(params),
				getCities({
					...params,
					pagination: { ...params.pagination, pageSize: 0 },
				}),
			])
			.then(
				axios.spread((_data, _export) => {
					setLoading(false);
					setCities(responseGet(_data).data);
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

	const reloadTable = () => {
		setTableFiltered({});
		setTableSorted({});
		getData(PAGINATION);
	};

	const onTableChange = (pagination, filters, sorter) => {
		setTableFiltered(filters);
		setTableSorted(sorter);
		getData({ pagination, filters, ...sorter });

		// `dataSource` is useless since `pageSize` changed
		if (pagination.pageSize !== tablePage.pagination?.pageSize) {
			setCities([]);
		}
	};

	const addUpdateRow = (isEdit = false, value = null) => {
		setShow(!isShow);

		if (isEdit) {
			setEdit(true);
			form.setFieldsValue({
				id: value?.id,
				label: value?.label,
				...(!["", null, undefined].includes(value?.logo) && {
					logo: [
						{
							name: value?.logo,
							url: `${process.env.REACT_APP_BASE_URL_API}/uploads/${value?.logo}`,
						},
					],
				}),
			});
		} else {
			form.resetFields();
			setEdit(false);
		}
	};

	const onActiveChange = (value) => {
		modal.confirm({
			title: `${value?.active ? `Nonaktifkan` : `Aktifkan`} data :`,
			content: <>{value?.label}</>,
			okText: "Ya",
			cancelText: "Tidak",
			centered: true,
			onOk() {
				setActiveCity(value?.id).then(() => {
					messageAction(true);
					reloadTable();
				});
			},
		});
	};

	const handleAddUpdate = async (values) => {
		setConfirmLoading(true);

		let customValues = {
			...values,
			logo:
				values?.logo && !!values?.logo.length ? values?.logo[0]?.name : null,
			blob:
				values?.logo && !!values?.logo.length
					? values?.logo[0]?.originFileObj
					: null,
		};

		addCity(customValues).then((response) => {
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
			"label",
			"Nama Kota",
			tableFiltered,
			true,
			tableSorted
		),
		searchColumn(
			tableFilterInputRef,
			"logo",
			"Logo",
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
				{!!exports?.length && <ExportButton data={exports} master={`city`} />}
			</div>
			<Table
				scroll={{
					scrollToFirstRowOnChange: true,
					x: "100%",
				}}
				bordered
				size="small"
				loading={loading}
				dataSource={cities}
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
				title={`${isEdit ? `Ubah` : `Tambah`} Data Kota`}
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
					initialValues={{ id: "", logo: [] }}
				>
					<Form.Item name="id" hidden>
						<Input />
					</Form.Item>
					<Form.Item
						label="Nama Kota"
						name="label"
						rules={[
							{
								required: true,
								message: "Nama Kota tidak boleh kosong!",
							},
						]}
					>
						<Input disabled={confirmLoading} />
					</Form.Item>
					<Form.Item
						label="Logo Kota"
						name="logo"
						valuePropName="fileList"
						getValueFromEvent={(e) => {
							if (Array.isArray(e)) {
								return e;
							}

							return e?.fileList;
						}}
						rules={[
							() => ({
								validator(_, value) {
									if (value && !!value.length && !value[0]?.url) {
										const isJpgOrPng = [
											"image/png",
											"image/jpeg",
											"image/jpg",
										].includes(value[0]?.type);
										const isLt4MB = value[0]?.size / 1024 / 1024 < 4;

										if (!isJpgOrPng)
											return Promise.reject(
												"You can only upload JPG/JPEG/PNG file!"
											);

										if (!isLt4MB)
											return Promise.reject("Image must smaller than 2MB!");
									}

									return Promise.resolve();
								},
							}),
						]}
					>
						<Upload
							accept="image/png, image/jpeg, image/jpg"
							maxCount={1}
							disabled={confirmLoading}
							beforeUpload={() => {
								return false;
							}}
						>
							<Button icon={<UploadOutlined />}>Unggah Berkas</Button>
						</Upload>
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
