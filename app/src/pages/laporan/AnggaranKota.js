import { Card, DatePicker, Select, Table } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { DATE_FORMAT_VIEW, PAGINATION } from "../../helpers/constants";
import { searchColumn } from "../../helpers/table";
import axios from "axios";
import { getRealPlanCities } from "../../services/report";
import { responseGet } from "../../helpers/response";
import ReloadButton from "../../components/button/ReloadButton";
import { convertDate, dbDate } from "../../helpers/date";
import useRole from "../../hooks/useRole";
import { getCityList } from "../../services/city";
import _ from "lodash";
import { formatterNumber, parseNaN } from "../../helpers/number";
import { lower, upper } from "../../helpers/typo";
import ExportButton from "../../components/button/ExportButton";
import { Pie } from "@ant-design/plots";
import { getAccountList } from "../../services/account";

const { RangePicker } = DatePicker;

export default function AnggaranKota() {
	const { is_super_admin } = useRole();
	const [data, setData] = useState([]);
	const [piePlan, setPiePlan] = useState([]);
	const [pieReal, setPieReal] = useState([]);
	const [exports, setExports] = useState([]);
	const [accountBase, setAccountBase] = useState([]);
	const [cities, setCities] = useState([]);
	const [loading, setLoading] = useState(false);

	const tableFilterInputRef = useRef(null);
	const [tablePage, setTablePage] = useState(PAGINATION);
	const [tableFiltered, setTableFiltered] = useState({});
	const [tableSorted, setTableSorted] = useState({});
	const [dateRangeFilter, setDateRangeFilter] = useState([
		convertDate().startOf("year"),
		convertDate(),
	]);
	const [cityFilter, setCityFilter] = useState(null);

	const columns = [
		searchColumn(
			tableFilterInputRef,
			"trans_date",
			"Tanggal",
			null,
			true,
			tableSorted
		),
		searchColumn(
			tableFilterInputRef,
			"city_label",
			"Nama Kota",
			null,
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
			"account_object_plan_amount",
			"Anggaran",
			tableFiltered,
			true,
			tableSorted,
			"int"
		),
		searchColumn(
			tableFilterInputRef,
			"account_object_real_amount",
			"Realisasi",
			tableFiltered,
			true,
			tableSorted,
			"int"
		),
	];

	const pieConfig = {
		appendPadding: 10,
		style: { height: 250 },
		angleField: "value",
		colorField: "type",
		radius: 0.75,
		label: {
			type: "spider",
			labelHeight: 28,
			content: "{name}\n{percentage}",
			style: { fontSize: 12 },
		},
		legend: false,
		tooltip: false,
		color: ["#1ca9e6", "#f88c24", "#63daab"],
		interactions: [{ type: "element-selected" }],
	};

	const getData = (params) => {
		setLoading(true);
		axios
			.all([
				getRealPlanCities(params),
				getRealPlanCities({
					...params,
					pagination: { ...params.pagination, pageSize: 0 },
				}),
				getCityList(),
				getAccountList("base"),
			])
			.then(
				axios.spread((_data, _export, _cities, _bases) => {
					setLoading(false);
					setCities(_cities?.data?.data || []);
					setData(responseGet(_data).data);
					setExports(setDataExport(responseGet(_export).data));
					setAccountBase(_bases?.data?.data || []);
					setTablePage({
						pagination: {
							...params.pagination,
							total: responseGet(_data).total_count,
						},
					});

					if (!!(_bases?.data?.data || []).length) {
						makeChartData(_bases?.data?.data || [], responseGet(_export).data);
					}
				})
			);
	};

	const makeChartData = (bases, values, percent = 100) => {
		// init array untung menampung data pie masing-masing plan atau real
		let _piePlan = [],
			_pieReal = [];

		// loop akun base
		_.map(bases, (base, index) => {
			// cari akun base[index] yang ada didata list
			const cb = _.filter(values, (v) => v?.account_base_id === base?.id);

			// push init ke array pie masing-masing
			_piePlan.push({ type: normalizeLabel(base?.label).label, value: 0 });
			_pieReal.push({ type: normalizeLabel(base?.label).label, value: 0 });

			// kalau ada data dari akun base yang ada di list
			if (cb && !!cb.length) {
				// loop hitung masing-masing plan atau real
				_.map(cb, (cur) => {
					// pakai float karena nilai ada pakai koma
					_piePlan[index].value += parseFloat(
						cur?.account_object_plan_amount || 0
					);
					_pieReal[index].value += parseFloat(
						cur?.account_object_real_amount || 0
					);
				});
			}
		});

		// set ke state dan hitung persen masing-masing plan atau real
		setPiePlan(
			_.map(_piePlan, (item) => ({
				...item,
				value: parseNaN((item?.value / _.sumBy(_piePlan, "value")) * percent),
			}))
		);

		// set ke state dan hitung persen masing-masing plan atau real
		setPieReal(
			_.map(_pieReal, (item) => ({
				...item,
				value: parseNaN((item?.value / _.sumBy(_pieReal, "value")) * percent),
			}))
		);
	};

	const reloadTable = () => {
		setTableFiltered({});
		setTableSorted({});
		setDateRangeFilter([convertDate().startOf("year"), convertDate()]);
		setCityFilter(null);
		getData({
			...PAGINATION,
			filters: {
				trans_date: [
					[dbDate(convertDate().startOf("year")), dbDate(convertDate())],
				],
				...(is_super_admin && { city_id: null }),
			},
		});
	};

	const onTableChange = (pagination, filters, sorter) => {
		setTableFiltered(filters);
		setTableSorted(sorter);
		getData({
			pagination,
			filters: {
				...filters,
				trans_date: [[dbDate(dateRangeFilter[0]), dbDate(dateRangeFilter[1])]],
				...(is_super_admin && { city_id: cityFilter ? [cityFilter] : null }),
			},
			...sorter,
		});

		// `dataSource` is useless since `pageSize` changed
		if (pagination.pageSize !== tablePage.pagination?.pageSize) {
			setData([]);
		}
	};

	const onDateRangeChange = (values) => {
		let useStart = values[0];
		let useEnd = values[1];
		let startYear = convertDate(useStart, "YYYY");
		let endYear = convertDate(useEnd, "YYYY");

		if (startYear !== endYear) {
			useEnd = convertDate(useStart).endOf("year");
			setDateRangeFilter([useStart, useEnd]);
		} else {
			setDateRangeFilter(values);
		}

		setTableFiltered({});
		setTableSorted({});
		getData({
			...PAGINATION,
			filters: {
				trans_date: [[dbDate(useStart), dbDate(useEnd)]],
				...(is_super_admin && { city_id: cityFilter ? [cityFilter] : null }),
			},
		});
	};

	const onCityChange = (value) => {
		setCityFilter(value);
		setTableFiltered({});
		setTableSorted({});
		getData({
			...PAGINATION,
			filters: {
				trans_date: [[dbDate(dateRangeFilter[0]), dbDate(dateRangeFilter[1])]],
				...(is_super_admin && { city_id: value ? [value] : null }),
			},
		});
	};

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
				city_logo: base[0]?.city_logo,
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

		if (isNaN(results) || !isFinite(Number(results))) return 0;

		return results;
	};

	useEffect(() => getData(PAGINATION), []);

	return (
		<>
			<div className="flex flex-col mb-1 space-y-2 sm:space-y-0 sm:space-x-2 sm:flex-row md:space-y-0 md:space-x-2 md:flex-row">
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
						onChange={onDateRangeChange}
						value={dateRangeFilter}
						disabledDate={(curr) => {
							const isNextYear =
								curr &&
								convertDate(curr, "YYYY") > convertDate(convertDate(), "YYYY");

							return isNextYear;
						}}
					/>
				</div>
				{is_super_admin && (
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
								(lower(option?.label) ?? "").includes(lower(input))
							}
							loading={loading}
							options={cities}
							onChange={onCityChange}
							value={cityFilter}
						/>
					</div>
				)}
				<ReloadButton onClick={reloadTable} stateLoading={loading} />
				{!!exports?.length && (cityFilter || !is_super_admin) && (
					<ExportButton
						data={exports}
						date={dateRangeFilter}
						report={`kota`}
						pdfOrientation="landscape"
						fileName="LAPORAN-REALISASI-ANGGARAN-KOTA"
					/>
				)}
			</div>
			{!!accountBase.length && (
				<div className="flex flex-col mx-0.5 pb-2 space-x-0 space-y-2 md:space-x-2 md:space-y-0 md:flex-row">
					<Card
						size="small"
						title={<span className="text-xs">Anggaran</span>}
						bodyStyle={{ padding: 0, margin: 0 }}
						className="text-center w-full md:w-1/2"
					>
						<Pie {...pieConfig} data={piePlan} loading={loading} />
					</Card>
					<Card
						size="small"
						title={<span className="text-xs">Realisasi</span>}
						bodyStyle={{ padding: 0, margin: 0 }}
						className="text-center w-full md:w-1/2"
					>
						<Pie {...pieConfig} data={pieReal} loading={loading} />
					</Card>
				</div>
			)}
			<Table
				scroll={{
					scrollToFirstRowOnChange: true,
					x: "100%",
				}}
				bordered
				size="small"
				loading={loading}
				dataSource={data}
				columns={columns}
				rowKey={(record) => `${record?.account_object_id}_${record?.city_id}`}
				onChange={onTableChange}
				pagination={tablePage.pagination}
				tableLayout="auto"
			/>
		</>
	);
}
