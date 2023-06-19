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
import { convertDate, viewDate } from "../helpers/date";

export default function PDFFile({
	master = null,
	report = null,
	data = [],
	date = null,
	orientation = "portrait",
	signer = "",
}) {
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
							{`Tahun Anggaran ${viewDate(date[1]).split(" ").pop()}`}
						</Text>
						<Text style={styles.reportTitle}>
							{`${viewDate(date[0])} Sampai ${viewDate(date[1])}`}
						</Text>
					</View>
					<Image
						style={styles.logoCity}
						src={`${process.env.REACT_APP_BASE_URL_API}/app/logo/${data[0]?.city_logo}`}
					/>
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
	};

	const createSign = () => {
		return (
			<>
				<View style={{ flex: 1, flexDirection: "row", paddingTop: 30 }}>
					<View style={{ flex: 2 }}></View>
					<View style={{ flex: 1 }}>
						<Text style={{ textAlign: "center", fontSize: 10 }}>
							{viewDate(convertDate())}
						</Text>
					</View>
				</View>
				<View style={{ flex: 1, flexDirection: "row", paddingTop: 60 }}>
					<View style={{ flex: 2 }}></View>
					<View style={{ flex: 1 }}>
						<Text style={{ textAlign: "center", fontSize: 10 }}>{signer}</Text>
					</View>
				</View>
			</>
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
				{report && signer !== "" && (
					<View style={styles.tableSigner}>{createSign()}</View>
				)}
				<Text
					style={styles.pageNumber}
					render={({ pageNumber, totalPages }) =>
						`${pageNumber} / ${totalPages}`
					}
					fixed
				/>
				<Text
					style={{
						fontSize: 10,
						color: "grey",
						position: "absolute",
						bottom: 15,
						left: 0,
						right: 0,
						textAlign: "center",
					}}
					fixed
				>
					Dicetak Oleh SIPD Kementrian Dalam Negeri
				</Text>
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
	tableSigner: {
		display: "table",
		width: "auto",
		paddingTop: 10,
	},
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
