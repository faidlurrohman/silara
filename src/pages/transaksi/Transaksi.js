import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
} from "antd";
import { useAppDispatch } from "../../hooks/useRedux";
import { CSVLink } from "react-csv";
import { useRef, useState } from "react";
import { TRANSAKSI_TMP } from "../../helpers/constants";

export default function Transaksi() {
  const [modal, modalHolder] = Modal.useModal();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const searchInput = useRef(null);
  const [isShow, setShow] = useState(false);
  const [isEdit, setEdit] = useState(false);

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Space>
          <Input
            allowClear
            ref={searchInput}
            placeholder={`Cari ${dataIndex}`}
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
      title: "Objek Rekening",
      dataIndex: "object_account",
      defaultSortOrder: "ascend",
      sorter: (a, b) => a.object_account.localeCompare(b.object_account),
      ...getColumnSearchProps("object_account"),
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
    {
      title: "Action",
      width: 200,
      render: (value) => (
        <Space size="middle">
          <Button
            type="dashed"
            size="small"
            icon={<EditOutlined />}
            style={{ color: "#1677FF" }}
            onClick={() => addRow(true, value)}
          >
            Ubah
          </Button>
          <Button
            type="dashed"
            size="small"
            icon={<DeleteOutlined />}
            danger
            onClick={() => deleteRow(value)}
          >
            Hapus
          </Button>
        </Space>
      ),
    },
  ];

  const deleteRow = (value) => {
    modal.warning({
      title: `Hapus Data`,
      content: (
        <p>
          Data{" "}
          <b>
            <u>{value?.date}</u>
          </b>{" "}
          akan di hapus, apakah anda yakin untuk melanjutkan?
        </p>
      ),
      width: 500,
      okText: "Ya",
      cancelText: "Tidak",
      centered: true,
      okCancel: true,
    });
  };

  const addRow = (isEdit = false, value = null) => {
    setShow(!isShow);

    if (!isEdit) {
      form.resetFields();
      setEdit(false);
    } else {
      setEdit(true);
      form.setFieldsValue({});
    }
  };

  return (
    <>
      <div className="flex flex-row space-x-2">
        <CSVLink
          data={TRANSAKSI_TMP}
          headers={[
            { label: "Tanggal", key: "date" },
            { label: "Kota", key: "city" },
            { label: "Objek Rekening", key: "object_account" },
            { label: "Anggaran", key: "budget" },
            { label: "Realisasi", key: "realization" },
          ]}
          filename={"DATA_TRANSAKSI.csv"}
        >
          <Button type="primary" icon={<ExportOutlined />}>
            Export
          </Button>
        </CSVLink>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => addRow()}>
          Tambah Data
        </Button>
      </div>
      <div className="mt-4">
        <Table dataSource={TRANSAKSI_TMP} columns={columns} />
      </div>
      <Modal
        centered
        open={isShow}
        title={`${isEdit ? `Ubah` : `Tambah`} Transaksi`}
        onCancel={() => addRow(isEdit)}
        footer={null}
        width={650}
      >
        <Divider />
        <Card className="mb-4">
          <h4 className="text-center p-0 mt-0">Riwayat Data Terakhir</h4>
          <div className="flex flex-1 flex-row space-x-6">
            <div className="flex flex-1">
              <div className="flex-1">
                <h2 className="text-sm md:inline">{`Tanggal Transaksi`}</h2>
              </div>
              <div>
                <h2 className="text-sm md:inline">{`01-01-2022`}</h2>
              </div>
            </div>
            <div className="flex flex-1"></div>
          </div>
          <div className="flex flex-1 flex-row space-x-6">
            <div className="flex flex-1">
              <div className="flex-1">
                <h2 className="text-sm md:inline">{`Anggaran (Rp)`}</h2>
              </div>
              <div>
                <h2 className="text-sm md:inline">{`0000000`}</h2>
              </div>
            </div>
            <div className="flex flex-1 space-x-6">
              <div className="flex-1 text-end">
                <h2 className="text-sm md:inline">{`Realisasi (Rp)`}</h2>
              </div>
              <div>
                <h2 className="text-sm md:inline">{`0000000`}</h2>
              </div>
            </div>
          </div>
        </Card>
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 8 }}
          labelAlign="left"
          // onFinish={handleAdd}
          autoComplete="off"
        >
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="Tanggal Transaksi" name="date">
            <DatePicker className="w-full" placeholder="" />
          </Form.Item>
          <Form.Item label="Kota" name="city">
            <Select />
          </Form.Item>
          <Form.Item label="Objek Rekening" name="object_account_id">
            <Select />
          </Form.Item>
          <Form.Item label="Anggaran (Rp)" name="budget">
            <InputNumber className="w-full" />
          </Form.Item>
          <Form.Item label="Realisasi (Rp)" name="realization">
            <InputNumber className="w-full" />
          </Form.Item>
          <Divider />
          <Form.Item className="text-right">
            <Space direction="horizontal">
              <Button onClick={() => addRow(isEdit)}>Kembali</Button>
              <Button htmlType="submit" type="primary">
                Simpan
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      {modalHolder}
    </>
  );
}
