import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  LoadingOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Space,
  Table,
  message,
} from "antd";
import { CSVLink } from "react-csv";
import { useEffect, useRef, useState } from "react";
import { addSigner, getSigner, removeSigner } from "../../services/signer";
import { PAGINATION } from "../../helpers/constants";

export default function PengaturanPenandaTangan() {
  const [form] = Form.useForm();

  const searchInput = useRef(null);

  const [filtered, setFiltered] = useState({});
  const [sorted, setSorted] = useState({});
  const [tableParams, setTableParams] = useState(PAGINATION);

  const [modal, modalHolder] = Modal.useModal();
  const [isShow, setShow] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [signer, setSigner] = useState([]);
  const [loading, setLoading] = useState(false);

  const getColumnSearchProps = (dataIndex, header) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Cari ${header}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => confirm()}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
          >
            Cari
          </Button>
          <Button onClick={() => clearFilters()} size="small">
            Hapus
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    filteredValue: filtered[dataIndex] || null,
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

  const columns = [
    {
      title: "NIP",
      dataIndex: "nip",
      key: "nip",
      sorter: (a, b) => a.nip - b.nip,
      sortOrder: sorted.columnKey === "nip" ? sorted.order : null,
      ...getColumnSearchProps("nip", "NIP"),
    },
    {
      title: "Nama",
      dataIndex: "fullname",
      key: "fullname",
      sorter: (a, b) => a.fullname.localeCompare(b.fullname),
      sortOrder: sorted.columnKey === "fullname" ? sorted.order : null,
      ...getColumnSearchProps("fullname", "Nama"),
    },
    {
      title: "Jabatan",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      sortOrder: sorted.columnKey === "title" ? sorted.order : null,
      ...getColumnSearchProps("title", "Jabatan"),
    },
    {
      title: "Aktif",
      dataIndex: "active",
      filters: [
        { text: "Ya", value: true },
        { text: "Tidak", value: false },
      ],
      onFilter: (value, record) => record?.active === value,
      filteredValue: filtered.active || null,
      render: (value) => (value ? "Ya" : "Tidak"),
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
            onClick={() => addUpdateRow(true, value)}
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

  const fetchDataSigner = () => {
    setLoading(true);
    getSigner().then((response) => {
      setLoading(false);
      setSigner(response?.data?.data);
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: tableParams?.extra
            ? tableParams?.extra?.currentDataSource.length
            : response?.data?.total_count,
        },
      });
    });
  };

  const onTableChange = (pagination, filters, sorter, extra) => {
    setFiltered(filters);
    setSorted(sorter);

    pagination = { ...pagination, total: extra?.currentDataSource?.length };

    setTableParams({
      pagination,
      filters,
      extra,
      ...sorter,
    });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setSigner([]);
    }
  };

  const reloadTable = () => {
    setFiltered({});
    setSorted({});
    setTableParams(PAGINATION);
  };

  const addUpdateRow = (isEdit = false, value = null) => {
    setShow(!isShow);

    if (!isEdit) {
      form.resetFields();
      setEdit(false);
    } else {
      setEdit(true);
      form.setFieldsValue({
        id: value?.id,
        nip: value?.nip,
        fullname: value?.fullname,
        title: value?.title,
        active: value?.active ? 1 : 0,
      });
    }
  };

  const deleteRow = (values) => {
    modal.warning({
      title: `Hapus Data`,
      content: (
        <p>
          Data{" "}
          <b>
            <u>{values?.nip}</u>
          </b>{" "}
          akan di hapus, apakah anda yakin untuk melanjutkan?
        </p>
      ),
      width: 500,
      okText: "Ya",
      cancelText: "Tidak",
      centered: true,
      okCancel: true,
      onOk() {
        removeSigner(values?.id).then(() => {
          message.success(`Data ${values?.nip} berhasil di hapus`);
          reloadTable();
        });
      },
    });
  };

  const handleAddUpdate = (values) => {
    setConfirmLoading(true);
    addSigner(values).then(() => {
      message.success(`Data berhasil di ${isEdit ? `perbarui` : `tambahkan`}`);
      addUpdateRow(isEdit);
      setConfirmLoading(false);
      reloadTable();
    });
  };

  useEffect(() => {
    fetchDataSigner();
  }, [JSON.stringify(tableParams)]);

  return (
    <>
      <div className="flex flex-row space-x-2">
        <CSVLink
          data={signer.map(({ nip, fullname, title, active }) => ({
            nip,
            fullname,
            title,
            active: active ? `Ya` : `Tidak`,
          }))}
          headers={[
            { label: "NIP", key: "nip" },
            { label: "Nama", key: "fullnase" },
            { label: "Jabatan", key: "title" },
            { label: "Aktif", key: "active" },
          ]}
          filename={"DATA_PENANDA_TANGAN.csv"}
        >
          <Button type="primary" icon={<ExportOutlined />} disabled={loading}>
            Export
          </Button>
        </CSVLink>
        <Button
          type="primary"
          icon={loading ? <LoadingOutlined /> : <ReloadOutlined />}
          disabled={loading}
          onClick={() => reloadTable()}
        >
          Perbarui
        </Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => addUpdateRow()}
        >
          Tambah Data
        </Button>
      </div>
      <div className="mt-4">
        <Table
          loading={loading}
          dataSource={signer}
          columns={columns}
          rowKey={(record) => record?.id}
          onChange={onTableChange}
          pagination={tableParams.pagination}
        />
      </div>
      <Modal
        centered
        open={isShow}
        title={`${isEdit ? `Ubah` : `Tambah`} Data Penanda Tangan`}
        onCancel={() => addUpdateRow(isEdit)}
        footer={null}
      >
        <Divider />
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 6 }}
          labelAlign="left"
          onFinish={handleAddUpdate}
          autoComplete="off"
          initialValues={{ id: "", active: 1 }}
        >
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            label="NIP"
            name="nip"
            rules={[
              {
                required: true,
                message: "NIP tidak boleh kosong!",
              },
            ]}
          >
            <InputNumber className="w-full" disabled={confirmLoading} />
          </Form.Item>
          <Form.Item
            label="Nama"
            name="fullname"
            rules={[
              {
                required: true,
                message: "Nama tidak boleh kosong!",
              },
            ]}
          >
            <Input disabled={confirmLoading} />
          </Form.Item>
          <Form.Item
            label="Jabatan"
            name="title"
            rules={[
              {
                required: true,
                message: "Jabatan tidak boleh kosong!",
              },
            ]}
          >
            <Input disabled={confirmLoading} />
          </Form.Item>
          <Form.Item label="Aktif" name="active">
            <Radio.Group disabled={confirmLoading}>
              <Radio value={1}>Ya</Radio>
              <Radio value={0}>Tidak</Radio>
            </Radio.Group>
          </Form.Item>
          <Divider />
          <Form.Item className="text-right mb-0">
            <Space direction="horizontal">
              <Button
                disabled={confirmLoading}
                onClick={() => addUpdateRow(isEdit)}
              >
                Kembali
              </Button>
              <Button loading={confirmLoading} htmlType="submit" type="primary">
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
