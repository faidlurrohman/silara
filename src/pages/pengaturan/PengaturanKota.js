import {
  App,
  Button,
  Divider,
  Form,
  Input,
  Modal,
  Radio,
  Space,
  Table,
  // message,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { addCity, getCities } from "../../services/city";
import { PAGINATION } from "../../helpers/constants";
import { actionColumn, activeColumn, searchColumn } from "../../helpers/table";
import ExportButton from "../../components/button/ExportButton";
import ReloadButton from "../../components/button/ReloadButton";
import AddButton from "../../components/button/AddButton";
import { responseGet } from "../../helpers/response";

export default function PengaturanKota() {
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const searchInput = useRef(null);

  const [filtered, setFiltered] = useState({});
  const [sorted, setSorted] = useState({});
  const [tableParams, setTableParams] = useState(PAGINATION);

  const [isShow, setShow] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);

  const reloadData = () => {
    setLoading(true);
    getCities(tableParams).then((response) => {
      setLoading(false);
      setCities(responseGet(response).data);
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: responseGet(response).total_count,
        },
      });
    });
  };

  const onTableChange = (pagination, filters, sorter) => {
    setFiltered(filters);
    setSorted(sorter);

    setTableParams({
      pagination,
      filters,
      ...sorter,
    });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setCities([]);
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
        label: value?.label,
        active: value?.active ? 1 : 0,
      });
    }
  };

  const handleAddUpdate = async (values) => {
    setConfirmLoading(true);

    addCity(values).then((response) => {
      setConfirmLoading(false);

      if (response?.data?.code === 0) {
        message.success(
          `Data berhasil di ${isEdit ? `perbarui` : `tambahkan`}`
        );
        addUpdateRow(isEdit);
        reloadTable();
      }
    });
  };

  const columns = [
    searchColumn(searchInput, "label", "Nama Kota", filtered, true, sorted),
    activeColumn(filtered),
    actionColumn(addUpdateRow),
  ];

  useEffect(() => {
    reloadData();
  }, [JSON.stringify(tableParams)]);

  return (
    <>
      <div className="flex flex-col space-y-2 sm:space-y-0 sm:space-x-2 sm:flex-row md:space-y-0 md:space-x-2 md:flex-row">
        <ReloadButton onClick={reloadTable} stateLoading={loading} />
        <AddButton onClick={addUpdateRow} stateLoading={loading} />
        {!!cities?.length && (
          <ExportButton data={cities} target={`city`} stateLoading={loading} />
        )}
      </div>
      <div className="mt-4">
        <Table
          scroll={{
            scrollToFirstRowOnChange: true,
            x: "max-content",
          }}
          bordered
          loading={loading}
          dataSource={cities}
          columns={columns}
          rowKey={(record) => record?.id}
          onChange={onTableChange}
          pagination={tableParams.pagination}
        />
      </div>
      <Modal
        style={{ margin: 10 }}
        centered
        open={isShow}
        title={`${isEdit ? `Ubah` : `Tambah`} Data Kota`}
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
            label="Nama Kota"
            name="label"
            rules={[
              {
                required: true,
                message: "Nama Kota tidak boleh kosong!",
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
    </>
  );
}
