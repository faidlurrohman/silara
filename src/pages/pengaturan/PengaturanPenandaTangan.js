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
import { useEffect, useRef, useState } from "react";
import { addSigner, getSigner, removeSigner } from "../../services/signer";
import { PAGINATION } from "../../helpers/constants";
import { actionColumn, activeColumn, searchColumn } from "../../helpers/table";
import ExportButton from "../../components/button/ExportButton";
import ReloadButton from "../../components/button/ReloadButton";
import AddButton from "../../components/button/AddButton";

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

  const columns = [
    searchColumn(searchInput, "nip", "Nip", filtered, true, sorted, "int"),
    searchColumn(searchInput, "fullname", "Nama", filtered, true, sorted),
    searchColumn(searchInput, "title", "Jabatan", filtered, true, sorted),
    activeColumn(filtered),
    actionColumn(addUpdateRow, deleteRow),
  ];

  useEffect(() => {
    fetchDataSigner();
  }, [JSON.stringify(tableParams)]);

  return (
    <>
      <div className="flex flex-row space-x-2">
        <ExportButton data={signer} target={`signer`} stateLoading={loading} />
        <ReloadButton onClick={reloadTable} stateLoading={loading} />
        <AddButton onClick={addUpdateRow} stateLoading={loading} />
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