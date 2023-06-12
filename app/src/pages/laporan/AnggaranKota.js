import React, { useEffect, useRef, useState } from "react";
import {
	Button,
	DatePicker,
	Divider,
	Form,
	Modal,
	Select,
	Space,
	Table,
} from "antd";
import axios from "axios";
import ReloadButton from "../../components/button/ReloadButton";
import { getCityList } from "../../services/city";
import { DATE_FORMAT_VIEW, PAGINATION } from "../../helpers/constants";
import dayjs from "dayjs";
import { convertDate, dbDate, viewDate } from "../../helpers/date";
import useRole from "../../hooks/useRole";
import { getRealPlanCities } from "../../services/report";
import { responseGet } from "../../helpers/response";
import { searchColumn } from "../../helpers/table";
import { formatterNumber } from "../../helpers/number";
import { upper } from "../../helpers/typo";
import _ from "lodash";
import { ExportOutlined } from "@ant-design/icons";
import logoKemendagri from "../../assets/images/logo-kemendagri.png";
import { getSignerList } from "../../services/signer";

const ExcelJS = require("exceljs");
const { RangePicker } = DatePicker;

const defaultStartPicker = dayjs().startOf("year");
const defaultEndPicker = convertDate();

export default function AnggaranKota() {
	const { role_id } = useRole();
	const [form] = Form.useForm();

	const searchInput = useRef(null);
	const [filtered, setFiltered] = useState({});
	const [sorted, setSorted] = useState({});
	const [dateRangeFilter, setDateRangeFilter] = useState([
		defaultStartPicker,
		defaultEndPicker,
	]);
	const [cityFilter, setCityFilter] = useState(null);
	const [tableParams, setTableParams] = useState({
		...PAGINATION,
		filters: {
			city_id: null,
			trans_date: [[dbDate(dateRangeFilter[0]), dbDate(dateRangeFilter[1])]],
		},
	});

	const [data, setData] = useState([]);
	const [cities, setCities] = useState([]);
	const [loading, setLoading] = useState(false);

	const [signers, setSigners] = useState([]);
	const [exports, setExports] = useState([]);
	const [signerModal, setSignerModal] = useState(false);
	const [exportLoading, setExportLoading] = useState(false);

	const reloadData = () => {
		setLoading(true);
		axios
			.all([
				getRealPlanCities(tableParams),
				getRealPlanCities({
					...tableParams,
					pagination: { ...tableParams.pagination, pageSize: 0 },
				}),
				getCityList(),
				getSignerList(),
			])
			.then(
				axios.spread((_data, _export, _cities, _signer) => {
					setLoading(false);
					setData(responseGet(_data).data);
					setExports(setDataExport(responseGet(_export).data));
					setTableParams({
						...tableParams,
						pagination: {
							...tableParams.pagination,
							total: responseGet(_data).total_count,
						},
					});
					setCities(_cities?.data?.data);
					setSigners(_signer?.data?.data);
				})
			);
	};

	const onTableChange = (pagination, filters, sorter) => {
		setFiltered(filters);
		setSorted(sorter);

		setTableParams({
			pagination,
			filters: {
				...filters,
				city_id: cityFilter ? [cityFilter] : null,
				trans_date: [[dbDate(dateRangeFilter[0]), dbDate(dateRangeFilter[1])]],
			},
			...sorter,
		});

		// `dataSource` is useless since `pageSize` changed
		if (pagination.pageSize !== tableParams.pagination?.pageSize) {
			setData([]);
		}
	};

	const onDateRangeFilterChange = (values) => {
		setDateRangeFilter(values);
		setFiltered({});
		setSorted({});
		setTableParams({
			...PAGINATION,
			filters: {
				city_id: cityFilter ? [cityFilter] : null,
				trans_date: [[dbDate(values[0]), dbDate(values[1])]],
			},
		});
	};

	const onCityFilterChange = (value) => {
		setCityFilter(value);
		setFiltered({});
		setSorted({});
		setTableParams({
			...PAGINATION,
			filters: {
				city_id: value ? [value] : null,
				trans_date: [[dbDate(dateRangeFilter[0]), dbDate(dateRangeFilter[1])]],
			},
		});
	};

	const reloadTable = () => {
		setCityFilter(null);
		setDateRangeFilter([defaultStartPicker, defaultEndPicker]);
		setFiltered({});
		setSorted({});
		setTableParams({
			...PAGINATION,
			filters: {
				city_id: null,
				trans_date: [[dbDate(defaultStartPicker), dbDate(defaultEndPicker)]],
			},
		});
	};

	const columns = [
		searchColumn(searchInput, "trans_date", "Tanggal", null, true, sorted),
		searchColumn(searchInput, "city_label", "Kota", null, true, sorted),
		searchColumn(
			searchInput,
			"account_object_label",
			"Objek Rekening",
			filtered,
			true,
			sorted
		),
		searchColumn(
			searchInput,
			"account_object_plan_amount",
			"Anggaran",
			filtered,
			true,
			sorted,
			"int"
		),
		searchColumn(
			searchInput,
			"account_object_real_amount",
			"Realisasi",
			filtered,
			true,
			sorted,
			"int"
		),
	];

	const setDataExport = (data) => {
		let results = [];
		// sorting
		let srt = _.sortBy(data, [
			"account_base_label",
			"account_group_label",
			"account_type_label",
			"account_object_label",
		]);
		// grouping
		let grp = _.chain(srt)
			.groupBy("account_base_label")
			.map((base, baseKey) => ({
				city_label: base[0]?.city_label,
				code: normalizeLabel(baseKey).code,
				label: upper(normalizeLabel(baseKey).label),
				plan_amount: formatterNumber(base[0]?.account_base_plan_amount),
				real_amount: formatterNumber(base[0]?.account_base_real_amount),
				percentage: sumPercentage(
					base[0]?.account_base_real_amount,
					base[0]?.account_base_plan_amount
				),
				children: _.chain(base)
					.groupBy("account_group_label")
					.map((group, groupKey) => ({
						code: normalizeLabel(groupKey).code,
						label: upper(normalizeLabel(groupKey).label),
						plan_amount: formatterNumber(group[0]?.account_group_plan_amount),
						real_amount: formatterNumber(group[0]?.account_group_real_amount),
						percentage: sumPercentage(
							group[0]?.account_group_real_amount,
							group[0]?.account_group_plan_amount
						),
						children: _.chain(group)
							.groupBy("account_type_label")
							.map((type, typeKey) => ({
								code: normalizeLabel(typeKey).code,
								label: normalizeLabel(typeKey).label,
								plan_amount: formatterNumber(type[0]?.account_type_plan_amount),
								real_amount: formatterNumber(type[0]?.account_type_real_amount),
								percentage: sumPercentage(
									type[0]?.account_type_real_amount,
									type[0]?.account_type_plan_amount
								),
								children: _.map(type, (object) => ({
									code: normalizeLabel(object?.account_object_label).code,
									label: normalizeLabel(object?.account_object_label).label,
									plan_amount: formatterNumber(
										object?.account_object_plan_amount
									),
									real_amount: formatterNumber(
										object?.account_object_real_amount
									),
									percentage: sumPercentage(
										object?.account_object_real_amount,
										object?.account_object_plan_amount
									),
								})),
							}))
							.value(),
					}))
					.value(),
			}))
			.value();

		return results.concat(recursiveRecord(grp));
	};

	const recursiveRecord = (data, results = [], base = null, group = null) => {
		_.map(data, (item) => {
			results.push(item);

			if (item?.children && !!item.children.length) {
				recursiveRecord(item?.children, results, item?.code, item?.code);
			}

			if (item?.code !== group && item?.code.split(".").length === 2) {
				group = item?.code;
				results.push(
					{
						code: "",
						label: `JUMLAH ${item?.label}`,
						plan_amount: item?.plan_amount,
						real_amount: item?.real_amount,
						percentage: item?.percentage,
					},
					{
						code: "",
						label: "",
						plan_amount: "",
						real_amount: "",
						percentage: "",
					}
				);
			}

			if (item?.code !== base && item?.code.length === 1) {
				base = item?.code;

				results.push(
					{
						code: "",
						label: `JUMLAH ${item?.label}`,
						plan_amount: item?.plan_amount,
						real_amount: item?.real_amount,
						percentage: item?.percentage,
					},
					{
						code: "",
						label: "",
						plan_amount: "",
						real_amount: "",
						percentage: "",
					}
				);
			}

			return item;
		});

		return results;
	};

	const normalizeLabel = (val) => {
		let _tf, _tl;

		_tf = val.split(" ")[0].replace(/[()]/g, "");
		_tl = val.split(" ");
		_tl.shift();

		return { code: _tf || "", label: _tl ? _tl.join(" ") : "" };
	};

	const sumPercentage = (value1 = 0, value2 = 0, results = 0) => {
		if ([null, undefined, ""].includes(value1)) value1 = 0;
		if ([null, undefined, ""].includes(value2)) value2 = 0;

		results = parseFloat((value1 / value2) * 100).toFixed(2);

		if (isNaN(results)) return 0;

		return results;
	};

	const exportToExcel = async (v) => {
		const workbook = new ExcelJS.Workbook();
		const sheet = workbook.addWorksheet("LRA Kota");
		const chooseCity = exports[0].city_label || "";
		const signerIs = signers.find((d) => d?.id === v?.signer_id)?.label || "";

		// title
		setExportLoading(true);
		const imageBuffer = await axios.get(logoKemendagri, {
			responseType: "arraybuffer",
		});
		setExportLoading(false);

		const imageId1 = workbook.addImage({
			buffer: imageBuffer.data,
			extension: "png",
		});
		sheet.addImage(imageId1, {
			tl: { col: 0.35, row: 0.35 },
			ext: { width: 100, height: 120 },
			editAs: "absolute",
		});

		sheet.mergeCells("A1", "A7");
		sheet.mergeCells("E1", "E7");
		sheet.mergeCells("B1", "D1");
		sheet.mergeCells("B2", "D2");
		sheet.mergeCells("B3", "D3");
		sheet.mergeCells("B4", "D4");
		sheet.mergeCells("B5", "D5");
		sheet.mergeCells("B6", "D6");
		sheet.mergeCells("B7", "D7");
		sheet.getCell("B2").value = upper(`Pemerintahan ${chooseCity}`);
		sheet.getCell("B2").style = {
			alignment: { vertical: "middle", horizontal: "center" },
			font: { bold: true },
		};
		sheet.getCell("B4").value =
			"LAPORAN REALISASI ANGGARAN PENDAPATAN DAN BELANJA DAERAH (KONSOLIDASI)";
		sheet.getCell("B4").style = {
			alignment: { vertical: "middle", horizontal: "center" },
			font: { bold: true },
		};
		sheet.getCell("B5").value = upper(
			`Tahun Anggaran ${viewDate(dateRangeFilter[1]).split(" ").pop()}`
		);
		sheet.getCell("B5").style = {
			alignment: { vertical: "middle", horizontal: "center" },
			font: { bold: true },
		};
		sheet.getCell("B6").value = `${viewDate(
			dateRangeFilter[0]
		)} Sampai ${viewDate(dateRangeFilter[1])}`;
		sheet.getCell("B6").style = {
			alignment: { vertical: "middle", horizontal: "center" },
			font: { bold: true },
		};

		// header
		sheet.addRow([]);
		sheet.addRow([
			"KODE REKENING",
			"URAIAN",
			"ANGGARAN",
			"REALISASI",
			`% ${viewDate(dateRangeFilter[1]).split(" ").pop()}`,
		]);
		sheet.addRow(["1", "2", "3", "4", "5 = (4 / 3) * 100"]);
		sheet.addRow(["", "", "", "", ""]);
		sheet.columns = [
			{ key: "code", width: 18 },
			{ key: "label", width: 50 },
			{ key: "plan_amount", width: 18 },
			{ key: "real_amount", width: 18 },
			{ key: "percentage", width: 18 },
		];

		// data
		sheet.addRows(exports, "i");
		sheet.eachRow((row, number) => {
			if ([9, 10, 11].includes(number)) {
				if (number === 9) row.height = 50;

				row.eachCell((cell) => {
					cell.style = {
						alignment: { vertical: "middle", horizontal: "center" },
						font: { bold: true },
						border: {
							top: { style: "thin" },
							left: { style: "thin" },
							bottom: { style: "thin" },
							right: { style: "thin" },
						},
					};
				});
			} else if (number > 9) {
				row.eachCell((cell) => {
					const codeShell = sheet.getCell(`A${number}`);
					const countTick = codeShell.value.split(".").length;

					if (
						["plan_amount", "real_amount", "percentage"].includes(
							cell._column._key
						)
					) {
						cell.style = {
							font: { bold: countTick <= 2 },
							alignment: {
								horizontal: "right",
								vertical: "middle",
							},
						};
					} else {
						cell.style = {
							font: { bold: countTick <= 2 },
							alignment: {
								horizontal: "left",
								vertical: "middle",
							},
						};
					}

					cell.style = {
						...cell.style,
						border: {
							top: { style: "thin" },
							left: { style: "thin" },
							bottom: { style: "thin" },
							right: { style: "thin" },
						},
					};
				});
			}
		});

		// make signer and sipd
		const last = sheet.lastRow;

		if (last) {
			// signer date
			let signerDateCell = last.number || 0;
			signerDateCell += 3;

			sheet.mergeCells(`C${signerDateCell}`, `E${signerDateCell}`);
			sheet.getCell(`C${signerDateCell}`).value = `${chooseCity}, ${viewDate(
				convertDate()
			)}`;
			sheet.getCell(`C${signerDateCell}`).style = {
				alignment: { vertical: "middle", horizontal: "center" },
				font: { bold: false },
			};

			// signer
			let signerCell = last.number || 0;
			signerCell += 8;

			sheet.mergeCells(`C${signerCell}`, `E${signerCell}`);
			sheet.getCell(`C${signerCell}`).value = signerIs;
			sheet.getCell(`C${signerCell}`).style = {
				alignment: { vertical: "middle", horizontal: "center" },
				font: { bold: false },
			};

			// sipd
			let sipdCell = last.number || 0;
			sipdCell += 11;

			sheet.mergeCells(`A${sipdCell}`, `E${sipdCell}`);
			sheet.getCell(
				`A${sipdCell}`
			).value = `Dicetak Oleh SIPD Kementrian Dalam Negeri`;
			sheet.getCell(`A${sipdCell}`).style = {
				alignment: { vertical: "middle", horizontal: "center" },
				font: { bold: false },
			};
		}

		workbook.xlsx.writeBuffer().then(function (data) {
			const blob = new Blob([data], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			});
			const url = window.URL.createObjectURL(blob);
			const anchor = document.createElement("a");

			anchor.href = url;
			anchor.download = `LAPORAN-REALISASI-ANGGARAN-${upper(
				chooseCity.split(" ").join("-")
			)}-${dbDate(convertDate())}.xlsx`;
			anchor.click();
			window.URL.revokeObjectURL(url);

			onSignerModal(false);
		});
	};

	const onSignerModal = (show) => {
		setSignerModal(show);
		form.resetFields();
	};

	useEffect(() => {
		reloadData();
	}, [JSON.stringify(tableParams)]);

	return (
		<>
			<div className="flex flex-col space-y-2 sm:space-y-0 sm:space-x-2 sm:flex-row md:space-y-0 md:space-x-2 md:flex-row">
				<div className="flex flex-row md:space-x-2">
					<h2 className="text-xs font-normal text-right w-14 hidden md:inline">
						Tanggal :
					</h2>
					<RangePicker
						className="w-full h-8 md:w-72"
						allowEmpty={false}
						allowClear={false}
						format={DATE_FORMAT_VIEW}
						defaultValue={dateRangeFilter}
						placeholder={["Tanggal Awal", "Tanggal Akhir"]}
						onChange={onDateRangeFilterChange}
						value={dateRangeFilter}
					/>
				</div>
				<div className="flex flex-row md:space-x-2">
					<h2 className="text-xs font-normal text-right w-10 hidden md:inline">
						Kota :
					</h2>
					<Select
						allowClear
						showSearch
						className="w-full sm:w-60 md:w-60"
						placeholder="Pilih Kota"
						optionFilterProp="children"
						filterOption={(input, option) =>
							(option?.label ?? "").includes(input)
						}
						disabled={role_id !== 1}
						loading={loading}
						options={cities}
						onChange={onCityFilterChange}
						{...(role_id !== 1
							? { value: cities[0]?.id || `Tidak ada kota` }
							: { value: cityFilter })}
					/>
				</div>
				<ReloadButton onClick={reloadTable} stateLoading={loading} />
				{!!exports?.length && cityFilter && (
					<Button
						type="primary"
						icon={<ExportOutlined />}
						onClick={() => onSignerModal(true)}
					>
						Ekspor
					</Button>
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
					dataSource={data}
					columns={columns}
					rowKey={(record) => `${record?.account_object_id}_${record?.city_id}`}
					onChange={onTableChange}
					pagination={tableParams.pagination}
				/>
			</div>
			<Modal
				style={{ margin: 10 }}
				centered
				open={signerModal}
				title={`Ekspor Data`}
				onCancel={() => onSignerModal(false)}
				footer={null}
			>
				<Divider />
				<Form
					form={form}
					name="basic"
					labelCol={{ span: 8 }}
					labelAlign="left"
					onFinish={exportToExcel}
					autoComplete="off"
					initialValues={{ signer_id: "" }}
				>
					<Form.Item
						label="Penanda Tangan"
						name="signer_id"
						rules={[
							{
								required: true,
								message: "Penanda Tangan tidak boleh kosong!",
							},
						]}
					>
						<Select
							disabled={exportLoading}
							loading={loading}
							options={signers}
						/>
					</Form.Item>
					<Divider />
					<Form.Item className="text-right mb-0">
						<Space direction="horizontal">
							<Button
								disabled={exportLoading}
								onClick={() => onSignerModal(false)}
							>
								Kembali
							</Button>
							<Button loading={exportLoading} htmlType="submit" type="primary">
								Simpan
							</Button>
						</Space>
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
}
