import React from "react";
import {
	Page,
	Text,
	View,
	Document,
	StyleSheet,
	Image,
} from "@react-pdf/renderer";
import { EXPORT_TARGET } from "../helpers/constants";
import _ from "lodash";
import { formatterNumber } from "../helpers/number";
import logoKemendagri from "../assets/images/logo-kemendagri.png";
import { upper } from "../helpers/typo";
import { viewDate } from "../helpers/date";

export default function PDFFile({
	master = null,
	report = null,
	data = [],
	date = null,
	orientation = "portrait",
	signer = {},
}) {
	let recapitulate_headers = [];

	const createReportHeader = () => {
		if (report === "kota") {
			const chooseCity = data[0].city_label || "";

			return (
				<View style={styles.reportHeader}>
					<Image style={styles.logoKemendagri} src={logoKemendagri} />
					<View style={styles.reportHeaderTitle}>
						<Text style={styles.reportTitle}>
							{upper(`PEMERINTAHAN ${chooseCity}`)}
						</Text>
						<Text style={styles.reportTitle}>
							LAPORAN REALISASI ANGGARAN PENDAPATAN DAN BELANJA DAERAH
							(KONSOLIDASI)
						</Text>
						<Text style={styles.reportTitle}>
							{upper(`Tahun Anggaran ${viewDate(date[1]).split(" ").pop()}`)}
						</Text>
						<Text style={styles.reportTitle}>
							{upper(`${viewDate(date[0])} Sampai ${viewDate(date[1])}`)}
						</Text>
					</View>
					{["", null, undefined].includes(data[0]?.city_logo) ? (
						<Image style={styles.logoKemendagri} src={logoKemendagri} />
					) : (
						<Image
							style={styles.logoCity}
							src={`${process.env.REACT_APP_BASE_URL_API}/app/logo/${data[0]?.city_logo}`}
						/>
					)}
				</View>
			);
		}

		if (report === "rekapitulasi") {
			return (
				<View style={styles.reportHeader}>
					<View style={styles.reportHeaderTitle}>
						<Text style={styles.reportTitle}>
							REKAPITULASI PENDAPATAN DAN BELANJA
						</Text>
						<Text style={styles.reportTitle}>
							{upper(
								`apbd kabupaten/kota se-provinsi kepulauan riau tahun anggaran ${viewDate(
									date[1]
								)
									.split(" ")
									.pop()}`
							)}
						</Text>
						<Text style={styles.reportTitle}>
							{upper(`per ${viewDate(date[1])}`)}
						</Text>
					</View>
				</View>
			);
		}
	};

	const createTableHeader = () => {
		if (master) {
			return (
				<View style={styles.tableRowHeader}>
					{_.map(EXPORT_TARGET[master].headers, (item, index) => (
						<View
							key={index}
							style={
								index === 0
									? styles.tableMasterColIndex
									: {
											...styles.tableMasterColInherit,
											width: `${
												90 / EXPORT_TARGET[master].headers.length - 1
											}%`,
									  }
							}
						>
							<Text style={styles.tableCellHeader}>{item?.header}</Text>
						</View>
					))}
				</View>
			);
		}

		if (report === "kota") {
			return (
				<View style={styles.tableRowHeader}>
					<View
						style={{
							...styles.tableMasterColIndex,
							width: "15%",
						}}
					>
						<Text style={styles.tableCellHeaderReport}>KODE REKENING</Text>
					</View>
					<View
						style={{
							...styles.tableMasterColInherit,
							width: "35%",
						}}
					>
						<Text style={styles.tableCellHeaderReport}>URAIAN</Text>
					</View>
					<View
						style={{
							...styles.tableMasterColInherit,
							width: "15%",
						}}
					>
						<Text style={styles.tableCellHeaderReport}>ANGGARAN</Text>
					</View>
					<View
						style={{
							...styles.tableMasterColInherit,
							width: "15%",
						}}
					>
						<Text style={styles.tableCellHeaderReport}>REALISASI</Text>
					</View>
					<View
						style={{
							...styles.tableMasterColInherit,
							width: "15%",
						}}
					>
						<Text style={styles.tableCellHeaderReport}>
							{`% ${viewDate(date[1]).split(" ").pop()}`}
						</Text>
					</View>
				</View>
			);
		}

		if (report === "rekapitulasi") {
			if (data?.bases && data?.bases.length) {
				recapitulate_headers = _.sortBy(data?.bases, ["base"]).reverse();
			}

			return (
				<View style={{ margin: "auto", flexDirection: "row" }}>
					<View style={{ width: "4%", borderStyle: "solid", borderWidth: 1 }}>
						<Text
							style={{
								margin: "auto",
								paddingHorizontal: 2,
								fontSize: 10,
								fontWeight: "bold",
							}}
						>
							No
						</Text>
					</View>
					<View
						style={{
							width: "20%",
							borderStyle: "solid",
							borderWidth: 1,
							borderLeftWidth: 0,
						}}
					>
						<Text
							style={{
								margin: "auto",
								paddingHorizontal: 2,
								fontSize: 10,
								fontWeight: "bold",
								textTransform: "uppercase",
							}}
						>
							Kabupaten / Kota
						</Text>
					</View>
					{!!recapitulate_headers.length &&
						_.map(recapitulate_headers, (item) => (
							<View
								key={String(item?.base_id)}
								style={{
									width: "36%",
									borderStyle: "solid",
									borderWidth: 1,
									borderLeftWidth: 0,
									flexDirection: "row",
								}}
							>
								<View style={{ flexDirection: "column" }}>
									<View
										style={{
											borderStyle: "solid",
											borderWidth: 1,
											borderLeftWidth: 0,
											borderRightWidth: 0,
											borderTopWidth: 0,
										}}
									>
										<Text
											style={{
												margin: "auto",
												paddingHorizontal: 2,
												fontSize: 10,
												fontWeight: "bold",
											}}
										>
											{upper(item?.base)}
										</Text>
									</View>
									<View style={{ margin: "auto", flexDirection: "row" }}>
										<View
											style={{
												width: "50%",
												borderStyle: "solid",
												borderWidth: 1,
												borderLeftWidth: 0,
												borderTopWidth: 0,
											}}
										>
											<Text
												style={{
													margin: "auto",
													paddingHorizontal: 2,
													fontSize: 10,
													fontWeight: "bold",
												}}
											>
												TARGET
											</Text>
										</View>
										<View
											style={{
												width: "50%",
												borderStyle: "solid",
												borderWidth: 1,
												borderLeftWidth: 0,
												borderRightWidth: 0,
												borderTopWidth: 0,
											}}
										>
											<Text
												style={{
													margin: "auto",
													paddingHorizontal: 2,
													fontSize: 10,
													fontWeight: "bold",
												}}
											>
												REALISASI
											</Text>
										</View>
									</View>
									<View style={{ margin: "auto", flexDirection: "row" }}>
										<View
											style={{
												width: "50%",
												borderStyle: "solid",
												borderWidth: 1,
												borderLeftWidth: 0,
												borderTopWidth: 0,
												borderBottomWidth: 0,
											}}
										>
											<Text
												style={{
													margin: "auto",
													paddingHorizontal: 2,
													fontSize: 10,
													fontWeight: "bold",
												}}
											>
												(Rp)
											</Text>
										</View>
										<View style={{ width: "50%" }}>
											<Text
												style={{
													margin: "auto",
													paddingHorizontal: 2,
													fontSize: 10,
													fontWeight: "bold",
												}}
											>
												(Rp)
											</Text>
										</View>
									</View>
								</View>
								<View
									style={{
										width: "30%",
										borderStyle: "solid",
										borderWidth: 1,
										borderLeftWidth: 1,
										borderRightWidth: 0,
										borderTopWidth: 0,
										borderBottomWidth: 0,
									}}
								>
									<Text
										style={{
											margin: "auto",
											paddingHorizontal: 2,
											fontSize: 10,
											fontWeight: "bold",
										}}
									>
										%
									</Text>
								</View>
							</View>
						))}
				</View>
			);
		}
	};

	const createTableRow = () => {
		if (master) {
			return _.map(data, (parent, indexParent) => (
				<View key={indexParent} style={styles.tableRow}>
					{_.map(EXPORT_TARGET[master].headers, (child, indexChild) => (
						<View
							key={indexChild}
							style={
								indexChild === 0
									? styles.tableMasterRowIndex
									: {
											...styles.tableMasterRowInherit,
											width: `${
												90 / EXPORT_TARGET[master].headers.length - 1
											}%`,
									  }
							}
						>
							<Text style={styles.tableCell}>
								{child?.key === "no"
									? (indexParent += 1)
									: child?.key === "active"
									? parent[child?.key]
										? "Ya"
										: "Tidak"
									: child?.key.includes("amount")
									? formatterNumber(parent[child?.key])
									: parent[child?.key]}
							</Text>
						</View>
					))}
				</View>
			));
		}

		if (report === "kota") {
			return _.map(data, (parent, indexParent) => (
				<View key={indexParent} style={styles.tableRowReport}>
					<View
						style={{
							...styles.tableMasterRowIndex,
							width: "15%",
						}}
					>
						<Text style={{ ...styles.tableCellReport, textAlign: "left" }}>
							{parent?.code}
						</Text>
					</View>
					<View
						style={{
							...styles.tableMasterRowInherit,
							width: "35%",
						}}
					>
						<Text style={{ ...styles.tableCellReport, textAlign: "left" }}>
							{parent?.label}
						</Text>
					</View>
					<View
						style={{
							...styles.tableMasterRowInherit,
							width: "15%",
						}}
					>
						<Text style={{ ...styles.tableCellReport, textAlign: "right" }}>
							{parent?.plan_amount !== "" &&
								formatterNumber(parent?.plan_amount)}
						</Text>
					</View>
					<View
						style={{
							...styles.tableMasterRowInherit,
							width: "15%",
						}}
					>
						<Text style={{ ...styles.tableCellReport, textAlign: "right" }}>
							{parent?.real_amount !== "" &&
								formatterNumber(parent?.real_amount)}
						</Text>
					</View>
					<View
						style={{
							...styles.tableMasterRowInherit,
							width: "15%",
						}}
					>
						<Text style={{ ...styles.tableCellReport, textAlign: "right" }}>
							{parent?.percentage}
						</Text>
					</View>
				</View>
			));
		}

		if (report === "rekapitulasi") {
			let total = { label: "TOTAL" };

			_.map(data?.bases, (base) => {
				total[`${base?.base_id}_plan_amount`] = _.sumBy(
					base?.children,
					`account_base_plan_amount`
				);
				total[`${base?.base_id}_real_amount`] = _.sumBy(
					base?.children,
					`account_base_real_amount`
				);
				total[`${base?.base_id}_percentage`] = parseFloat(
					(total[`${base?.base_id}_real_amount`] /
						total[`${base?.base_id}_plan_amount`]) *
						100
				).toFixed(2);
			});
			data?.data.push(total);

			return _.map(data?.data, (parent, indexParent) => (
				<View key={indexParent} style={styles.tableRowReport}>
					{parent?.label === "TOTAL" ? (
						<View
							style={{
								...styles.tableMasterRowIndex,
								width: "24%",
							}}
						>
							<Text style={{ ...styles.tableCellReport, textAlign: "center" }}>
								{parent?.label}
							</Text>
						</View>
					) : (
						<>
							<View
								style={{
									...styles.tableMasterRowIndex,
									width: "4%",
								}}
							>
								<Text
									style={{ ...styles.tableCellReport, textAlign: "center" }}
								>
									{parent?.no}
								</Text>
							</View>

							<View
								style={{
									...styles.tableMasterRowInherit,
									width: "20%",
								}}
							>
								<Text style={{ ...styles.tableCellReport, textAlign: "left" }}>
									{parent?.label}
								</Text>
							</View>
						</>
					)}
					{!!recapitulate_headers.length &&
						_.map(recapitulate_headers, (item) => (
							<View
								key={String(`${item?.base_id}_row`)}
								style={{
									...styles.tableMasterRowInherit,
									flexDirection: "row",
									width: "36%",
								}}
							>
								<View
									style={{
										margin: "auto",
										flexDirection: "row",
										marginLeft: -2,
									}}
								>
									<View
										style={{
											width: "50%",
										}}
									>
										<Text
											style={{ ...styles.tableCellReport, textAlign: "right" }}
										>
											{parent?.label === "TOTAL"
												? formatterNumber(
														parent[`${item?.base_id}_plan_amount`]
												  )
												: parent[`${item?.base_id}_plan_amount`]}
										</Text>
									</View>
									<View
										style={{
											borderLeftWidth: 1,
											width: "50%",
										}}
									>
										<Text
											style={{ ...styles.tableCellReport, textAlign: "right" }}
										>
											{parent?.label === "TOTAL"
												? formatterNumber(
														parent[`${item?.base_id}_real_amount`]
												  )
												: parent[`${item?.base_id}_real_amount`]}
										</Text>
									</View>
								</View>
								<View
									style={{
										borderLeftWidth: 1,
										width: "30%",
									}}
								>
									<Text
										style={{ ...styles.tableCellReport, textAlign: "center" }}
									>
										{parent[`${item?.base_id}_percentage`]}
									</Text>
								</View>
							</View>
						))}
				</View>
			));
		}
	};

	const createSign = () => {
		return (
			<View style={{ flexDirection: "column", paddingHorizontal: 20 }}>
				<View style={{ flex: 1, flexDirection: "row", paddingTop: 20 }}>
					<View style={{ flex: 1 }}></View>
					<View style={{ flex: 1 }}>
						<Text style={{ fontSize: 10, paddingHorizontal: 60 }}>
							{`_________________, ${viewDate(signer?.export_date)}`}
						</Text>
					</View>
				</View>
				<View style={{ flex: 1, flexDirection: "row", paddingTop: 16 }}>
					<View style={{ flex: 1 }}>
						<Text
							style={{ fontSize: 10, paddingHorizontal: 80 }}
						>{`Menyetujui,`}</Text>
					</View>
					<View style={{ flex: 1 }}>
						<Text
							style={{ fontSize: 10, paddingHorizontal: 60 }}
						>{`Dibuat oleh,`}</Text>
					</View>
				</View>
				<View style={{ flex: 1, flexDirection: "row", paddingTop: 16 }}>
					<View style={{ flex: 1 }}>
						<Text style={{ fontSize: 10, paddingHorizontal: 80 }}>
							{signer.knowIs?.position}
						</Text>
					</View>
					<View style={{ flex: 1 }}>
						<Text style={{ fontSize: 10, paddingHorizontal: 60 }}>
							{signer.signerIs?.position}
						</Text>
					</View>
				</View>
				<View style={{ flex: 1, flexDirection: "row", paddingTop: 60 }}>
					<View style={{ flex: 1 }}>
						<Text style={{ fontSize: 10, paddingHorizontal: 80 }}>
							{signer.knowIs?.label}
						</Text>
					</View>
					<View style={{ flex: 1 }}>
						<Text style={{ fontSize: 10, paddingHorizontal: 60 }}>
							{signer.signerIs?.label}
						</Text>
					</View>
				</View>
				<View style={{ flex: 1, flexDirection: "row", paddingTop: 16 }}>
					<View style={{ flex: 1 }}>
						<Text style={{ fontSize: 10, paddingHorizontal: 80 }}>
							{signer.knowIs?.title}
						</Text>
					</View>
					<View style={{ flex: 1 }}>
						<Text style={{ fontSize: 10, paddingHorizontal: 60 }}>
							{signer.signerIs?.title}
						</Text>
					</View>
				</View>
				<View style={{ flex: 1, flexDirection: "row", paddingTop: 16 }}>
					<View style={{ flex: 1 }}>
						<Text style={{ fontSize: 10, paddingHorizontal: 80 }}>
							{`NIP. ${signer.knowIs?.nip}`}
						</Text>
					</View>
					<View style={{ flex: 1 }}>
						<Text style={{ fontSize: 10, paddingHorizontal: 60 }}>
							{`NIP. ${signer.signerIs?.nip}`}
						</Text>
					</View>
				</View>
			</View>
		);
	};

	return (
		<Document>
			<Page size="A4" style={styles.page} orientation={orientation}>
				{report && (
					<View style={styles.tableHeader}>{createReportHeader()}</View>
				)}
				<View style={styles.table}>
					{createTableHeader()}
					{createTableRow()}
				</View>
				{report &&
					signer?.signerIs &&
					signer?.knowIs &&
					signer?.export_date &&
					createSign()}
				<Text
					style={styles.pageNumber}
					render={({ pageNumber, totalPages }) =>
						`${pageNumber} / ${totalPages}`
					}
					fixed
				/>
			</Page>
		</Document>
	);
}

// Create styles
const styles = StyleSheet.create({
	page: {
		paddingTop: 35,
		paddingBottom: 65,
		paddingHorizontal: 10,
	},
	tableHeader: {
		display: "table",
		width: "auto",
		paddingBottom: 6,
	},
	table: {
		display: "table",
		width: "auto",
	},
	// tableSigner: {
	// 	display: "table",
	// 	width: "auto",
	// 	paddingTop: 10,
	// },
	tableRowHeader: {
		margin: "auto",
		flexDirection: "row",
		height: 25,
	},
	tableRow: {
		margin: "auto",
		flexDirection: "row",
		minHeight: 25,
	},
	tableMasterColIndex: {
		width: "10%",
		borderStyle: "solid",
		borderWidth: 1,
	},
	tableMasterColInherit: {
		borderStyle: "solid",
		borderWidth: 1,
		borderLeftWidth: 0,
	},
	tableMasterRowIndex: {
		width: "10%",
		borderStyle: "solid",
		borderWidth: 1,
		borderTopWidth: 0,
	},
	tableMasterRowInherit: {
		borderStyle: "solid",
		borderWidth: 1,
		borderTopWidth: 0,
		borderLeftWidth: 0,
	},
	tableCellHeader: {
		margin: "auto",
		padding: 4,
		fontSize: 12,
		fontWeight: "bold",
		textTransform: "uppercase",
	},
	tableCell: {
		margin: "auto",
		fontSize: 12,
		padding: 4,
	},
	pageNumber: {
		position: "absolute",
		fontSize: 12,
		bottom: 30,
		left: 0,
		right: 0,
		textAlign: "center",
	},
	reportHeader: {
		margin: "auto",
		flexDirection: "row",
		justifyContent: "space-between",
		paddingBottom: 20,
	},
	logoKemendagri: {
		width: "6%",
		height: "auto",
	},
	logoCity: {
		width: "6%",
		height: "auto",
	},
	reportHeaderTitle: {
		margin: "auto",
		flexDirection: "column",
		paddingHorizontal: 30,
	},
	reportTitle: {
		fontSize: 10,
		alignSelf: "center",
		textAlign: "center",
		fontWeight: "bold",
	},
	tableCellHeaderReport: {
		margin: "auto",
		paddingHorizontal: 2,
		fontSize: 10,
		textTransform: "uppercase",
	},
	tableRowReport: {
		margin: "auto",
		flexDirection: "row",
		height: 14,
	},
	tableCellReport: {
		fontSize: 10,
		paddingHorizontal: 2,
	},
});
