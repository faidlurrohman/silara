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
import { useEffect, useRef, useState } from "react";
import { getCityList } from "../../services/city";
import { getRoles } from "../../services/role";
import { addUser, getUsers, removeUser } from "../../services/user";
import { PAGINATION } from "../../helpers/constants";
import { actionColumn, activeColumn, searchColumn } from "../../helpers/table";
import ExportButton from "../../components/button/ExportButton";
import ReloadButton from "../../components/button/ReloadButton";
import AddButton from "../../components/button/AddButton";

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
    getCityList().then((response) => {
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
    fetchDataCities();
    fetchDataRoles();

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
      message.success(`Data berhasil di ${isEdit ? `perbarui` : `tambahkan`}`);
      addUpdateRow(isEdit);
      setConfirmLoading(false);
      reloadTable();
    });
  };

  const columns = [
    searchColumn(
      searchInput,
      "username",
      "Nama Pengguna",
      filtered,
      true,
      sorted
    ),
    searchColumn(searchInput, "fullname", "Nama", filtered, true, sorted),
    searchColumn(searchInput, "title", "Jabatan", filtered, true, sorted),
    activeColumn(filtered),
    actionColumn(addUpdateRow, deleteRow),
  ];

  useEffect(() => {
    fetchDataUsers();
  }, [JSON.stringify(tableParams)]);

  return (
    <>
      <div className="flex flex-row space-x-2">
        <ExportButton data={users} target={`user`} stateLoading={loading} />
        <ReloadButton onClick={reloadTable} stateLoading={loading} />
        <AddButton onClick={addUpdateRow} stateLoading={loading} />
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
