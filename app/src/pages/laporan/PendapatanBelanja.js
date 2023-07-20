import React, { useEffect, useRef, useState } from "react";
import { DatePicker, Select, Table } from "antd";
import axios from "axios";
import ReloadButton from "../../components/button/ReloadButton";
import { getCityList } from "../../services/city";
import { DATE_FORMAT_VIEW, PAGINATION } from "../../helpers/constants";
import { convertDate, dbDate } from "../../helpers/date";
import { getRecapitulationCities } from "../../services/report";
import { responseGet } from "../../helpers/response";
import { searchColumn } from "../../helpers/table";
import { formatterNumber } from "../../helpers/number";
import _ from "lodash";
import ExportButton from "../../components/button/ExportButton";
import { lower } from "../../helpers/typo";

const { RangePicker } = DatePicker;

export default function PendapatanBelanja() {
	const [data, setData] = useState([]);
	const [cities, setCities] = useState([]);
	const [exports, setExports] = useState([]);
	const [loading, setLoading] = useState(false);

	const tableFilterInputRef = useRef(null);
	const [tableFiltered, setTableFiltered] = useState({});
	const [tableSorted, setTableSorted] = useState({});
	const [dateRangeFilter, setDateRangeFilter] = useState([
		convertDate().startOf("year"),
		convertDate(),
	]);
	const [cityFilter, setCityFilter] = useState([]);
	const [tablePage, setTablePage] = useState(PAGINATION);

	const getData = (params) => {
		setLoading(true);
		axios
			.all([
				getRecapitulationCities(params),
				getRecapitulationCities({
					...params,
					pagination: { ...params.pagination, pageSize: 0 },
				}),
				getCityList(),
			])
			.then(
				axios.spread((_data, _export, _cities) => {
					setLoading(false);
					setData(responseGet(_data).data);
					setCities(_cities?.data?.data || []);
					setExports(setDataExport(responseGet(_export).data));
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
		setDateRangeFilter([convertDate().startOf("year"), convertDate()]);
		setCityFilter([]);
		getData({
			...PAGINATION,
			filters: {
				trans_date: [
					[dbDate(convertDate().startOf("year")), dbDate(convertDate())],
				],
				city_id: null,
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
				city_id: cityFilter ? [cityFilter] : null,
			},
			...sorter,
		});

		// `dataSource` is useless since `pageSize` changed
		if (pagination.pageSize !== tablePage.pagination?.pageSize) {
			setData([]);
		}
	};

	const onDateRangeFilterChange = (values) => {
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
				city_id: cityFilter ? [cityFilter] : null,
			},
		});
	};

	const onCityFilterChange = (value) => {
		setCityFilter(value);
		setTableFiltered({});
		setTableSorted({});
		getData({
			...PAGINATION,
			filters: {
				trans_date: [[dbDate(dateRangeFilter[0]), dbDate(dateRangeFilter[1])]],
				city_id: value ? [value] : null,
			},
		});
	};

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
			"Kota",
			null,
			true,
			tableSorted
		),
		searchColumn(
			tableFilterInputRef,
			"account_base_label",
			"Akun Rekening",
			tableFiltered,
			true,
			tableSorted
		),
		searchColumn(
			tableFilterInputRef,
			"account_base_plan_amount",
			"Anggaran",
			tableFiltered,
			true,
			tableSorted,
			"int"
		),
		searchColumn(
			tableFilterInputRef,
			"account_base_real_amount",
			"Realisasi",
			tableFiltered,
			true,
			tableSorted,
			"int"
		),
	];

	const setDataExport = (data) => {
		let results = { bases: [], cities: [], data: [] };

		// sorting
		let srt = _.sortBy(data, ["account_base_label", "city_label"]);

		// take all base
		results.bases = _.chain(srt)
			.groupBy("account_base_label")
			.map((values, label) => ({
				base: label,
				base_id: values[0].account_base_id,
				children: values,
			}))
			.value();

		// take all city
		results.cities = _.chain(srt)
			.groupBy("city_label")
			.map((values, label) => ({
				city: label,
				city_id: values[0].city_id,
				children: values,
			}))
			.value();

		// set data per-city
		_.map(results?.cities, (city, index) => {
			let d = { no: index + 1, label: city?.city };
			_.map(results.bases, (base) => {
				let fb = city?.children.find(
					(i) => i?.account_base_label === base?.base
				);

				if (fb) {
					d[`${base?.base_id}_plan_amount`] = formatterNumber(
						fb?.account_base_plan_amount
					);
					d[`${base?.base_id}_real_amount`] = formatterNumber(
						fb?.account_base_real_amount
					);
					d[`${base?.base_id}_percentage`] = sumPercentage(
						fb?.account_base_real_amount,
						fb?.account_base_plan_amount
					);
				} else {
					d[`${base?.base_id}_plan_amount`] = 0;
					d[`${base?.base_id}_real_amount`] = 0;
					d[`${base?.base_id}_percentage`] = 0;
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
						disabledDate={(curr) => {
							const isNextYear =
								curr &&
								convertDate(curr, "YYYY") > convertDate(convertDate(), "YYYY");

							return isNextYear;
						}}
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
							(lower(option?.label) ?? "").includes(lower(input))
						}
						loading={loading}
						options={cities}
						onChange={onCityFilterChange}
						value={cityFilter}
					/>
				</div>
				<ReloadButton onClick={reloadTable} stateLoading={loading} />
				{!!exports?.data?.length && (
					<ExportButton
						data={exports}
						date={dateRangeFilter}
						report={`rekapitulasi`}
						pdfOrientation="landscape"
						fileName="LAPORAN-REALISASI-ANGGARAN-GABUNGAN-KOTA"
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
					dataSource={data}
					columns={columns}
					rowKey={(record) => `${record?.account_base_id}_${record?.city_id}`}
					onChange={onTableChange}
					pagination={tablePage.pagination}
					tableLayout="auto"
				/>
			</div>
		</>
	);
}
