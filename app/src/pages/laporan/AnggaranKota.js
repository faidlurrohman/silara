import { DatePicker, Select, Table } from "antd";
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
import { formatterNumber } from "../../helpers/number";
import { lower, upper } from "../../helpers/typo";
import ExportButton from "../../components/button/ExportButton";
import { Pie } from "@ant-design/plots";

const { RangePicker } = DatePicker;

const pieConfig = {
	appendPadding: 10,
	style: { height: 250 },
	angleField: "value",
	colorField: "type",
	radius: 0.75,
	label: {
		type: "spider",
		labelHeight: 20,
		content: "{name}\n{percentage}",
		style: { fontSize: 12 },
	},
	legend: false,
	tooltip: false,
	interactions: [
		{
			type: "element-selected",
		},
		{
			type: "element-active",
		},
	],
};

export default function AnggaranKota() {
	const { is_super_admin } = useRole();
	const [data, setData] = useState([]);
	const [pieData, setPieData] = useState([]);
	const [exports, setExports] = useState([]);
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
			])
			.then(
				axios.spread((_data, _export, _cities) => {
					setLoading(false);
					setCities(_cities?.data?.data || []);
					setData(responseGet(_data).data);
					setExports(setDataExport(responseGet(_export).data));
					setTablePage({
						pagination: {
							...params.pagination,
							total: responseGet(_data).total_count,
						},
					});

					if (!!responseGet(_export).data?.length) {
						makeChartData(responseGet(_export).data);
					}
				})
			);
	};

	const makeChartData = (values) => {
		let _plan = 0,
			_real = 0,
			_planPercent = 0,
			_realPercent = 0;

		_.map(values, (item) => {
			_plan += parseFloat(item?.account_object_plan_amount || 0);
			_real += parseFloat(item?.account_object_real_amount || 0);
		});

		_planPercent = (_plan / (_plan + _real)) * 100;
		_realPercent = (_real / (_plan + _real)) * 100;

		// jumlah real atau plan / jumlah keseluruhan * 100
		setPieData([
			{
				type: "Anggaran",
				value: isNaN(_planPercent) ? 0 : _planPercent,
			},
			{
				type: "Realisasi",
				value: isNaN(_realPercent) ? 0 : _realPercent,
			},
		]);
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
			{!!pieData?.length && <Pie {...pieConfig} data={pieData} />}
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
