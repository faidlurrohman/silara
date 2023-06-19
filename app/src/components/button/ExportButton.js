import { Button, Divider, Dropdown, Form, Modal, Select, Space } from "antd";
import { DownOutlined, ExportOutlined } from "@ant-design/icons";
import { convertDate, dbDate, viewDate } from "../../helpers/date";
import { upper } from "../../helpers/typo";
import { EXPORT_TARGET } from "../../helpers/constants";
import { pdf } from "@react-pdf/renderer";
import PDFFile from "../PDFFile";
import { saveAs } from "file-saver";
import useRole from "../../hooks/useRole";
import { getSignerList } from "../../services/signer";
import { useEffect, useState } from "react";
import _ from "lodash";
import logoKemendagri from "../../assets/images/logo-kemendagri.png";
import axios from "axios";
import axiosInstance from "../../services/axios";

const ExcelJS = require("exceljs");

export default function ExportButton({
	master = null,
	report = null,
	data = [],
	sheetTitle = "MY SHEET",
	fileName = "FILE-",
	pdfOrientation = "portrait",
	date = null,
	types = ["xlsx", "pdf"],
}) {
	const { role_id } = useRole();
	const [form] = Form.useForm();
	const [signers, setSigners] = useState([]);
	const [loading, setLoading] = useState(false);
	const [loadingPdf, setLoadingPdf] = useState(false);
	const [signerModal, setSignerModal] = useState(false);
	const [doNext, setDoNext] = useState(null);

	// xlsx
	const xlsx = async (formValues = {}) => {
		const workbook = new ExcelJS.Workbook();
		const sheet = workbook.addWorksheet(master ? `MASTER` : sheetTitle);
		const signerIs =
			signers.find((d) => d?.id === formValues?.signer_id)?.label || "";

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
		}

		if (report) {
			if (report === "gabungankota") {
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
					date[1]
				)}`;
				sheet.getCell("B4").style = {
					alignment: { vertical: "middle", horizontal: "center" },
					font: { bold: true },
				};
				sheet.getCell("B5").value = `${viewDate(date[0])} Sampai ${viewDate(
					date[1]
				)}`;
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
				_.map(data?.cities, (item) => {
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
				sheet.addRows(data?.data, "i");
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
			} else if (report === "kota") {
				const chooseCity = data[0].city_label || "";
				const chooseCityLogo = data[0].city_logo || "";

				// title
				const logoLeft = await axios.get(logoKemendagri, {
					responseType: "arraybuffer",
				});

				const logo1 = workbook.addImage({
					buffer: logoLeft.data,
					extension: "png",
				});

				sheet.addImage(logo1, {
					tl: { col: 0.35, row: 0.35 },
					ext: { width: 100, height: 120 },
					editAs: "absolute",
				});

				const logoRight = await axiosInstance.get(
					`/app/logo/${chooseCityLogo}`,
					{
						responseType: "arraybuffer",
					}
				);

				const logo2 = workbook.addImage({
					buffer: logoRight.data,
					extension: "png",
				});

				sheet.addImage(logo2, {
					tl: { col: 4.35, row: 0.35 },
					ext: { width: 100, height: 120 },
					editAs: "absolute",
				});

				sheet.mergeCells("A1", "A7");
				sheet.mergeCells("E1", "E7");
				sheet.mergeCells("B1", "D1");
				sheet.mergeCells("B2", "D2");
				sheet.mergeCells("B3", "D3");
				sheet.mergeCells("B4", "D4");
				sheet.mergeCells("B5", "D5");
				sheet.mergeCells("B6", "D6");
				sheet.mergeCells("B7", "D7");
				sheet.getCell("B2").value = upper(`Pemerintahan ${chooseCity}`);
				sheet.getCell("B2").style = {
					alignment: { vertical: "middle", horizontal: "center" },
					font: { bold: true },
				};
				sheet.getCell("B4").value =
					"LAPORAN REALISASI ANGGARAN PENDAPATAN DAN BELANJA DAERAH (KONSOLIDASI)";
				sheet.getCell("B4").style = {
					alignment: { vertical: "middle", horizontal: "center" },
					font: { bold: true },
				};
				sheet.getCell("B5").value = upper(
					`Tahun Anggaran ${viewDate(date[1]).split(" ").pop()}`
				);
				sheet.getCell("B5").style = {
					alignment: { vertical: "middle", horizontal: "center" },
					font: { bold: true },
				};
				sheet.getCell("B6").value = `${viewDate(date[0])} Sampai ${viewDate(
					date[1]
				)}`;
				sheet.getCell("B6").style = {
					alignment: { vertical: "middle", horizontal: "center" },
					font: { bold: true },
				};

				// header
				sheet.addRow([]);
				sheet.addRow([
					"KODE REKENING",
					"URAIAN",
					"ANGGARAN",
					"REALISASI",
					`% ${viewDate(date[1]).split(" ").pop()}`,
				]);
				sheet.addRow(["1", "2", "3", "4", "5 = (4 / 3) * 100"]);
				sheet.addRow(["", "", "", "", ""]);
				sheet.columns = [
					{ key: "code", width: 18 },
					{ key: "label", width: 50 },
					{ key: "plan_amount", width: 18 },
					{ key: "real_amount", width: 18 },
					{ key: "percentage", width: 18 },
				];

				// data
				sheet.addRows(data, "i");
				sheet.eachRow((row, number) => {
					if ([9, 10, 11].includes(number)) {
						if (number === 9) row.height = 50;

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
								["plan_amount", "real_amount", "percentage"].includes(
									cell._column._key
								)
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
			}

			// make signer and sipd
			const last = sheet.lastRow;

			if (last) {
				if (signerIs !== "") {
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
				}

				// sipd
				let sipdCell = last.number || 0;
				sipdCell += signerIs !== "" ? 11 : 3;

				sheet.mergeCells(`A${sipdCell}`, `E${sipdCell}`);
				sheet.getCell(
					`A${sipdCell}`
				).value = `Dicetak Oleh SIPD Kementrian Dalam Negeri`;
				sheet.getCell(`A${sipdCell}`).style = {
					alignment: { vertical: "middle", horizontal: "center" },
					font: { bold: false },
				};
			}
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

			onSignerModal(false);
		});
	};

	// pdf
	const pdfx = async (formValues = {}) => {
		const signerIs =
			signers.find((d) => d?.id === formValues?.signer_id)?.label || "";
		const doc = (
			<PDFFile
				master={master}
				report={report}
				data={data}
				date={date}
				orientation={pdfOrientation}
				signer={signerIs}
			/>
		);
		const asPdf = pdf([]); // {} or [] is important, throws without an argument
		asPdf.updateContainer(doc);
		setLoadingPdf(true);

		const blob = await asPdf.toBlob();
		saveAs(
			blob,
			`${master ? EXPORT_TARGET[master].filename : fileName}-${dbDate(
				convertDate()
			)}.pdf`
		);
		setLoadingPdf(false);
		onSignerModal(false);
	};

	const onSignerModal = (show) => {
		setSignerModal(show);

		if (show) form.resetFields();
	};

	useEffect(() => {
		setLoading(true);
		getSignerList().then((response) => {
			setLoading(false);

			setSigners(response?.data?.data);
		});
	}, []);

	return (
		<>
			<Dropdown
				menu={{
					items: _.map(
						[
							{
								key: "xlsx",
								label: ".XLSX",
								onClick: () => {
									if (role_id === 1 && report) {
										onSignerModal(true);
										setDoNext("xlsx");
									} else {
										xlsx();
									}
								},
							},
							{
								key: "pdf",
								label: ".PDF",
								onClick: async () => {
									if (role_id === 1 && report) {
										onSignerModal(true);
										setDoNext("pdfx");
									} else {
										pdfx();
									}
								},
							},
						],
						(data) => {
							if (types.includes(data?.key)) return data;
						}
					),
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
					onFinish={(v) =>
						doNext === "xlsx" ? xlsx(v) : doNext === "pdfx" ? pdfx(v) : null
					}
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
						<Select disabled={loadingPdf} loading={loading} options={signers} />
					</Form.Item>
					<Divider />
					<Form.Item className="text-right mb-0">
						<Space direction="horizontal">
							<Button
								disabled={loadingPdf}
								onClick={() => onSignerModal(false)}
							>
								Kembali
							</Button>
							<Button loading={loadingPdf} htmlType="submit" type="primary">
								Simpan
							</Button>
						</Space>
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
}
