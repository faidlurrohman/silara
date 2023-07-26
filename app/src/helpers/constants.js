const COLORS = {
	main: "#1C4F49",
	mainDark: "#18423d",
	secondary: "#FC671A",
	secondaryOpacity: "rgba(252, 103, 26, 0.3)",
	info: "#1677FF",
	success: "#22C55E",
	danger: "#EF4444",
	disable: "#64748B",
	white: "#FFFFFF",
	black: "#000000",
};
/* 
  Usernames can only have: 
  - Letters (a-zA-Z) 
  - Numbers (0-9)
  - Dots (.)
  - Underscores (_)
*/
const REGEX_USERNAME = /^[a-zA-Z0-9_.]+$/;
const DATE_UTC = "Asia/Jakarta";
const DATE_FORMAT_DB = "YYYY-MM-DD";
const DATE_FORMAT_VIEW = "DD MMMM YYYY";
const MONTHS = [
	"Januari",
	"Februari",
	"Maret",
	"April",
	"Mei",
	"Juni",
	"Juli",
	"Agustus",
	"September",
	"Oktober",
	"November",
	"Desember",
];
const PAGINATION = { pagination: { current: 1, pageSize: 10 } };
const MESSAGE = {
	add: "Data berhasil ditambah",
	edit: "Data berhasil diperbarui",
};
const MENU_ITEM = [
	{
		key: "/",
		label: "Beranda",
		roles: [1, 2, 3, 4],
		nav: "/",
	},
	{
		key: "/rekening",
		label: "Master Rekening",
		roles: [1, 3],
		nav: "rekening",
	},
	{
		key: "/transaksi",
		label: "Transaksi",
		roles: [1, 2, 3, 4],
		children: [
			{
				key: "/transaksi/anggaran",
				label: "Anggaran",
				nav: "transaksi/anggaran",
				roles: [1, 2, 3, 4],
			},
			{
				key: "/transaksi/realisasi",
				label: "Realisasi",
				nav: "transaksi/realisasi",
				roles: [1, 2, 3, 4],
			},
		],
	},
	{
		key: "/laporan",
		label: "Laporan",
		roles: [1, 2, 3, 4],
		children: [
			{
				key: "/laporan/realisasi-anggaran-kota",
				label: "Realisasi Anggaran Kota",
				nav: "laporan/realisasi-anggaran-kota",
				roles: [1, 2, 3, 4],
			},
			{
				key: "/laporan/realisasi-anggaran-gabungan-kota",
				label: "Realisasi Anggaran Gabungan Kota",
				nav: "laporan/realisasi-anggaran-gabungan-kota",
				roles: [1, 3],
			},
			{
				key: "/laporan/rekapitulasi-pendapatan-dan-belanja",
				label: "Rekapitulasi Pendapatan & Belanja",
				nav: "laporan/rekapitulasi-pendapatan-dan-belanja",
				roles: [1, 3],
			},
		],
	},
	{
		key: "/pengaturan",
		label: "Pengaturan",
		roles: [1, 3],
		children: [
			{
				key: "/pengaturan/kota",
				label: "Kota",
				nav: "pengaturan/kota",
				roles: [1, 3],
			},
			{
				key: "/pengaturan/penanda-tangan",
				label: "Penanda Tangan",
				nav: "pengaturan/penanda-tangan",
				roles: [1, 3],
			},
			{
				key: "/pengaturan/pengguna",
				label: "Pengguna",
				nav: "pengaturan/pengguna",
				roles: [1, 3],
			},
		],
	},
];
const MENU_NAVIGATION = {
	rekening: "Rekening Akun",
	kelompok: "Rekening Kelompok",
	jenis: "Rekening Jenis",
	objek: "Rekening Objek",
	"/transaksi/anggaran": "Transaksi Anggaran",
	"/transaksi/realisasi": "Transaksi Realisasi",
	"/laporan/realisasi-anggaran-kota": "Laporan Realisasi Anggaran Kota",
	"/laporan/realisasi-anggaran-gabungan-kota":
		"Laporan Realisasi Anggaran Gabungan Kota",
	"/laporan/rekapitulasi-pendapatan-dan-belanja":
		"Laporan Rekapitulasi Pendapatan & Belanja",
	"/pengaturan/kota": "Pengaturan Kota",
	"/pengaturan/penanda-tangan": "Pengaturan Penanda Tangan",
	"/pengaturan/pengguna": "Pengaturan Pengguna",
};
const EXPORT_TARGET = {
	city: {
		filename: `SILARA-MASTER-KOTA`,
		headers: [
			{ header: "No", key: "no", width: 5 },
			{ header: "Nama Kota", key: "label", width: 30 },
			{ header: "Aktif", key: "active", width: 10 },
		],
	},
	signer: {
		filename: `SILARA-MASTER-PENANDA-TANGAN`,
		headers: [
			{ header: "No", key: "no", width: 5 },
			{ header: "NIP", key: "nip", width: 20 },
			{ header: "Nama", key: "fullname", width: 35 },
			{ header: "Jabatan", key: "title", width: 35 },
			{ header: "Aktif", key: "active", width: 10 },
		],
	},
	user: {
		filename: `SILARA-MASTER-PENGGUNA`,
		headers: [
			{ header: "No", key: "no", width: 5 },
			{ header: "Nama Pengguna", key: "username", width: 35 },
			{ header: "Nama", key: "fullname", width: 35 },
			{ header: "Jabatan", key: "title", width: 35 },
			{ header: "Aktif", key: "active", width: 10 },
		],
	},
	account_base: {
		filename: `SILARA-MASTER-REKENING-AKUN`,
		headers: [
			{ header: "No", key: "no", width: 5 },
			{ header: "Label", key: "label", width: 10 },
			{ header: "Keterangan", key: "remark", width: 35 },
			{ header: "Aktif", key: "active", width: 10 },
		],
	},
	account_group: {
		filename: `SILARA-MASTER-REKENING-KELOMPOK`,
		headers: [
			{ header: "No", key: "no", width: 5 },
			{ header: "Akun Rekening", key: "account_base_label", width: 35 },
			{ header: "Label", key: "label", width: 10 },
			{ header: "Keterangan", key: "remark", width: 35 },
			{ header: "Aktif", key: "active", width: 10 },
		],
	},
	account_type: {
		filename: `SILARA-MASTER-REKENING-JENIS`,
		headers: [
			{ header: "No", key: "no", width: 5 },
			{ header: "Kelompok Rekening", key: "account_group_label", width: 35 },
			{ header: "Label", key: "label", width: 10 },
			{ header: "Keterangan", key: "remark", width: 35 },
			{ header: "Aktif", key: "active", width: 10 },
		],
	},
	account_object: {
		filename: `SILARA-MASTER-REKENING-OBJEK`,
		headers: [
			{ header: "No", key: "no", width: 5 },
			{ header: "Jenis Rekening", key: "account_type_label", width: 35 },
			{ header: "Label", key: "label", width: 35 },
			{ header: "Keterangan", key: "remark", width: 35 },
			{ header: "Aktif", key: "active", width: 10 },
		],
	},
	transaction: {
		filename: `SILARA-MASTER-TRANSAKSI`,
		headers: [
			{ header: "No", key: "no", width: 5 },
			{ header: "Tanggal", key: "trans_date", width: 20 },
			{ header: "Kota", key: "city_label", width: 35 },
			{ header: "Objek Rekening", key: "account_object_label", width: 35 },
			{ header: "Anggaran", key: "plan_amount", width: 20 },
			{ header: "Realisasi", key: "real_amount", width: 20 },
		],
	},
};

export {
	COLORS,
	MENU_ITEM,
	MENU_NAVIGATION,
	REGEX_USERNAME,
	PAGINATION,
	MESSAGE,
	EXPORT_TARGET,
	DATE_UTC,
	DATE_FORMAT_VIEW,
	DATE_FORMAT_DB,
	MONTHS,
};
