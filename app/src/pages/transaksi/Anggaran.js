import {
	App,
	Button,
	Card,
	Divider,
	Form,
	Input,
	InputNumber,
	Modal,
	Select,
	Space,
	Spin,
	Table,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { COLORS, PAGINATION } from "../../helpers/constants";
import { actionColumn, activeColumn, searchColumn } from "../../helpers/table";
import ReloadButton from "../../components/button/ReloadButton";
import AddButton from "../../components/button/AddButton";
import ExportButton from "../../components/button/ExportButton";
import { messageAction, responseGet } from "../../helpers/response";
import {
	addTransaction,
	getLastTransaction,
	getTransaction,
	getTransactionObjectList,
	setActiveTransaction,
} from "../../services/transaction";
import { getCityList } from "../../services/city";
import { convertDate, dbDate, viewDate } from "../../helpers/date";
import axios from "axios";
import useRole from "../../hooks/useRole";
import { formatterNumber, parserNumber } from "../../helpers/number";
import { lower } from "../../helpers/typo";

export default function Anggaran() {
	const { modal } = App.useApp();
	const { is_super_admin } = useRole();
	const [form] = Form.useForm();

	const [transactions, setTransactions] = useState([]);
	const [cities, setCities] = useState([]);
	const [accountObject, setAccountObject] = useState([]);
	const [lastTransaction, setLastTransaction] = useState({});
	const [lastTransactionLoading, setLastTransactionLoading] = useState(false);
	const [showCard, setShowCard] = useState(false);
	const [exports, setExports] = useState([]);
	const [loading, setLoading] = useState(false);

	const tableFilterInputRef = useRef(null);
	const [tableFiltered, setTableFiltered] = useState({});
	const [tableSorted, setTableSorted] = useState({});
	const [tablePage, setTablePage] = useState(PAGINATION);

	const [isEdit, setEdit] = useState(false);
	const [isShow, setShow] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const getData = (params) => {
		setLoading(true);
		axios
			.all([
				getTransaction(params),
				getTransaction({
					...params,
					pagination: { ...params.pagination, pageSize: 0 },
				}),
				getCityList(),
				getTransactionObjectList("plan"),
			])
			.then(
				axios.spread((_transactions, _export, _cities, _objects) => {
					setLoading(false);
					setTransactions(responseGet(_transactions).data);
					setExports(responseGet(_export).data);
					setCities(_cities?.data?.data || []);
					setAccountObject(_objects?.data?.data || []);
					setTablePage({
						pagination: {
							...params.pagination,
							total: responseGet(_transactions).total_count,
						},
					});
				})
			);
	};

	const onTableChange = (pagination, filters, sorter) => {
		setTableFiltered(filters);
		setTableSorted(sorter);
		getData({
			pagination,
			filters: { ...filters, use_mode: ["plan"] },
			...sorter,
		});

		// `dataSource` is useless since `pageSize` changed
		if (pagination.pageSize !== tablePage.pagination?.pageSize) {
			setTransactions([]);
		}
	};

	const reloadTable = () => {
		setTableFiltered({});
		setTableSorted({});
		getData({ ...PAGINATION, filters: { use_mode: ["plan"] } });
	};

	const addUpdateRow = (isEdit = false, value = null) => {
		setShow(!isShow);
		setShowCard(false);
		setLastTransaction({});

		if (isEdit) {
			setEdit(true);
			form.setFieldsValue({ id: value?.id, plan_amount: value?.plan_amount });
		} else {
			form.resetFields();
			setEdit(false);
		}
	};

	const onActiveChange = (value) => {
		modal.confirm({
			title: `${value?.active ? `Nonaktifkan` : `Aktifkan`} data :`,
			content: (
				<>
					{value?.city_label} - {value?.account_object_label}
				</>
			),
			okText: "Ya",
			cancelText: "Tidak",
			centered: true,
			onOk() {
				setActiveTransaction(value?.id).then(() => {
					messageAction(true);
					reloadTable();
				});
			},
		});
	};

	const handleAddUpdate = (values) => {
		let cur = {
			...values,
			trans_date: dbDate(convertDate().startOf("year")),
			city_id: !!cities.length ? cities[0]?.id : 0,
			real_amount: 0,
		};

		setConfirmLoading(true);
		addTransaction(cur).then(() => {
			messageAction(isEdit);
			setConfirmLoading(false);
			setShow(false);
			reloadTable();
		});
	};

	const handleObjectChange = (value) => {
		setLastTransactionLoading(true);
		getLastTransaction({
			account_object_id: value,
			trans_date: dbDate(convertDate().startOf("year")),
		}).then((response) => {
			setLastTransactionLoading(false);

			if (responseGet(response)?.total_count > 0) {
				setShowCard(true);
				setLastTransaction(responseGet(response)?.data[0]);
			} else {
				setShowCard(false);
				setLastTransaction({});
			}
		});
	};

	const columns = [
		searchColumn(
			tableFilterInputRef,
			"trans_date",
			"Tanggal",
			tableFiltered,
			true,
			tableSorted
		),
		searchColumn(
			tableFilterInputRef,
			"city_label",
			"Kota",
			tableFiltered,
			true,
			tableSorted
		),
		searchColumn(
			tableFilterInputRef,
			"account_object_label",
			"Objek Rekening",
			tableFiltered,
			true,
			tableSorted
		),
		searchColumn(
			tableFilterInputRef,
			"plan_amount",
			"Anggaran",
			tableFiltered,
			true,
			tableSorted,
			"int"
		),
	];

	useEffect(
		() => getData({ ...PAGINATION, filters: { use_mode: ["plan"] } }),
		[]
	);

	return (
		<>
			<div className="flex flex-col mb-2 space-y-2 sm:space-y-0 sm:space-x-2 sm:flex-row md:space-y-0 md:space-x-2 md:flex-row">
				<ReloadButton onClick={reloadTable} stateLoading={loading} />
				{!is_super_admin && (
					<AddButton onClick={addUpdateRow} stateLoading={loading} />
				)}
				{!!exports?.length && (
					<ExportButton
						data={exports}
						master={`transaction`}
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
				dataSource={transactions}
				columns={
					is_super_admin
						? columns.concat(
								activeColumn(tableFiltered),
								actionColumn(addUpdateRow, onActiveChange)
						  )
						: columns
				}
				rowKey={(record) => record?.id}
				onChange={onTableChange}
				pagination={tablePage.pagination}
				tableLayout="auto"
			/>
			<Modal
				style={{ margin: 10 }}
				centered
				open={isShow}
				title={`${isEdit ? `Ubah` : `Tambah`} Data Transaksi`}
				onCancel={() => setShow(false)}
				footer={null}
			>
				<Spin spinning={lastTransactionLoading}>
					<Divider />
					{showCard && (
						<Card className="mb-4">
							<h4 className="text-center p-0 mt-0">Riwayat Data Terakhir</h4>
							<div className="flex flex-1 flex-row space-x-7">
								<div className="flex-0 flex-col space-y-2">
									<div>
										<h4 className="md:inline">{`Tanggal Transaksi`}</h4>
									</div>
									<div>
										<h4 className="md:inline">{`Anggaran (Rp)`}</h4>
									</div>
								</div>
								<div className="flex-1 flex-col space-y-2">
									<div>
										<h4 className="md:inline">
											:{" "}
											{lastTransaction?.trans_date
												? viewDate(lastTransaction?.trans_date)
												: `-`}
										</h4>
									</div>
									<div>
										<h4 className="md:inline">
											:{" "}
											{lastTransaction?.plan_amount >= 0
												? formatterNumber(lastTransaction?.plan_amount || 0)
												: `-`}
										</h4>
									</div>
								</div>
							</div>
						</Card>
					)}
					<Form
						form={form}
						name="basic"
						labelCol={{ span: 8 }}
						labelAlign="left"
						onFinish={handleAddUpdate}
						autoComplete="off"
						initialValues={{
							id: "",
							city_label: !!cities.length ? cities[0]?.label : ``,
							plan_amount: 0,
						}}
					>
						<Form.Item name="id" hidden>
							<Input />
						</Form.Item>
						<Form.Item
							label="Kota"
							name="city_label"
							rules={[
								{
									required: isEdit ? false : true,
									message: "Kota tidak boleh kosong!",
								},
							]}
							hidden={isEdit}
						>
							<Input
								disabled
								style={{ background: COLORS.white, color: COLORS.black }}
							/>
						</Form.Item>
						<Form.Item
							label="Objek Rekening"
							name="account_object_id"
							rules={[
								{
									required: isEdit ? false : true,
									message: "Objek Rekening tidak boleh kosong!",
								},
							]}
							hidden={isEdit}
						>
							<Select
								showSearch
								optionFilterProp="children"
								filterOption={(input, option) =>
									(lower(option?.label) ?? "").includes(lower(input))
								}
								disabled={confirmLoading}
								loading={loading}
								options={accountObject}
								onChange={handleObjectChange}
							/>
						</Form.Item>
						<Form.Item
							label="Anggaran (Rp)"
							name="plan_amount"
							rules={[
								{
									required: true,
									message: "Anggaran tidak boleh kosong!",
								},
								() => ({
									validator(_, value) {
										if (value < 0) {
											return Promise.reject("Anggaran minus");
										} else {
											return Promise.resolve();
										}
									},
								}),
							]}
						>
							<InputNumber
								className="w-full"
								disabled={confirmLoading}
								formatter={(value) => formatterNumber(value)}
								parser={(value) => parserNumber(value)}
							/>
						</Form.Item>
						<Divider />
						<Form.Item className="text-right mb-0">
							<Space direction="horizontal">
								<Button
									disabled={confirmLoading}
									onClick={() => setShow(false)}
								>
									Kembali
								</Button>
								<Button
									loading={confirmLoading}
									htmlType="submit"
									type="primary"
								>
									Simpan
								</Button>
							</Space>
						</Form.Item>
					</Form>
				</Spin>
			</Modal>
		</>
	);
}
