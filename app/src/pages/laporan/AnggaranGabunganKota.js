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
import { getSignerList } from "../../services/signer";

const ExcelJS = require("exceljs");
const { RangePicker } = DatePicker;

const defaultStartPicker = dayjs().startOf("year");
const defaultEndPicker = convertDate();

export default function AnggaranGabunganKota() {
	const { role_id } = useRole();
	const [form] = Form.useForm();

	const searchInput = useRef(null);
	const [filtered, setFiltered] = useState({});
	const [sorted, setSorted] = useState({});
	const [dateRangeFilter, setDateRangeFilter] = useState([
		defaultStartPicker,
		defaultEndPicker,
	]);
	const [cityFilter, setCityFilter] = useState([]);
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
		setCityFilter([]);
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
		let results = { cities: {}, codes: [], data: [] };

		// sorting
		let srt = _.sortBy(data, [
			"city_label",
			"account_base_label",
			"account_group_label",
			"account_type_label",
			"account_object_label",
		]);

		// take all city
		results.cities = _.chain(srt)
			.groupBy("city_label")
			.map((values, label) => ({
				city: label,
				city_id: values[0].city_id,
				children: values,
			}))
			.value();

		// take all codes
		results.codes = recursiveRecord(
			_.chain(_.uniqBy(srt, "account_object_label"))
				.groupBy("account_base_label")
				.map((base, baseKey) => ({
					code: normalizeLabel(baseKey).code,
					label: upper(normalizeLabel(baseKey).label),
					origin: baseKey,
					children: _.chain(base)
						.groupBy("account_group_label")
						.map((group, groupKey) => ({
							code: normalizeLabel(groupKey).code,
							label: upper(normalizeLabel(groupKey).label),
							origin: groupKey,
							children: _.chain(group)
								.groupBy("account_type_label")
								.map((type, typeKey) => ({
									code: normalizeLabel(typeKey).code,
									label: normalizeLabel(typeKey).label,
									origin: typeKey,
									children: _.map(type, (object) => ({
										code: normalizeLabel(object?.account_object_label).code,
										label: normalizeLabel(object?.account_object_label).label,
										origin: object?.account_object_label,
									})),
								}))
								.value(),
						}))
						.value(),
				}))
				.value()
		);

		// set data per-city
		_.map(results.codes, (codes) => {
			let d = { code: codes?.code, label: codes?.label };
			_.map(results?.cities, (cities) => {
				let fb = cities?.children.find(
					(i) => i?.account_base_label === codes?.origin
				);
				let fg = cities?.children.find(
					(i) => i?.account_group_label === codes?.origin
				);
				let ft = cities?.children.find(
					(i) => i?.account_type_label === codes?.origin
				);
				let fo = cities?.children.find(
					(i) => i?.account_object_label === codes?.origin
				);

				if (fo) {
					d[`${cities?.city_id}_plan_amount`] = formatterNumber(
						fo?.account_object_plan_amount
					);
					d[`${cities?.city_id}_real_amount`] = formatterNumber(
						fo?.account_object_real_amount
					);
					d[`${cities?.city_id}_percentage`] = sumPercentage(
						fo?.account_object_real_amount,
						fo?.account_object_plan_amount
					);
				} else if (ft) {
					d[`${cities?.city_id}_plan_amount`] = formatterNumber(
						ft?.account_type_plan_amount
					);
					d[`${cities?.city_id}_real_amount`] = formatterNumber(
						ft?.account_type_real_amount
					);
					d[`${cities?.city_id}_percentage`] = sumPercentage(
						ft?.account_type_real_amount,
						ft?.account_type_plan_amount
					);
				} else if (fg) {
					d[`${cities?.city_id}_plan_amount`] = formatterNumber(
						fg?.account_group_plan_amount
					);
					d[`${cities?.city_id}_real_amount`] = formatterNumber(
						fg?.account_group_real_amount
					);
					d[`${cities?.city_id}_percentage`] = sumPercentage(
						fg?.account_group_real_amount,
						fg?.account_group_plan_amount
					);
				} else if (fb) {
					d[`${cities?.city_id}_plan_amount`] = formatterNumber(
						fb?.account_base_plan_amount
					);
					d[`${cities?.city_id}_real_amount`] = formatterNumber(
						fb?.account_base_real_amount
					);
					d[`${cities?.city_id}_percentage`] = sumPercentage(
						fb?.account_base_real_amount,
						fb?.account_base_plan_amount
					);
				} else {
					d[`${cities?.city_id}_plan_amount`] = codes?.code ? 0 : ``;
					d[`${cities?.city_id}_real_amount`] = codes?.code ? 0 : ``;
					d[`${cities?.city_id}_percentage`] = codes?.code ? 0 : ``;
				}
			});
			results?.data.push(d);
		});

		return results;
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
						origin: item?.origin,
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
						origin: item?.origin,
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
		const sheet = workbook.addWorksheet("LRA Gabungan Kota");
		const signerIs = signers.find((d) => d?.id === v?.signer_id)?.label || "";

		// title
		sheet.mergeCells("B1", "D1");
		sheet.mergeCells("B2", "D2");
		sheet.mergeCells("B3", "D3");
		sheet.mergeCells("B4", "D4");
		sheet.mergeCells("B5", "D5");
		sheet.mergeCells("B6", "D6");
		sheet.mergeCells("B7", "D7");
		sheet.mergeCells("B8", "D8");
		sheet.getCell("B3").value =
			"LAPORAN REALISASI ANGGARAN PENDAPATAN DAN BELANJA DAERAH (KONSOLIDASI)";
		sheet.getCell("B3").style = {
			alignment: { vertical: "middle", horizontal: "center" },
			font: { bold: true },
		};
		sheet.getCell(
			"B4"
		).value = `KABUPATEN/KOTA SE-PROVINSI KEPULAUAN RIAU ANGGARAN ${viewDate(
			dateRangeFilter[1]
		)}`;
		sheet.getCell("B4").style = {
			alignment: { vertical: "middle", horizontal: "center" },
			font: { bold: true },
		};
		sheet.getCell("B5").value = `${viewDate(
			dateRangeFilter[0]
		)} Sampai ${viewDate(dateRangeFilter[1])}`;
		sheet.getCell("B5").style = {
			alignment: { vertical: "middle", horizontal: "center" },
			font: { bold: true },
		};
		// header
		sheet.addRow([]);
		sheet.mergeCells("A9", "A10");
		sheet.mergeCells("B9", "B10");
		sheet.getCell("A9").value = `KODE REKENING`;
		sheet.getCell("A9").style = {
			alignment: { vertical: "middle", horizontal: "center" },
			font: { bold: true },
		};
		sheet.getCell("B9").value = `URAIAN`;
		sheet.getCell("B9").style = {
			alignment: { vertical: "middle", horizontal: "center" },
			font: { bold: true },
		};

		let sc = 3,
			sr = 9;
		let col = [
				{ key: "code", width: 18 },
				{ key: "label", width: 50 },
			],
			scol = ["1", "2"];
		_.map(exports?.cities, (item) => {
			sheet.mergeCells(sr, sc, sr, sc + 2);

			const cr = sheet.getRow(sr);
			const crb = sheet.getRow(sr + 1);
			cr.getCell(sc).value = upper(item?.city);
			cr.getCell(sc).style = {
				alignment: { vertical: "middle", horizontal: "center" },
				font: { bold: true },
			};
			crb.height = 25;
			crb.getCell(sc).value = "ANGGARAN";
			crb.getCell(sc + 1).value = "REALISASI";
			crb.getCell(sc + 2).value = "%";
			crb.getCell(sc).style = {
				alignment: { vertical: "middle", horizontal: "center" },
				font: { bold: true },
			};
			crb.getCell(sc + 1).style = {
				alignment: { vertical: "middle", horizontal: "center" },
				font: { bold: true },
			};
			crb.getCell(sc + 2).style = {
				alignment: { vertical: "middle", horizontal: "center" },
				font: { bold: true },
			};
			col.push({ key: `${item?.city_id}_plan_amount`, width: 18 });
			col.push({ key: `${item?.city_id}_real_amount`, width: 18 });
			col.push({ key: `${item?.city_id}_percentage`, width: 18 });
			scol.push(`${sc}`);
			scol.push(`${sc + 1}`);
			scol.push(`${sc + 2} = (${sc + 1} / ${sc}) * 100`);

			sc += 3;
		});
		sheet.addRow(scol);
		sheet.addRow(_.fill(scol, ""));
		sheet.columns = col;

		// data
		sheet.addRows(exports?.data, "i");
		sheet.eachRow((row, number) => {
			if ([9, 10, 11, 12].includes(number)) {
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
						cell._column._key.includes("plan_amount") ||
						cell._column._key.includes("real_amount") ||
						cell._column._key.includes("percentage")
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
			sheet.getCell(`C${signerDateCell}`).value = viewDate(convertDate());
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
			anchor.download = `LAPORAN-REALISASI-ANGGARAN-GABUNGAN-KOTA-${dbDate(
				convertDate()
			)}.xlsx`;
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
						mode="multiple"
						maxTagCount="responsive"
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
				<Button
					type="primary"
					icon={<ExportOutlined />}
					onClick={() => onSignerModal(true)}
				>
					Ekspor
				</Button>
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
						<Select loading={loading} options={signers} />
					</Form.Item>
					<Divider />
					<Form.Item className="text-right mb-0">
						<Space direction="horizontal">
							<Button onClick={() => onSignerModal(false)}>Kembali</Button>
							<Button htmlType="submit" type="primary">
								Simpan
							</Button>
						</Space>
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
}
