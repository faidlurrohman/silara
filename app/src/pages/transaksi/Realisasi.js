import {
	App,
	Button,
	Card,
	DatePicker,
	Divider,
	Form,
	InputNumber,
	Modal,
	Select,
	Space,
	Spin,
	Table,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { getAccountList } from "../../services/account";
import { DATE_FORMAT_VIEW, PAGINATION } from "../../helpers/constants";
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

export default function Realisasi() {
	const { message, modal } = App.useApp();
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
				getAccountList("object"),
				getTransactionObjectList(),
			])
			.then(
				axios.spread((_transactions, _export, _cities, _objects) => {
					setLoading(false);
					setTransactions(responseGet(_transactions).data);
					setExports(responseGet(_export).data);
					setCities(_cities?.data?.data);
					setAccountObject(_objects?.data?.data);
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
		getData({ pagination, filters, ...sorter });

		// `dataSource` is useless since `pageSize` changed
		if (pagination.pageSize !== tablePage.pagination?.pageSize) {
			setTransactions([]);
		}
	};

	const reloadTable = () => {
		setTableFiltered({});
		setTableSorted({});
		getData(PAGINATION);
	};

	const addData = () => {
		setShow(true);
		setShowCard(false);
		setLastTransaction({});
		form.resetFields();

		if (!is_super_admin !== 1 && cities[0]?.id) {
			form.setFieldsValue({ city_id: cities[0].id });
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
					message.success(messageAction(true));
					reloadTable();
				});
			},
		});
	};

	const handleAddUpdate = (values) => {
		let cur = {
			...values,
			trans_date: dbDate(values?.trans_date),
			plan_amount: 0,
		};

		if (cur?.trans_date === lastTransaction?.trans_date) {
			cur = {
				id: lastTransaction?.id,
				plan_amount: lastTransaction?.plan_amount,
				...values,
			};
		}

		setConfirmLoading(true);
		addTransaction(cur).then(() => {
			message.success(messageAction(true));
			setConfirmLoading(false);
			setShow(false);
			reloadTable();
		});
	};

	const handleObjectChange = (value) => {
		setLastTransactionLoading(true);
		getLastTransaction(value).then((response) => {
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
			"real_amount",
			"Realisasi",
			tableFiltered,
			true,
			tableSorted,
			"int"
		),
	];

	useEffect(() => getData(PAGINATION), []);

	return (
		<>
			<div className="flex flex-col space-y-2 sm:space-y-0 sm:space-x-2 sm:flex-row md:space-y-0 md:space-x-2 md:flex-row">
				<ReloadButton onClick={reloadTable} stateLoading={loading} />
				{!is_super_admin && (
					<AddButton onClick={addData} stateLoading={loading} />
				)}
				{!!exports?.length && (
					<ExportButton
						data={exports}
						master={`transaction`}
						pdfOrientation={`landscape`}
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
					size="small"
					loading={loading}
					dataSource={transactions}
					columns={
						is_super_admin
							? columns.concat(
									activeColumn(tableFiltered),
									actionColumn(null, onActiveChange)
							  )
							: columns
					}
					rowKey={(record) => record?.id}
					onChange={onTableChange}
					pagination={tablePage.pagination}
					tableLayout="auto"
				/>
			</div>
			<Modal
				style={{ margin: 10 }}
				centered
				open={isShow}
				title={`Tambah Data Transaksi`}
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
										<h4 className="md:inline">{`Realisasi (Rp)`}</h4>
									</div>
								</div>
								<div className="flex-1 flex-col space-y-2">
									<div>
										<h4 className="md:inline">
											{lastTransaction?.trans_date
												? viewDate(lastTransaction?.trans_date)
												: `-`}
										</h4>
									</div>
									<div>
										<h4 className="md:inline">
											{lastTransaction?.real_amount >= 0
												? formatterNumber(lastTransaction?.real_amount || 0)
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
							trans_date: convertDate(),
							real_amount: 0,
						}}
					>
						<Form.Item
							label="Tanggal Transaksi"
							name="trans_date"
							rules={[
								{
									required: true,
									message: "Tanggal Transaksi tidak boleh kosong!",
								},
							]}
						>
							<DatePicker format={DATE_FORMAT_VIEW} className="w-full" />
						</Form.Item>
						<Form.Item
							label="Kota"
							name="city_id"
							rules={[
								{
									required: true,
									message: "Kota tidak boleh kosong!",
								},
							]}
						>
							<Select loading={loading} options={cities} disabled />
						</Form.Item>
						<Form.Item
							label="Objek Rekening"
							name="account_object_id"
							rules={[
								{
									required: true,
									message: "Objek Rekening tidak boleh kosong!",
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
								options={accountObject}
								onChange={handleObjectChange}
							/>
						</Form.Item>
						<Form.Item
							label="Realisasi (Rp)"
							name="real_amount"
							rules={[
								{
									required: true,
									message: "Realisasi tidak boleh kosong!",
								},
								() => ({
									validator(_, value) {
										if (value < 0) {
											return Promise.reject("Realisasi minus");
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
