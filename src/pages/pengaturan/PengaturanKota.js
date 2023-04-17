import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Divider, Form, Input, Modal, Radio, Space, Table } from "antd";
import { useAppDispatch } from "../../hooks/useRedux";
import { CSVLink } from "react-csv";
import { useRef, useState } from "react";

export default function PengaturanKota() {
  const [modalHolder] = Modal.useModal();
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
            placeholder={`Cari ${
              dataIndex === `nama` ? `nama kota` : dataIndex
            }`}
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

  const dummies = [
    {
      key: "1",
      nama: "Gresik",
      isActive: 0,
    },
    {
      key: "2",
      nama: "Surabaya",
      isActive: 0,
    },
    {
      key: "3",
      nama: "Jakarta",
      isActive: 1,
    },
    {
      key: "4",
      nama: "Batam",
      isActive: 0,
    },
    {
      key: "5",
      nama: "Tanjung Pinang",
      isActive: 1,
    },
    {
      key: "6",
      nama: "Belakang Padang",
      isActive: 1,
    },
  ];

  const columns = [
    {
      title: "Nama Kota",
      dataIndex: "nama",
      defaultSortOrder: "ascend",
      sorter: (a, b) => a.nama.localeCompare(b.nama),
      ...getColumnSearchProps("nama"),
    },
    {
      title: "Aktif",
      dataIndex: "isActive",
      render: (value) => (value ? "Ya" : "Tidak"),
      sorter: (a, b) => a.isActive - b.isActive,
    },
    {
      title: "Action",
      key: "operation",
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
    Modal.warning({
      title: `Hapus Data`,
      content: (
        <p>
          Data{" "}
          <b>
            <u>{value?.nama}</u>
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
      form.setFieldsValue({
        key: value?.key,
        nama: value?.nama,
        isActive: value?.isActive,
      });
    }
  };

  return (
    <>
      <div className="flex flex-row space-x-2">
        <CSVLink
          data={dummies.map(({ nama, isActive }) => ({
            nama,
            isActive: isActive ? `Ya` : `Tidak`,
          }))}
          headers={[
            { label: "Nama Kota", key: "nama" },
            { label: "Aktif", key: "isActive" },
          ]}
          filename={"DATA_KOTA.csv"}
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
        <Table dataSource={dummies} columns={columns} />
      </div>
      <Modal
        centered
        open={isShow}
        title={`${isEdit ? `Ubah` : `Tambah`} Data Kota`}
        onCancel={() => addRow(isEdit)}
        footer={null}
      >
        <Divider />
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 6 }}
          labelAlign="left"
          // onFinish={handleAdd}
          autoComplete="off"
        >
          <Form.Item name="key" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="Nama Kota" name="nama">
            <Input />
          </Form.Item>
          <Form.Item label="Aktif" name="isActive">
            <Radio.Group>
              <Radio value={1}>Ya</Radio>
              <Radio value={0}>Tidak</Radio>
            </Radio.Group>
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
