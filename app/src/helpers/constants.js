const TRANSAKSI_TMP = [
	{
		id: Math.floor(Math.random() * 1000),
		key: Math.floor(Math.random() * 1000),
		date: "2022-04-04",
		city: "Label 1",
		object_account: "Label 1",
		object_id: "1",
		budget: 500000,
		realization: 340000,
	},
];

const LAPORAN_TMP = [
	{
		id: Math.floor(Math.random() * 1000),
		key: Math.floor(Math.random() * 1000),
		date: "2022-04-04",
		city: "Label 1",
		budget: 500000,
		realization: 340000,
	},
];

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
const REGEX_USERNAME = /^[a-zA-Z0-9_\.]+$/;
const DATE_UTC = "Asia/Jakarta";
const DATE_FORMAT_DB = "YYYY-MM-DD";
const DATE_FORMAT_EXPORT = "YYYYMMDD";
const DATE_FORMAT_VIEW = "DD MMMM YYYY";
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
		roles: [1, 3, 4],
		children: [
			{
				key: "/rekening/akun",
				label: "Akun",
				nav: "rekening/akun",
			},
			{
				key: "/rekening/kelompok",
				label: "Kelompok",
				nav: "rekening/kelompok",
			},
			{
				key: "/rekening/jenis",
				label: "Jenis",
				nav: "rekening/jenis",
			},
			{
				key: "/rekening/objek",
				label: "Objek",
				nav: "rekening/objek",
			},
		],
	},
	{
		key: "/transaksi",
		label: "Transaksi",
		nav: "transaksi",
		roles: [1, 2, 3, 4],
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
			},
			{
				key: "/laporan/realisasi-anggaran-gabungan-kota",
				label: "Realisasi Anggaran Gabungan Kota",
				nav: "laporan/realisasi-anggaran-gabungan-kota",
			},
			{
				key: "/laporan/rekapitulasi-pendapatan-dan-belanja",
				label: "Rekapitulasi Pendapatan & Belanja",
				nav: "laporan/rekapitulasi-pendapatan-dan-belanja",
			},
		],
	},
	{
		key: "/pengaturan",
		label: "Pengaturan",
		roles: [1, 3, 4],
		children: [
			{
				key: "/pengaturan/kota",
				label: "Kota",
				nav: "pengaturan/kota",
			},
			{
				key: "/pengaturan/penanda-tangan",
				label: "Penanda Tangan",
				nav: "pengaturan/penanda-tangan",
			},
			{
				key: "/pengaturan/pengguna",
				label: "Pengguna",
				nav: "pengaturan/pengguna",
			},
		],
	},
];
const EXPORT_TARGET = {
	city: {
		filename: `SILARA_KOTA`,
		headers: [
			{ label: "Nama Kota", key: "label" },
			{ label: "Aktif", key: "active" },
		],
	},
	signer: {
		filename: `SILARA_PENANDA_TANGAN`,
		headers: [
			{ label: "NIP", key: "nip" },
			{ label: "Nama", key: "fullname" },
			{ label: "Jabatan", key: "title" },
			{ label: "Aktif", key: "active" },
		],
	},
	user: {
		filename: `SILARA_PENGGUNA`,
		headers: [
			{ label: "Nama Pengguna", key: "username" },
			{ label: "Nama", key: "fullname" },
			{ label: "Jabatan", key: "title" },
			{ label: "Aktif", key: "active" },
		],
	},
	account_base: {
		filename: `SILARA_REKENING_AKUN`,
		headers: [
			{ label: "Label", key: "label" },
			{ label: "Keterangan", key: "remark" },
			{ label: "Aktif", key: "active" },
		],
	},
	account_group: {
		filename: `SILARA_REKENING_KELOMPOK`,
		headers: [
			{ label: "Akun Rekening", key: "account_base_label" },
			{ label: "Label", key: "label" },
			{ label: "Keterangan", key: "remark" },
			{ label: "Aktif", key: "active" },
		],
	},
	account_type: {
		filename: `SILARA_REKENING_JENIS`,
		headers: [
			{ label: "Kelompok Rekening", key: "account_group_label" },
			{ label: "Label", key: "label" },
			{ label: "Keterangan", key: "remark" },
			{ label: "Aktif", key: "active" },
		],
	},
	account_object: {
		filename: `SILARA_REKENING_OBJEK`,
		headers: [
			{ label: "Jenis Rekening", key: "account_type_label" },
			{ label: "Label", key: "label" },
			{ label: "Keterangan", key: "remark" },
			{ label: "Aktif", key: "active" },
		],
	},
	transaction: {
		filename: `SILARA_TRANSAKSI`,
		headers: [
			{ label: "Tanggal", key: "trans_date" },
			{ label: "Kota", key: "city_label" },
			{ label: "Objek Rekening", key: "account_object_label" },
			{ label: "Anggaran", key: "plan_amount" },
			{ label: "Realisasi", key: "real_amount" },
		],
	},
};
const MENU_ACCESS = {
	1: ["all"],
	2: [
		"/",
		"/transaksi",
		"/laporan/realisasi-anggaran-kota",
		"/laporan/realisasi-anggaran-gabungan-kota",
		"/laporan/rekapitulasi-pendapatan-dan-belanja",
	],
	3: ["all"],
	4: ["all"],
};

export {
	MENU_ACCESS,
	COLORS,
	MENU_ITEM,
	REGEX_USERNAME,
	PAGINATION,
	MESSAGE,
	EXPORT_TARGET,
	DATE_UTC,
	DATE_FORMAT_VIEW,
	DATE_FORMAT_DB,
	DATE_FORMAT_EXPORT,
	TRANSAKSI_TMP,
	LAPORAN_TMP,
};
