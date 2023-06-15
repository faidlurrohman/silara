import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { EXPORT_TARGET } from "../helpers/constants";
import _ from "lodash";

export default function PDFFile({
	master = null,
	data = [],
	orientation = "portrait",
}) {
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
									: parent[child?.key]}
							</Text>
						</View>
					))}
				</View>
			));
		}
	};

	return (
		<Document>
			<Page size="A4" style={styles.page} orientation={orientation}>
				<View style={styles.table}>
					{createTableHeader()}
					{createTableRow()}
				</View>
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
		paddingHorizontal: 35,
	},
	table: {
		display: "table",
		width: "auto",
	},
	tableRowHeader: {
		margin: "auto",
		flexDirection: "row",
		height: 35,
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
});
