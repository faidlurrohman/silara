import { Button, Dropdown, Space } from "antd";
import { DownOutlined, ExportOutlined } from "@ant-design/icons";
import { convertDate, dbDate } from "../../helpers/date";
import { upper } from "../../helpers/typo";
import { EXPORT_TARGET } from "../../helpers/constants";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PDFFile from "../PDFFile";

const ExcelJS = require("exceljs");

export default function ExportButton({
	master = null,
	data = [],
	sheetTitle = "MY SHEET",
	fileName = "FILE-",
	pdfOrientation = "portrait",
}) {
	// xlsx
	const xlsx = () => {
		const workbook = new ExcelJS.Workbook();
		const sheet = workbook.addWorksheet(master ? `MASTER` : sheetTitle);

		if (master) {
			// filename
			fileName = EXPORT_TARGET[master].filename;

			// header
			sheet.columns = EXPORT_TARGET[master].headers;

			// data
			sheet.addRows(
				data.map((item, index) => ({
					...item,
					no: (index += 1),
					active: item?.active ? `Ya` : `Tidak`,
				})),
				"i"
			);
			sheet.eachRow((row, number) => {
				if (number === 1) {
					row.height = 50;
				}

				row.eachCell((cell) => {
					if (number === 1) {
						cell.style = {
							font: { bold: true },
						};
					} else {
						cell.style = {
							font: { bold: false },
						};
					}

					cell.style = {
						...cell?.style,
						alignment: { vertical: "middle", horizontal: "center" },
						border: {
							top: { style: "thin" },
							left: { style: "thin" },
							bottom: { style: "thin" },
							right: { style: "thin" },
						},
					};
				});
			});
		} else {
		}

		workbook.xlsx.writeBuffer().then(function (data) {
			const blob = new Blob([data], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			});
			const url = window.URL.createObjectURL(blob);
			const anchor = document.createElement("a");

			anchor.href = url;
			anchor.download = `${upper(fileName)}-${dbDate(convertDate())}.xlsx`;
			anchor.click();
			window.URL.revokeObjectURL(url);
		});
	};

	return (
		<Dropdown
			menu={{
				items: [
					{
						key: "xlsx",
						label: ".XLSX",
						onClick: () => xlsx(),
					},
					{
						key: "pdf",
						label: (
							<PDFDownloadLink
								document={
									<PDFFile
										master={master}
										data={data}
										orientation={pdfOrientation}
									/>
								}
								fileName={master ? EXPORT_TARGET[master].filename : fileName}
							>
								.PDF
							</PDFDownloadLink>
						),
					},
				],
			}}
			trigger={["click"]}
		>
			<Button type="primary" icon={<ExportOutlined />}>
				<Space>
					Ekspor
					<DownOutlined />
				</Space>
			</Button>
		</Dropdown>
	);
}
