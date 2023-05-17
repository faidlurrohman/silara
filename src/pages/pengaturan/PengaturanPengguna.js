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
import { getCities } from "../../services/city";
import { getRoles } from "../../services/role";
import { addUser, getUsers, removeUser } from "../../services/user";
import { PAGINATION } from "../../helpers/constants";

export default function PengaturanPengguna() {
  const [form] = Form.useForm();

  const searchInput = useRef(null);

  const [filtered, setFiltered] = useState({});
  const [sorted, setSorted] = useState({});
  const [tableParams, setTableParams] = useState(PAGINATION);

  const [modal, modalHolder] = Modal.useModal();
  const [isShow, setShow] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [cities, setCities] = useState([]);
  const [loadingCity, setLoadingCity] = useState(false);

  const [roles, setRoles] = useState([]);
  const [loadingRole, setLoadingRole] = useState(false);

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
      title: "Nama Pengguna",
      dataIndex: "username",
      key: "username",
      sorter: (a, b) => a.username.localeCompare(b.username),
      sortOrder: sorted.columnKey === "username" ? sorted.order : null,
      ...getColumnSearchProps("username", "Nama Pengguna"),
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

  const fetchDataUsers = () => {
    setLoading(true);
    getUsers().then((response) => {
      setLoading(false);
      setUsers(response?.data?.data);
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

  const fetchDataCities = () => {
    setLoadingCity(true);
    getCities().then((response) => {
      setLoadingCity(false);
      setCities(response?.data?.data);
    });
  };

  const fetchDataRoles = () => {
    setLoadingRole(true);
    getRoles().then((response) => {
      setLoadingRole(false);
      setRoles(response?.data?.data);
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
      setUsers([]);
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
        fullname: value?.fullname,
        username: value?.username,
        password: value?.password,
        title: value?.title,
        role_id: value?.role_id,
        city_id: value?.city_id,
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
            <u>{values?.username}</u>
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
        removeUser(values?.id).then(() => {
          message.success(`Data ${values?.username} berhasil di hapus`);
          reloadTable();
        });
      },
    });
  };

  const handleAddUpdate = (values) => {
    setConfirmLoading(true);
    addUser(values).then(() => {
      message.success(`Data berhasil di ${isEdit ? `perbarui` : `tambahan`}`);
      addUpdateRow(isEdit);
      setConfirmLoading(false);
      reloadTable();
    });
  };

  useEffect(() => {
    fetchDataUsers();
  }, [JSON.stringify(tableParams)]);

  useEffect(() => {
    fetchDataCities();
    fetchDataRoles();
  }, []);

  return (
    <>
      <div className="flex flex-row space-x-2">
        <CSVLink
          data={users.map(({ username, fullname, title, active }) => ({
            username,
            fullname,
            title,
            active: active ? `Ya` : `Tidak`,
          }))}
          headers={[
            { label: "Nama Pengguna", key: "username" },
            { label: "Nama", key: "fullname" },
            { label: "Jabatan", key: "title" },
            { label: "Aktif", key: "active" },
          ]}
          filename={"DATA_PENGGUNA.csv"}
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
          dataSource={users}
          columns={columns}
          rowKey={(record) => record?.id}
          onChange={onTableChange}
          pagination={tableParams.pagination}
        />
      </div>
      <Modal
        centered
        open={isShow}
        title={`${isEdit ? `Ubah` : `Tambah`} Data Pengguna`}
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
            label="Nama Pengguna"
            name="username"
            rules={[
              {
                required: true,
                message: "Nama Pengguna tidak boleh kosong!",
              },
            ]}
          >
            <Input disabled={confirmLoading} />
          </Form.Item>
          <Form.Item
            label="Kata Sandi"
            name="password"
            rules={[
              {
                required: true,
                message: "Kata Sandi tidak boleh kosong!",
              },
            ]}
          >
            <Input.Password disabled={confirmLoading} />
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
          <Form.Item
            label="Akses Pengguna"
            name="role_id"
            rules={[
              {
                required: true,
                message: "Akses Pengguna tidak boleh kosong!",
              },
            ]}
          >
            <Select
              disabled={confirmLoading}
              loading={loadingRole}
              options={roles}
            />
          </Form.Item>
          <Form.Item
            label="Akses Kota"
            name="city_id"
            rules={[
              {
                required: true,
                message: "Akses Kota tidak boleh kosong!",
              },
            ]}
          >
            <Select
              disabled={confirmLoading}
              loading={loadingCity}
              options={cities}
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
