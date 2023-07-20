import {
	Button,
	DatePicker,
	Divider,
	Dropdown,
	Form,
	Modal,
	Select,
	Space,
} from "antd";
import { DownOutlined, ExportOutlined } from "@ant-design/icons";
import { convertDate, dbDate, viewDate } from "../../helpers/date";
import { lower, upper } from "../../helpers/typo";
import { DATE_FORMAT_VIEW, EXPORT_TARGET } from "../../helpers/constants";
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
import { formatterNumber } from "../../helpers/number";

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
	const { is_super_admin } = useRole();
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
			if (report === "kota") {
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

				if (chooseCityLogo !== "") {
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
				}

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
			} else if (report === "gabungankota") {
				// header
				sheet.mergeCells("A8", "A9");
				sheet.mergeCells("B8", "B9");
				sheet.getCell("A8").value = `KODE REKENING`;
				sheet.getCell("A8").style = {
					alignment: { vertical: "middle", horizontal: "center" },
					font: { bold: true },
				};
				sheet.getCell("B8").value = `URAIAN`;
				sheet.getCell("B8").style = {
					alignment: { vertical: "middle", horizontal: "center" },
					font: { bold: true },
				};

				let sc = 3,
					sr = 8;
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
					if ([8, 9, 10, 11].includes(number)) {
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
					} else if (number > 8) {
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

				// title
				let firstrow = sheet.getRow(8);
				let firstcell = firstrow._cells[0];
				let lastcell = firstrow._cells[firstrow._cells.length - 1];
				let firstchellchar = firstcell._address.charAt(0);
				let lastchellchar = lastcell._address.charAt(0);

				for (let pos = 1; pos <= 7; pos++) {
					sheet.mergeCells(`${firstchellchar}${pos}`, `${lastchellchar}${pos}`);

					if (pos === 3) {
						sheet.getCell(`${firstchellchar}${pos}`).value =
							"LAPORAN REALISASI ANGGARAN PENDAPATAN DAN BELANJA DAERAH (KONSOLIDASI)";
						sheet.getCell(`${firstchellchar}${pos}`).style = {
							alignment: { vertical: "middle", horizontal: "center" },
							font: { bold: true },
						};
					} else if (pos === 4) {
						sheet.getCell(
							`${firstchellchar}${pos}`
						).value = `KABUPATEN/KOTA SE-PROVINSI KEPULAUAN RIAU ANGGARAN ${viewDate(
							date[1]
						)}`;
						sheet.getCell(`${firstchellchar}${pos}`).style = {
							alignment: { vertical: "middle", horizontal: "center" },
							font: { bold: true },
						};
					} else if (pos === 5) {
						sheet.getCell(`${firstchellchar}${pos}`).value = upper(
							`${viewDate(date[0])} Sampai ${viewDate(date[1])}`
						);
						sheet.getCell(`${firstchellchar}${pos}`).style = {
							alignment: { vertical: "middle", horizontal: "center" },
							font: { bold: true },
						};
					}
				}
			} else if (report === "rekapitulasi") {
				// header
				sheet.mergeCells("A8", "A10");
				sheet.mergeCells("B8", "B10");
				sheet.getCell("A8").value = `NO`;
				sheet.getCell("A8").style = {
					alignment: { vertical: "middle", horizontal: "center" },
					font: { bold: true },
				};
				sheet.getCell("B8").value = `KABUPATEN / KOTA`;
				sheet.getCell("B8").style = {
					alignment: { vertical: "middle", horizontal: "center" },
					font: { bold: true },
				};

				let colBase = 3,
					rowBase = 8;
				let col = [
					{ key: "no", width: 7 },
					{ key: "label", width: 35 },
				];

				_.map(data?.bases, (base) => {
					sheet.mergeCells(rowBase, colBase, rowBase, colBase + 1);

					const rowBase1 = sheet.getRow(rowBase);
					const rowBase2 = sheet.getRow(rowBase + 1);
					const rowBase3 = sheet.getRow(rowBase + 2);
					// akun base label
					rowBase1.getCell(colBase).value = upper(base?.base);
					// target
					rowBase2.getCell(colBase).value = "TARGET";
					// realisasi
					rowBase2.getCell(colBase + 1).value = "REALISASI";
					// Rp
					rowBase3.getCell(colBase).value = "(Rp)";
					// Rp
					rowBase3.getCell(colBase + 1).value = "(Rp)";
					// %
					sheet.mergeCells(rowBase, colBase + 2, rowBase + 2, colBase + 2);
					rowBase1.getCell(colBase + 2).value = "%";

					col.push({ key: `${base?.base_id}_plan_amount`, width: 22 });
					col.push({ key: `${base?.base_id}_real_amount`, width: 22 });
					col.push({ key: `${base?.base_id}_percentage`, width: 12 });

					colBase += 3;
				});
				sheet.columns = col;

				// data
				sheet.addRows(data?.data, "i");
				sheet.eachRow((row, number) => {
					if ([8, 9, 10].includes(number)) {
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
					} else if (number > 8) {
						row.eachCell((cell) => {
							if (
								cell._column._key === "no" ||
								cell._column._key.includes("percentage")
							) {
								cell.style = {
									alignment: {
										horizontal: "center",
										vertical: "middle",
									},
								};
							} else if (
								cell._column._key.includes("plan_amount") ||
								cell._column._key.includes("real_amount")
							) {
								cell.style = {
									alignment: {
										horizontal: "right",
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

				// total
				const totalRow = sheet.lastRow;
				let total = ["TOTAL", ""];

				_.map(data?.bases, (base) => {
					let tpa = 0,
						tra = 0,
						tp = 0;

					tpa = _.sumBy(base?.children, `account_base_plan_amount`);
					tra = _.sumBy(base?.children, `account_base_real_amount`);
					tp = parseFloat((tra / tpa) * 100).toFixed(2);

					total.push(formatterNumber(tpa));
					total.push(formatterNumber(tra));
					total.push(tp);
				});
				sheet.addRow(total);
				sheet.getRow(totalRow.number + 1).eachCell((cell) => {
					let cellno = cell._column._number;
					let cellkey = cell._column._key;

					if (cellno === 2) {
						sheet.mergeCells(
							`A${totalRow?.number + 1}`,
							`B${totalRow?.number + 1}`
						);
						sheet.getCell(`A${totalRow?.number + 1}`).style = {
							alignment: {
								horizontal: "center",
								vertical: "middle",
							},
							font: { bold: true },
							border: {
								top: { style: "thin" },
								left: { style: "thin" },
								bottom: { style: "thin" },
								right: { style: "thin" },
							},
						};
						sheet.getCell(`B${totalRow?.number + 1}`).style = {
							alignment: {
								horizontal: "center",
								vertical: "middle",
							},
							font: { bold: true },
							border: {
								top: { style: "thin" },
								left: { style: "thin" },
								bottom: { style: "thin" },
								right: { style: "thin" },
							},
						};
					} else if (cellno > 2) {
						if (cellkey.includes("percentage")) {
							cell.style = {
								alignment: {
									horizontal: "center",
									vertical: "middle",
								},
							};
						} else if (
							cellkey.includes("plan_amount") ||
							cellkey.includes("real_amount")
						) {
							cell.style = {
								alignment: {
									horizontal: "right",
									vertical: "middle",
								},
							};
						}

						cell.style = {
							...cell.style,
							font: { bold: true },
							border: {
								top: { style: "thin" },
								left: { style: "thin" },
								bottom: { style: "thin" },
								right: { style: "thin" },
							},
						};
					}
				});

				// title
				let firstrow = sheet.getRow(8);
				let firstcell = firstrow._cells[0];
				let lastcell = firstrow._cells[firstrow._cells.length - 1];
				let firstchellchar = firstcell._address.charAt(0);
				let lastchellchar = lastcell._address.charAt(0);

				for (let pos = 1; pos <= 7; pos++) {
					sheet.mergeCells(`${firstchellchar}${pos}`, `${lastchellchar}${pos}`);

					if (pos === 3) {
						sheet.getCell(`${firstchellchar}${pos}`).value =
							"REKAPITULASI PENDAPATAN DAN BELANJA";
						sheet.getCell(`${firstchellchar}${pos}`).style = {
							alignment: { vertical: "middle", horizontal: "center" },
							font: { bold: true },
						};
					} else if (pos === 4) {
						sheet.getCell(
							`${firstchellchar}${pos}`
						).value = `APBD KABUPATEN / KOTA SE-PROVINSI KEPULAUAN RIAU TAHUN ANGGARAN ${convertDate(
							date[0],
							"YYYY"
						)}`;
						sheet.getCell(`${firstchellchar}${pos}`).style = {
							alignment: { vertical: "middle", horizontal: "center" },
							font: { bold: true },
						};
					} else if (pos === 5) {
						sheet.getCell(`${firstchellchar}${pos}`).value = `PER ${upper(
							viewDate(date[1])
						)}`;
						sheet.getCell(`${firstchellchar}${pos}`).style = {
							alignment: { vertical: "middle", horizontal: "center" },
							font: { bold: true },
						};
					}
				}
			}

			// make know and signer
			const last = sheet.lastRow;

			if (last && !!signers.length) {
				// know part
				const knowIs = signers.find((d) => d?.id === formValues?.know_id);

				if (knowIs) {
					let initKnow = (last.number || 0) + 4;

					sheet.getCell(`B${initKnow}`).value = "Menyetujui,";
					sheet.getCell(`B${initKnow + 1}`).value = knowIs?.position;
					sheet.getCell(`B${initKnow + 5}`).value = knowIs?.label;
					sheet.getCell(`B${initKnow + 6}`).value = knowIs?.title;
					sheet.getCell(`B${initKnow + 7}`).value = `NIP. ${knowIs?.nip}`;
				}

				// signer part
				const signerIs = signers.find((d) => d?.id === formValues?.signer_id);

				if (signerIs) {
					let initSigner = (last.number || 0) + 3;
					let firstSignerCell = last._cells[last._cells.length - 3];
					let lastSignerCell = last._cells[last._cells.length - 1];
					let initSignerCellChar = firstSignerCell._address.charAt(0);
					let lastSignerCellChar = lastSignerCell._address.charAt(0);

					sheet.mergeCells(
						initSignerCellChar + initSigner,
						lastSignerCellChar + initSigner
					);
					sheet.getCell(
						initSignerCellChar + initSigner
					).value = `_________________, ${viewDate(formValues?.export_date)}`;

					sheet.mergeCells(
						initSignerCellChar + (initSigner + 1),
						lastSignerCellChar + (initSigner + 1)
					);
					sheet.getCell(initSignerCellChar + (initSigner + 1)).value =
						"Dibuat oleh,";

					sheet.mergeCells(
						initSignerCellChar + (initSigner + 2),
						lastSignerCellChar + (initSigner + 2)
					);
					sheet.getCell(initSignerCellChar + (initSigner + 2)).value =
						signerIs?.position;

					sheet.mergeCells(
						initSignerCellChar + (initSigner + 6),
						lastSignerCellChar + (initSigner + 6)
					);
					sheet.getCell(initSignerCellChar + (initSigner + 6)).value =
						signerIs?.label;

					sheet.mergeCells(
						initSignerCellChar + (initSigner + 7),
						lastSignerCellChar + (initSigner + 7)
					);
					sheet.getCell(initSignerCellChar + (initSigner + 7)).value =
						signerIs?.title;

					sheet.mergeCells(
						initSignerCellChar + (initSigner + 8),
						lastSignerCellChar + (initSigner + 8)
					);
					sheet.getCell(
						initSignerCellChar + (initSigner + 8)
					).value = `NIP. ${signerIs?.nip}`;
				}
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
		const dataSigner = {
			export_date: viewDate(formValues?.export_date),
			signerIs: signers.find((d) => d?.id === formValues?.signer_id),
			knowIs: signers.find((d) => d?.id === formValues?.know_id),
		};

		const doc = (
			<PDFFile
				master={master}
				report={report}
				data={data}
				date={date}
				orientation={pdfOrientation}
				signer={dataSigner}
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
									if (is_super_admin && report) {
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
									if (is_super_admin && report) {
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
				<Form
					form={form}
					name="basic"
					labelCol={{ span: 8 }}
					labelAlign="left"
					onFinish={(v) =>
						doNext === "xlsx" ? xlsx(v) : doNext === "pdfx" ? pdfx(v) : null
					}
					autoComplete="off"
					initialValues={{
						signer_id: "",
						know_id: "",
						export_date: convertDate(),
					}}
				>
					<Divider orientation="left" plain>
						Format Kiri
					</Divider>
					<Form.Item
						label="Mengetahui"
						name="know_id"
						rules={[
							{
								required: true,
								message: "Mengetahui tidak boleh kosong!",
							},
						]}
					>
						<Select
							disabled={loadingPdf}
							loading={loading}
							optionFilterProp="children"
							filterOption={(input, option) =>
								(lower(option?.children) ?? "").includes(lower(input))
							}
						>
							{signers &&
								!!signers.length &&
								_.map(signers, (item) => (
									<Select.Option key={String(item?.id)} value={item?.id}>
										{`NIP. ${item?.nip} ${item?.label}`}
									</Select.Option>
								))}
						</Select>
					</Form.Item>
					<Divider orientation="left" plain>
						Format Kanan
					</Divider>
					<Form.Item
						label="Tanggal"
						name="export_date"
						rules={[
							{
								required: true,
								message: "Tanggal tidak boleh kosong!",
							},
						]}
					>
						<DatePicker format={DATE_FORMAT_VIEW} className="w-full" />
					</Form.Item>
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
						<Select
							allowClear
							showSearch
							disabled={loadingPdf}
							loading={loading}
							optionFilterProp="children"
							filterOption={(input, option) =>
								(lower(option?.children) ?? "").includes(lower(input))
							}
						>
							{signers &&
								!!signers.length &&
								_.map(signers, (item) => (
									<Select.Option key={String(item?.id)} value={item?.id}>
										{`NIP. ${item?.nip} ${item?.label}`}
									</Select.Option>
								))}
						</Select>
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
