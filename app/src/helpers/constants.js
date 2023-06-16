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
	TRANSAKSI_TMP,
	LAPORAN_TMP,
};
