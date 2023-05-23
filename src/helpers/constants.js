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
};

export { PAGINATION, EXPORT_TARGET, TRANSAKSI_TMP, LAPORAN_TMP };
