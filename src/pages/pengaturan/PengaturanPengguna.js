import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Divider,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Space,
  Table,
} from "antd";
import { useAppDispatch } from "../../hooks/useRedux";
import { CSVLink } from "react-csv";
import { useRef, useState } from "react";
import { PENGGUNA_TMP } from "../../helpers/constants";

export default function PengaturanPengguna() {
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
            placeholder={`Cari ${
              dataIndex === `name`
                ? `nama`
                : dataIndex === "username"
                ? `nama pengguna`
                : dataIndex
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

  const columns = [
    {
      title: "Nama Pengguna",
      dataIndex: "username",
      defaultSortOrder: "ascend",
      sorter: (a, b) => a.username.localeCompare(b.username),
      ...getColumnSearchProps("username"),
    },
    {
      title: "Nama",
      dataIndex: "name",
      defaultSortOrder: "ascend",
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...getColumnSearchProps("name"),
    },
    {
      title: "Jabatan",
      dataIndex: "position",
      defaultSortOrder: "ascend",
      sorter: (a, b) => a.position.localeCompare(b.position),
      ...getColumnSearchProps("jabatan"),
    },
    {
      title: "Aktif",
      dataIndex: "isActive",
      render: (value) => (value ? "Ya" : "Tidak"),
      sorter: (a, b) => a.isActive - b.isActive,
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
            <u>{value?.name}</u>
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
        id: value?.id,
        name: value?.name,
        username: value?.username,
        password: value?.password,
        position: value?.position,
        isActive: value?.isActive,
      });
    }
  };

  return (
    <>
      <div className="flex flex-row space-x-2">
        <CSVLink
          data={PENGGUNA_TMP.map(({ name, username, position, isActive }) => ({
            name,
            username,
            position,
            isActive: isActive ? `Ya` : `Tidak`,
          }))}
          headers={[
            { label: "Nama Pengguna", key: "username" },
            { label: "Nama", key: "name" },
            { label: "Jabatan", key: "position" },
            { label: "Aktif", key: "isActive" },
          ]}
          filename={"DATA_PENGGUNA.csv"}
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
        <Table dataSource={PENGGUNA_TMP} columns={columns} />
      </div>
      <Modal
        centered
        open={isShow}
        title={`${isEdit ? `Ubah` : `Tambah`} Data Penanda Tangan`}
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
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="Nama Pengguna" name="username">
            <Input />
          </Form.Item>
          <Form.Item label="Kata Sandi" name="password">
            <Input.Password />
          </Form.Item>
          <Form.Item label="Nama" name="name">
            <Input />
          </Form.Item>
          <Form.Item label="Jabatan" name="position">
            <Input />
          </Form.Item>
          <Form.Item label="Akses Pengguna" name="user_access">
            <Select />
          </Form.Item>
          <Form.Item label="Akses Kota" name="city_access">
            <Select />
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
