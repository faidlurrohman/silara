import React, { useEffect, useRef, useState } from "react";
import { DatePicker, Select, Table } from "antd";
import axios from "axios";
import ReloadButton from "../../components/button/ReloadButton";
import { getCityList } from "../../services/city";
import { DATE_FORMAT_VIEW, PAGINATION } from "../../helpers/constants";
import { convertDate, dbDate } from "../../helpers/date";
import useRole from "../../hooks/useRole";
import { getRealPlanCities } from "../../services/report";
import { responseGet } from "../../helpers/response";
import { searchColumn } from "../../helpers/table";
import { formatterNumber } from "../../helpers/number";
import { upper } from "../../helpers/typo";
import _ from "lodash";
import ExportButton from "../../components/button/ExportButton";

const { RangePicker } = DatePicker;

export default function AnggaranKota() {
	const { role_id } = useRole();

	const searchInput = useRef(null);
	const [filtered, setFiltered] = useState({});
	const [sorted, setSorted] = useState({});
	const [dateRangeFilter, setDateRangeFilter] = useState([
		convertDate().startOf("year"),
		convertDate(),
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
	const [exports, setExports] = useState([]);
	const [loading, setLoading] = useState(false);

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

					if (role_id !== 1) onCityFilterChange(_cities?.data?.data[0]?.id);
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
		setDateRangeFilter([convertDate().startOf("year"), convertDate()]);
		setFiltered({});
		setSorted({});
		setTableParams({
			...PAGINATION,
			filters: {
				city_id: null,
				trans_date: [
					[dbDate(convertDate().startOf("year")), dbDate(convertDate())],
				],
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

		if (isNaN(results)) return 0;

		return results;
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
						value={cityFilter}
					/>
				</div>
				<ReloadButton onClick={reloadTable} stateLoading={loading} />
				{!!exports?.length && cityFilter && (
					<ExportButton
						data={exports}
						date={dateRangeFilter}
						report={`kota`}
						pdfOrientation="landscape"
						fileName="LAPORAN-REALISASI-ANGGARAN-KOTA"
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
					dataSource={data}
					columns={columns}
					rowKey={(record) => `${record?.account_object_id}_${record?.city_id}`}
					onChange={onTableChange}
					pagination={tableParams.pagination}
				/>
			</div>
		</>
	);
}
