import { useEffect, useMemo, useState } from "react";
import {
	Avatar,
	Card,
	DatePicker,
	Progress,
	Select,
	Space,
	Statistic,
} from "antd";
import {
	COLORS,
	DATE_FORMAT_VIEW,
	MONTHS,
	PAGINATION,
} from "../helpers/constants";
import { convertDate, dbDate, viewDate } from "../helpers/date";
import { lower, upper } from "../helpers/typo";
import ReloadButton from "../components/button/ReloadButton";
import { getDashboard, getRecapYears } from "../services/dashboard";
import axios from "axios";
import { responseGet } from "../helpers/response";
import { getCityList } from "../services/city";
import useRole from "../hooks/useRole";
import CountUp from "react-countup";
import _ from "lodash";
import { Line } from "@ant-design/plots";
import { PercentageOutlined } from "@ant-design/icons";
import { parserNumber } from "../helpers/number";

const { RangePicker } = DatePicker;

export default function Beranda() {
	// ambil tahun sekarang
	let _cy = convertDate().endOf("year");
	// ambil 3 tahun sebelumnya dari tahun sekarang
	let _by = convertDate().startOf("year").subtract(2, "year");

	const { is_super_admin } = useRole();
	const [data, setData] = useState([]);
	const [recap, setRecap] = useState([]);
	const [isNoFilter, setIsNoFilter] = useState(true);
	const [cities, setCities] = useState([]);
	const [loading, setLoading] = useState(false);
	const [dateRangeFilter, setDateRangeFilter] = useState([_by, _cy]);
	const [cityFilter, setCityFilter] = useState([]);

	// config graph
	const lineConfig = {
		style: { height: 500 },
		xField: "month_year",
		yField: "value",
		seriesField: "name",
		yAxis: {
			label: {
				formatter: (v) => parserNumber(v),
			},
		},
		legend: {
			position: "top",
		},
		scrollbar: { type: "horizontal" },
		color: [COLORS.success, COLORS.info, COLORS.danger],
	};

	const getData = (params, isDefaultFilter = true) => {
		setLoading(true);
		axios
			.all([
				getDashboard({
					...params,
					pagination: { ...params.pagination, pageSize: 0 },
				}),
				getRecapYears({
					...params,
					filters: {
						...params?.filters,
						trans_date: isDefaultFilter
							? [[dbDate(_by), dbDate(_cy)]]
							: params?.filters?.trans_date,
					},
					pagination: { ...params.pagination, pageSize: 0 },
				}),
				getCityList(),
			])
			.then(
				axios.spread((_data, _recap, _cities) => {
					setLoading(false);
					setData(responseGet(_data).data);
					setCities(_cities?.data?.data || []);
					makeGraph(responseGet(_recap).data, params, isDefaultFilter);
				})
			);
	};

	const makeGraph = (values, params, useDefault) => {
		// init tampung data array daru graph
		let _result = [];

		// init tampung data awal tahun, akhir tahun, awal bulan, akhir bulan, dan tresh untuk loop
		let _startYear = parseInt(convertDate(_by, "YYYY")),
			_endYear = parseInt(convertDate(_cy, "YYYY")),
			_startMonth = 0,
			_endMonth = 12,
			_tresh = 0;

		// cek apakah memakai filter atau tidak
		if (!useDefault) {
			_startYear = parseInt(params?.filters?.trans_date[0][0].split("-")[0]);
			_endYear = parseInt(params?.filters?.trans_date[0][1].split("-")[0]);
			_startMonth =
				parseInt(params?.filters?.trans_date[0][0].split("-")[1]) - 1;
			_endMonth = parseInt(params?.filters?.trans_date[0][1].split("-")[1]);
		}

		_tresh = _endYear - _startYear;

		// looping untuk tampung bulan pertahun
		for (let a = 0; a <= _tresh; a++) {
			// init tampung dinamik data loop
			let b = a === 0 ? _startMonth : 0;
			let tb = a === _tresh ? _endMonth : MONTHS.length;

			// looping data bulan
			for (b; b < tb; b++) {
				// set month index untuk kebutuhan filter
				let _mi = b + 1 < 10 ? `0${b + 1}` : String(b + 1);
				let _sy = String(_startYear);

				// cari data untuk pendapatan
				let _fpl = _.filter(
					values,
					(o) =>
						lower(o?.account_base_label).includes(lower("pendapatan")) &&
						o?.trans_date.split("-")[0] === _sy &&
						o?.trans_date.split("-")[1] === _mi
				);

				// cari data untuk pembiayaan
				let _fpl2 = _.filter(
					values,
					(o) =>
						lower(o?.account_base_label).includes(lower("pembiayaan")) &&
						o?.trans_date.split("-")[0] === _sy &&
						o?.trans_date.split("-")[1] === _mi
				);

				// cari data untuk belanja
				let _fpl3 = _.filter(
					values,
					(o) =>
						lower(o?.account_base_label).includes(lower("belanja")) &&
						o?.trans_date.split("-")[0] === _sy &&
						o?.trans_date.split("-")[1] === _mi
				);

				// jika ada pendapatan langsung jumlah
				if (_fpl && !!_fpl.length) {
					_result.push({
						name: "Pendapatan",
						month_year: `${MONTHS[b]} (${_sy})`,
						value: _.sumBy(_fpl, "account_base_real_amount"),
					});
				} else {
					_result.push({
						name: "Pendapatan",
						month_year: `${MONTHS[b]} (${_sy})`,
						value: 0,
					});
				}

				// jika ada pembiayaan langsung jumlah
				if (_fpl2 && !!_fpl2.length) {
					_result.push({
						name: "Pembiayaan",
						month_year: `${MONTHS[b]} (${_sy})`,
						value: _.sumBy(_fpl2, "account_base_real_amount"),
					});
				} else {
					_result.push({
						name: "Pembiayaan",
						month_year: `${MONTHS[b]} (${_sy})`,
						value: 0,
					});
				}

				// jika ada pembiayaan langsung jumlah
				if (_fpl3 && !!_fpl3.length) {
					_result.push({
						name: "Belanja",
						month_year: `${MONTHS[b]} (${_sy})`,
						value: _.sumBy(_fpl3, "account_base_real_amount"),
					});
				} else {
					_result.push({
						name: "Belanja",
						month_year: `${MONTHS[b]} (${_sy})`,
						value: 0,
					});
				}
			}

			// extend year
			_startYear += 1;
		}

		// append ke state
		setRecap(_result);
	};

	const reloadData = () => {
		getData(
			{
				...PAGINATION,
				filters: {
					trans_date: [
						[dbDate(dateRangeFilter[0]), dbDate(dateRangeFilter[1])],
					],
					...(is_super_admin && { city_id: cityFilter ? [cityFilter] : null }),
				},
			},
			isNoFilter
		);
	};

	const resetData = () => {
		setIsNoFilter(true);
		setDateRangeFilter([_by, _cy]);
		setCityFilter([]);
		getData(
			{
				...PAGINATION,
				filters: {
					trans_date: [[dbDate(_by), dbDate(_cy)]],
					...(is_super_admin && { city_id: null }),
				},
			},
			true
		);
	};

	const onDateRangeFilterChange = (values) => {
		// let useStart = values[0];
		// let useEnd = values[1];
		// let startYear = convertDate(useStart, "YYYY");
		// let endYear = convertDate(useEnd, "YYYY");

		// if (startYear !== endYear) {
		// 	useEnd = convertDate(useStart).endOf("year");
		// 	setDateRangeFilter([useStart, useEnd]);
		// } else {
		setDateRangeFilter(values);
		// }

		setIsNoFilter(false);

		getData(
			{
				...PAGINATION,
				filters: {
					trans_date: [[dbDate(values[0]), dbDate(values[1])]],
					...(is_super_admin && { city_id: cityFilter ? [cityFilter] : null }),
				},
			},
			false
		);
	};

	const onCityFilterChange = (value) => {
		setIsNoFilter(false);
		setCityFilter(value);
		getData(
			{
				...PAGINATION,
				filters: {
					trans_date: [
						[dbDate(dateRangeFilter[0]), dbDate(dateRangeFilter[1])],
					],
					...(is_super_admin && { city_id: value ? [value] : null }),
				},
			},
			false
		);
	};

	const countBy = (target, useFor) => {
		if (data && !!data.length) {
			let _ft = _.filter(data, (o) =>
				lower(o?.account_base_label).includes(lower(target))
			);

			return _.sumBy(_ft, `account_base_${useFor}_amount`);
		} else {
			return 0;
		}
	};

	const sumPercentage = (value1 = 0, value2 = 0, results = 0) => {
		if ([null, undefined, ""].includes(value1)) value1 = 0;
		if ([null, undefined, ""].includes(value2)) value2 = 0;

		results = parseFloat((value1 / value2) * 100).toFixed(0);

		if (isNaN(results) || !isFinite(Number(results))) return 0;

		return results;
	};

	const graphTitle = useMemo(() => {
		let sd1 = !isNoFilter
			? viewDate(dateRangeFilter[0]).split(" ")
			: viewDate(_by).split(" ");
		let sd2 = !isNoFilter
			? viewDate(dateRangeFilter[1]).split(" ")
			: viewDate(_cy).split(" ");

		return upper(
			`GRAFIK REALISASI PERIODE ${sd1[1]} ${sd1[2]} - ${sd2[1]} ${sd2[2]}`
		);
	}, [isNoFilter, dateRangeFilter, _cy, _by]);

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
				{is_super_admin && (
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
				)}
				<ReloadButton onClick={reloadData} stateLoading={loading} />
				{!isNoFilter && (
					<ReloadButton
						title="Reset Filter"
						onClick={resetData}
						stateLoading={loading}
					/>
				)}
			</div>
			<div className="flex flex-col mx-0.5 pb-2">
				<Card
					loading={loading}
					size="small"
					title={
						<Space>
							<Avatar
								size="small"
								className="bg-secondary"
								icon={<PercentageOutlined />}
							/>
							<span className="text-xs">
								TOTAL PENDAPATAN, PEMBIAYAAN DAN BELANJA DAERAH
							</span>
						</Space>
					}
					className="text-center w-full md:text-left"
				>
					<Statistic
						prefix={
							<span className="text-xs">
								Anggaran<span className="pl-9">:</span>
							</span>
						}
						value={_.sumBy(data, "account_base_plan_amount")}
						formatter={(value) => (
							<CountUp
								end={value}
								className="text-xs font-bold"
								prefix="Rp. "
							/>
						)}
					/>
					<Statistic
						prefix={
							<span className="text-xs">
								Realisasi<span className="pl-10">:</span>
							</span>
						}
						value={_.sumBy(data, "account_base_real_amount")}
						formatter={(value) => (
							<CountUp
								end={value}
								className="text-xs font-bold"
								prefix="Rp. "
							/>
						)}
					/>
					<div className="h-auto w-auto pt-2">
						{/*
						<span class="absolute text-secondary pt-[0.2em] left-[48%] z-10">
							{`${sumPercentage(
								_.sumBy(data, "account_base_real_amount"),
								_.sumBy(data, "account_base_plan_amount")
							)}%`}
						</span> */}
						<Progress
							className="font-bold"
							format={() =>
								`${sumPercentage(
									_.sumBy(data, "account_base_real_amount") / 2,
									_.sumBy(data, "account_base_plan_amount")
								)}%`
							}
							percent={sumPercentage(
								_.sumBy(data, "account_base_real_amount") / 2,
								_.sumBy(data, "account_base_plan_amount")
							)}
							size={[_, 25]}
							strokeColor={COLORS.secondary}
							status="normal"
						/>
					</div>
				</Card>
			</div>
			<div className="flex flex-col mx-0.5 pb-2 space-x-0 space-y-2 md:space-x-2 md:space-y-0 md:flex-row">
				{/* PENDAPATAN DAERAH */}
				<Card
					loading={loading}
					size="small"
					title={
						<Space>
							<Avatar
								size="small"
								className="bg-success"
								icon={<PercentageOutlined />}
							/>
							<span className="text-xs">PENDAPATAN DAERAH</span>
						</Space>
					}
					className="text-center w-full md:w-1/3 md:text-left"
				>
					<Statistic
						prefix={
							<span className="text-xs">
								Anggaran<span className="pl-9">:</span>
							</span>
						}
						value={countBy("pendapatan", "plan")}
						formatter={(value) => (
							<CountUp
								end={value}
								className="text-xs font-bold"
								prefix="Rp. "
							/>
						)}
					/>
					<Statistic
						prefix={
							<span className="text-xs">
								Realisasi<span className="pl-10">:</span>
							</span>
						}
						value={countBy("pendapatan", "real")}
						formatter={(value) => (
							<CountUp
								end={value}
								className="text-xs font-bold"
								prefix="Rp. "
							/>
						)}
					/>
					<div className="h-auto w-auto pt-2">
						<Progress
							className="font-bold"
							format={() =>
								`${sumPercentage(
									countBy("pendapatan", "real"),
									countBy("pendapatan", "plan")
								)}%`
							}
							percent={sumPercentage(
								countBy("pendapatan", "real"),
								countBy("pendapatan", "plan")
							)}
							size={[_, 25]}
							strokeColor={COLORS.success}
							status="normal"
						/>
					</div>
				</Card>
				{/* PEMBIAYAAN DAERAH */}
				<Card
					loading={loading}
					size="small"
					title={
						<Space>
							<Avatar
								size="small"
								className="bg-info"
								icon={<PercentageOutlined />}
							/>
							<span className="text-xs">PEMBIAYAAN DAERAH</span>
						</Space>
					}
					className="text-center w-full md:w-1/3 md:text-left"
				>
					<Statistic
						prefix={
							<span className="text-xs">
								Anggaran<span className="pl-9">:</span>
							</span>
						}
						value={countBy("pembiayaan", "plan")}
						formatter={(value) => (
							<CountUp
								end={value}
								className="text-xs font-bold"
								prefix="Rp. "
							/>
						)}
					/>
					<Statistic
						prefix={
							<span className="text-xs">
								Realisasi<span className="pl-10">:</span>
							</span>
						}
						value={countBy("pembiayaan", "real")}
						formatter={(value) => (
							<CountUp
								end={value}
								className="text-xs font-bold"
								prefix="Rp. "
							/>
						)}
					/>
					<div className="h-auto w-auto pt-2">
						<Progress
							className="font-bold"
							format={() =>
								`${sumPercentage(
									countBy("pembiayaan", "real"),
									countBy("pembiayaan", "plan")
								)}%`
							}
							percent={sumPercentage(
								countBy("pembiayaan", "real"),
								countBy("pembiayaan", "plan")
							)}
							size={[_, 25]}
							strokeColor={COLORS.info}
							status="normal"
						/>
					</div>
				</Card>
				{/* BELANJA DAERAH */}
				<Card
					loading={loading}
					size="small"
					title={
						<Space>
							<Avatar
								size="small"
								className="bg-danger"
								icon={<PercentageOutlined />}
							/>
							<span className="text-xs">BELANJA DAERAH</span>
						</Space>
					}
					className="text-center w-full md:w-1/3 md:text-left"
				>
					<Statistic
						prefix={
							<span className="text-xs">
								Anggaran<span className="pl-9">:</span>
							</span>
						}
						value={countBy("belanja", "plan")}
						formatter={(value) => (
							<CountUp
								end={value}
								className="text-xs font-bold"
								prefix="Rp. "
							/>
						)}
					/>
					<Statistic
						prefix={
							<span className="text-xs">
								Realisasi<span className="pl-10">:</span>
							</span>
						}
						value={countBy("belanja", "real")}
						formatter={(value) => (
							<CountUp
								end={value}
								className="text-xs font-bold"
								prefix="Rp. "
							/>
						)}
					/>
					<div className="h-auto w-auto pt-2">
						<Progress
							className="font-bold"
							format={() =>
								`${sumPercentage(
									countBy("belanja", "real"),
									countBy("belanja", "plan")
								)}%`
							}
							percent={sumPercentage(
								countBy("belanja", "real"),
								countBy("belanja", "plan")
							)}
							size={[_, 25]}
							strokeColor={COLORS.danger}
							status="normal"
						/>
					</div>
				</Card>
			</div>
			<div className="flex mx-0.5 pb-2">
				<Card
					size="small"
					title={<span className="text-xs">{graphTitle}</span>}
					className="text-center w-full"
				>
					<Line {...lineConfig} data={recap} loading={loading} />
				</Card>
			</div>
		</>
	);
}
