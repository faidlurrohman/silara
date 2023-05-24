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

/* 
  Usernames can only have: 
  - Letters (a-zA-Z) 
  - Numbers (0-9)
  - Dots (.)
  - Underscores (_)
*/
const REGEX_USERNAME = /^[a-zA-Z0-9_\.]+$/;

const DATE_FORMAT = "YYYY/MM/DD";

const PAGINATION = { pagination: { current: 1, pageSize: 10 } };

const EXPORT_TARGET = {
  city: {
    filename: "DATA_KOTA",
    headers: [
      { label: "Nama Kota", key: "label" },
      { label: "Aktif", key: "active" },
    ],
  },
  signer: {
    filename: "DATA_PENANDA_TANGAN",
    headers: [
      { label: "NIP", key: "nip" },
      { label: "Nama", key: "fullname" },
      { label: "Jabatan", key: "title" },
      { label: "Aktif", key: "active" },
    ],
  },
  user: {
    filename: "DATA_PENGGUNA",
    headers: [
      { label: "Nama Pengguna", key: "username" },
      { label: "Nama", key: "fullname" },
      { label: "Jabatan", key: "title" },
      { label: "Aktif", key: "active" },
    ],
  },
  account_base: {
    filename: "DATA_REKENING_AKUN",
    headers: [
      { label: "Label", key: "label" },
      { label: "Keterangan", key: "remark" },
      { label: "Aktif", key: "active" },
    ],
  },
  account_group: {
    filename: "DATA_REKENING_KELOMPOK",
    headers: [
      { label: "Akun Rekening", key: "account_base_label" },
      { label: "Label", key: "label" },
      { label: "Keterangan", key: "remark" },
      { label: "Aktif", key: "active" },
    ],
  },
  account_type: {
    filename: "DATA_REKENING_JENIS",
    headers: [
      { label: "Kelompok Rekening", key: "account_group_label" },
      { label: "Label", key: "label" },
      { label: "Keterangan", key: "remark" },
      { label: "Aktif", key: "active" },
    ],
  },
  account_object: {
    filename: "DATA_REKENING_OBJEK",
    headers: [
      { label: "Jenis Rekening", key: "account_type_label" },
      { label: "Label", key: "label" },
      { label: "Keterangan", key: "remark" },
      { label: "Aktif", key: "active" },
    ],
  },
  transaction: {
    filename: "DATA_TRANSAKSI",
    headers: [
      { label: "Tanggal", key: "trans_date" },
      { label: "Kota", key: "city_label" },
      { label: "Objek Rekening", key: "object_account_label" },
      { label: "Anggaran", key: "plan_amount" },
      { label: "Realisasi", key: "real_amount" },
    ],
  },
};

export {
  REGEX_USERNAME,
  PAGINATION,
  EXPORT_TARGET,
  DATE_FORMAT,
  TRANSAKSI_TMP,
  LAPORAN_TMP,
};
