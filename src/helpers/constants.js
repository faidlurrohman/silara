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

const PAGINATION = { pagination: { current: 1, pageSize: 5 } };

const EXPORT_TARGET = {
  city: {
    filename: "DATA_KOTA",
    fields: ["id", "label", "active"],
    headers: [
      { label: "Nama Kota", key: "label" },
      { label: "Aktif", key: "active" },
    ],
  },
};

export { PAGINATION, EXPORT_TARGET, TRANSAKSI_TMP, LAPORAN_TMP };
