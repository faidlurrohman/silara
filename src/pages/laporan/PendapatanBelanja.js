import { ExportOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, DatePicker, Input, Select, Space, Table } from "antd";
import { useAppDispatch } from "../../hooks/useRedux";
import { CSVLink } from "react-csv";
import { useRef, useState } from "react";
import moment from "moment";
import { LAPORAN_TMP } from "../../helpers/constants";

const { RangePicker } = DatePicker;

export default function PendapatanBelanja() {
  const dispatch = useAppDispatch();
  const searchInput = useRef(null);

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Space>
          <Input
            allowClear
            ref={searchInput}
            placeholder={`Cari nama kota`}
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
          />
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1890ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
  });

  const columns = [
    {
      title: "Tanggal",
      dataIndex: "date",
      defaultSortOrder: "ascend",
      sorter: (a, b) => a.date.localeCompare(b.date),
      ...getColumnSearchProps("date"),
    },
    {
      title: "Kota",
      dataIndex: "city",
      defaultSortOrder: "ascend",
      sorter: (a, b) => a.city.localeCompare(b.city),
      ...getColumnSearchProps("city"),
    },
    {
      title: "Anggaran",
      dataIndex: "budget",
      defaultSortOrder: "ascend",
      sorter: (a, b) => a.budget - b.budget,
      ...getColumnSearchProps("budget"),
    },
    {
      title: "Realisasi",
      dataIndex: "realization",
      defaultSortOrder: "ascend",
      sorter: (a, b) => a.realization - b.realization,
      ...getColumnSearchProps("realization"),
    },
  ];

  return (
    <>
      <div className="flex space-y-2 md:space-y-0 flex-col md:flex-row md:space-x-2">
        <div className="flex flex-row md:space-x-2">
          <h2 className="text-xs hidden md:inline">Tanggal : </h2>
          <RangePicker
            className="w-full md:w-72 h-8"
            place
            allowClear
            size="small"
            defaultValue={moment()}
            placeholder={["Tanggal Awal", "Tanggal Akhir"]}
          />
        </div>
        <div className="flex flex-row md:space-x-2">
          <h2 className="text-xs hidden md:pl-2 md:inline">Kota : </h2>
          <Select
            mode="multiple"
            allowClear
            showSearch
            className="w-full md:w-52"
            placeholder="Pilih Kota"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? "").includes(input)
            }
            filterSort={(optionA, optionB) =>
              (optionA?.label ?? "")
                .toLowerCase()
                .localeCompare((optionB?.label ?? "").toLowerCase())
            }
            options={[
              {
                value: "1",
                label: "B",
              },
              {
                value: "2",
                label: "C",
              },
              {
                value: "3",
                label: "A",
              },
              {
                value: "4",
                label: "D",
              },
              {
                value: "5",
                label: "E",
              },
              {
                value: "6",
                label: "Z",
              },
            ]}
          />
        </div>
        <CSVLink
          data={LAPORAN_TMP}
          headers={[
            { label: "Tanggal", key: "date" },
            { label: "Kota", key: "city" },
            { label: "Anggaran", key: "budget" },
            { label: "Realisasi", key: "realization" },
          ]}
          filename={"DATA_REALISASI_ANGGARAN_KOTA.csv"}
        >
          <Button type="primary" icon={<ExportOutlined />}>
            Export
          </Button>
        </CSVLink>
      </div>
      <div className="mt-4">
        <Table dataSource={LAPORAN_TMP} columns={columns} />
      </div>
    </>
  );
}
