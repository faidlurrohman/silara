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
  Modal,
  Radio,
  Select,
  Space,
  Table,
  message,
} from "antd";
import { CSVLink } from "react-csv";
import { useEffect, useRef, useState } from "react";
import {
  addAccount,
  getAccount,
  getAccountList,
  removeAccount,
} from "../../services/account";
import { PAGINATION } from "../../helpers/constants";

export default function RekeningKelompok() {
  const [form] = Form.useForm();

  const searchInput = useRef(null);

  const [filtered, setFiltered] = useState({});
  const [sorted, setSorted] = useState({});
  const [tableParams, setTableParams] = useState(PAGINATION);

  const [modal, modalHolder] = Modal.useModal();
  const [isShow, setShow] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [accountGroup, setAccountGroup] = useState([]);
  const [loading, setLoading] = useState(false);

  const [accountBase, setAccountBase] = useState([]);
  const [loadingBase, setLoadingBase] = useState(false);

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
      title: "Akun Rekening",
      dataIndex: "account_base_label",
      key: "account_base_label",
      width: 200,
      sorter: (a, b) =>
        a.account_base_label.localeCompare(b.account_base_label),
      sortOrder:
        sorted.columnKey === "account_base_label" ? sorted.order : null,
      ...getColumnSearchProps("account_base_label", "Akun Rekening"),
    },
    {
      title: "Label",
      dataIndex: "label",
      key: "label",
      width: 200,
      sorter: (a, b) => a.label.localeCompare(b.label),
      sortOrder: sorted.columnKey === "label" ? sorted.order : null,
      ...getColumnSearchProps("label", "Label"),
    },
    {
      title: "Keterangan",
      dataIndex: "remark",
      key: "remark",
      sorter: (a, b) => a.remark.localeCompare(b.remark),
      sortOrder: sorted.columnKey === "remark" ? sorted.order : null,
      ...getColumnSearchProps("remark", "Keterangan"),
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

  const fetchDataUsers = () => {
    setLoading(true);
    getAccount("group").then((response) => {
      setLoading(false);
      setAccountGroup(response?.data?.data);
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

  const fetchDataAccountBase = () => {
    setLoadingBase(true);
    getAccountList("base").then((response) => {
      setLoadingBase(false);
      setAccountBase(response?.data?.data);
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
      setAccountGroup([]);
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
        account_base_id: value?.account_base_id,
        label: value?.label,
        remark: value?.remark,
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
            <u>{values?.label}</u>
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
        removeAccount("group", values?.id).then(() => {
          message.success(`Data ${values?.label} berhasil di hapus`);
          reloadTable();
        });
      },
    });
  };

  const handleAddUpdate = (values) => {
    setConfirmLoading(true);
    addAccount("group", values).then(() => {
      message.success(`Data berhasil di ${isEdit ? `perbarui` : `tambahkan`}`);
      addUpdateRow(isEdit);
      setConfirmLoading(false);
      reloadTable();
    });
  };

  useEffect(() => {
    fetchDataUsers();
  }, [JSON.stringify(tableParams)]);

  useEffect(() => {
    fetchDataAccountBase();
  }, []);

  return (
    <>
      <div className="flex flex-row space-x-2">
        <CSVLink
          data={accountGroup.map(
            ({ account_base_label, label, remark, active }) => ({
              account_base_label,
              label,
              remark,
              active: active ? `Ya` : `Tidak`,
            })
          )}
          headers={[
            { label: "Akun Rekening", key: "account_base_label" },
            { label: "Label", key: "label" },
            { label: "Keterangan", key: "remark" },
            { label: "Aktif", key: "active" },
          ]}
          filename={"DATA_REKENING_KELOMPOK.csv"}
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
          dataSource={accountGroup}
          columns={columns}
          rowKey={(record) => record?.id}
          onChange={onTableChange}
          pagination={tableParams.pagination}
        />
      </div>
      <Modal
        centered
        open={isShow}
        title={`${isEdit ? `Ubah` : `Tambah`} Data Rekening Kelompok`}
        onCancel={() => addUpdateRow(isEdit)}
        footer={null}
      >
        <Divider />
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 8 }}
          labelAlign="left"
          onFinish={handleAddUpdate}
          autoComplete="off"
          initialValues={{ id: "", active: 1 }}
        >
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            label="Akun Rekening"
            name="account_base_id"
            rules={[
              {
                required: true,
                message: "Akun Rekening tidak boleh kosong!",
              },
            ]}
          >
            <Select
              disabled={confirmLoading}
              loading={loadingBase}
              options={accountBase}
            />
          </Form.Item>
          <Form.Item
            label="Label"
            name="label"
            rules={[
              {
                required: true,
                message: "Label tidak boleh kosong!",
              },
            ]}
          >
            <Input disabled={confirmLoading} />
          </Form.Item>
          <Form.Item
            label="Keterangan"
            name="remark"
            rules={[
              {
                required: true,
                message: "Keterangan tidak boleh kosong!",
              },
            ]}
          >
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 6 }}
              disabled={confirmLoading}
            />
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
