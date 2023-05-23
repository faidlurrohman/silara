import { Button, DatePicker, Select } from "antd";
import { Pie } from "@ant-design/plots";
import moment from "moment";
import ComingSoon from "../components/ComingSoon";
import { useNavigate, useNavigation } from "react-router-dom";

const { RangePicker } = DatePicker;

const config1 = {
  appendPadding: 0,
  padding: 0,
  autoFit: true,
  data: [
    {
      type: "Anggaran",
      value: 43,
    },
    {
      type: "Realisasi Pendapatan",
      value: 57,
    },
  ],
  legend: false,
  angleField: "value",
  colorField: "type",
  radius: 0.8,
  label: {
    type: "inner",
    content: "{name}\n{percentage}",
    offset: "-50%",
    style: {
      fill: "#FFFFFF",
      fontSize: 12,
      textAlign: "center",
    },
  },
  tooltip: false,
  pieStyle: ({ type }) => {
    if (type === "Anggaran") {
      return { fill: "#0A4D68" };
    }

    return { fill: "#088395" };
  },
  interactions: [
    {
      type: "element-selected",
    },
    {
      type: "element-active",
    },
  ],
};

const config2 = {
  appendPadding: 0,
  padding: 0,
  autoFit: true,
  data: [
    {
      type: "Anggaran",
      value: 20,
    },
    {
      type: "Realisasi Belanja",
      value: 80,
    },
  ],
  legend: false,
  angleField: "value",
  colorField: "type",
  radius: 0.8,
  label: {
    type: "inner",
    content: "{name}\n{percentage}",
    offset: "-50%",
    style: {
      fill: "#FFFFFF",
      fontSize: 12,
      textAlign: "center",
    },
  },
  tooltip: false,
  pieStyle: ({ type }) => {
    if (type === "Anggaran") {
      return { fill: "#002B5B" };
    }

    return { fill: "#EA5455" };
  },
  interactions: [
    {
      type: "element-selected",
    },
    {
      type: "element-active",
    },
  ],
};

const config3 = {
  appendPadding: 0,
  padding: 0,
  autoFit: true,
  data: [
    {
      type: "Anggaran",
      value: 34,
    },
    {
      type: "Realisasi Pembayaran",
      value: 66,
    },
  ],
  legend: false,
  angleField: "value",
  colorField: "type",
  radius: 0.8,
  label: {
    type: "inner",
    content: "{name}\n{percentage}",
    offset: "-50%",
    style: {
      fill: "#FFFFFF",
      fontSize: 12,
      textAlign: "center",
    },
  },
  tooltip: false,
  pieStyle: ({ type }) => {
    if (type === "Anggaran") {
      return { fill: "#0B2447" };
    }

    return { fill: "#576CBC" };
  },
  interactions: [
    {
      type: "element-selected",
    },
    {
      type: "element-active",
    },
  ],
};

export default function Beranda() {
  const navigate = useNavigate();

  return <ComingSoon useNav={false} />;

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
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="text-center w-full md:w-1/3">
          <Pie {...config1} />
          <Button type="dashed" onClick={() => navigate("transaksi")}>
            Lihat Transaksi
          </Button>
        </div>
        <div className="text-center w-full md:w-1/3">
          <Pie {...config2} />
          <Button type="dashed" onClick={() => navigate("transaksi")}>
            Lihat Transaksi
          </Button>
        </div>
        <div className="text-center w-full md:w-1/3">
          <Pie {...config3} />
          <Button type="dashed" onClick={() => navigate("transaksi")}>
            Lihat Transaksi
          </Button>
        </div>
      </div>
      <ComingSoon useNav={false} />
    </>
  );
}
