import {
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  message,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { getAccountList } from "../../services/account";
import { DATE_FORMAT_VIEW, PAGINATION } from "../../helpers/constants";
import { actionColumn, searchColumn } from "../../helpers/table";
import ReloadButton from "../../components/button/ReloadButton";
import AddButton from "../../components/button/AddButton";
import ExportButton from "../../components/button/ExportButton";
import { responseGet } from "../../helpers/response";
import { addTransaction, getTransaction } from "../../services/transaction";
import { getCityList } from "../../services/city";
import { convertDate, dbDate } from "../../helpers/date";
import axios from "axios";

export default function Transaksi() {
  const [form] = Form.useForm();

  const searchInput = useRef(null);

  const [filtered, setFiltered] = useState({});
  const [sorted, setSorted] = useState({});
  const [tableParams, setTableParams] = useState(PAGINATION);

  const [isShow, setShow] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [cities, setCities] = useState([]);
  const [accountObject, setAccountObject] = useState([]);
  const [loading, setLoading] = useState(false);

  const reloadData = () => {
    setLoading(true);
    axios
      .all([
        getTransaction(tableParams),
        getCityList(),
        getAccountList("object"),
      ])
      .then(
        axios.spread((_transactions, _cities, _objects) => {
          setLoading(false);
          setTransactions(responseGet(_transactions).data);
          setTableParams({
            ...tableParams,
            pagination: {
              ...tableParams.pagination,
              total: responseGet(_transactions).total_count,
            },
          });
          setCities(_cities?.data?.data);
          setAccountObject(_objects?.data?.data);
        })
      );
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
      setTransactions([]);
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
        trans_date: convertDate(value?.trans_date),
        account_object_id: value?.account_object_id,
        city_id: value?.city_id,
        plan_amount: value?.plan_amount,
        real_amount: value?.real_amount,
      });
    }
  };

  const handleAddUpdate = (values) => {
    setConfirmLoading(true);
    addTransaction({ ...values, trans_date: dbDate(values?.trans_date) }).then(
      () => {
        message.success(
          `Data berhasil di ${isEdit ? `perbarui` : `tambahkan`}`
        );
        addUpdateRow(isEdit);
        setConfirmLoading(false);
        reloadTable();
      }
    );
  };

  const columns = [
    searchColumn(searchInput, "trans_date", "Tanggal", filtered, true, sorted),
    searchColumn(searchInput, "city_label", "Kota", filtered, true, sorted),
    searchColumn(
      searchInput,
      "account_object_label",
      "Objek Rekening",
      filtered,
      true,
      sorted
    ),
    searchColumn(
      searchInput,
      "plan_amount",
      "Anggaran",
      filtered,
      true,
      sorted,
      "int"
    ),
    searchColumn(
      searchInput,
      "real_amount",
      "Realisasi",
      filtered,
      true,
      sorted,
      "int"
    ),
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
        {!!transactions?.length && (
          <ExportButton
            data={transactions}
            target={`transaction`}
            stateLoading={loading}
          />
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
          dataSource={transactions}
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
        title={`${isEdit ? `Ubah` : `Tambah`} Data Rekening Jenis`}
        onCancel={() => addUpdateRow(isEdit)}
        footer={null}
      >
        <Divider />
        {/* <Card className="mb-4">
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
        </Card> */}
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 8 }}
          labelAlign="left"
          onFinish={handleAddUpdate}
          autoComplete="off"
          initialValues={{
            id: "",
            trans_date: convertDate(),
            plan_amount: 0,
            real_amount: 0,
          }}
        >
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            label="Tanggal Transaksi"
            name="trans_date"
            rules={[
              {
                required: true,
                message: "Tanggal Transaksi tidak boleh kosong!",
              },
            ]}
          >
            <DatePicker
              format={DATE_FORMAT_VIEW}
              className="w-full"
              placeholder=""
              disabled={confirmLoading}
            />
          </Form.Item>
          <Form.Item
            label="Kota"
            name="city_id"
            rules={[
              {
                required: true,
                message: "Kota tidak boleh kosong!",
              },
            ]}
          >
            <Select
              disabled={confirmLoading}
              loading={loading}
              options={cities}
            />
          </Form.Item>
          <Form.Item
            label="Objek Rekening"
            name="account_object_id"
            rules={[
              {
                required: true,
                message: "Objek Rekening tidak boleh kosong!",
              },
            ]}
          >
            <Select
              disabled={confirmLoading}
              loading={loading}
              options={accountObject}
            />
          </Form.Item>
          <Form.Item
            label="Anggaran (Rp)"
            name="plan_amount"
            rules={[
              {
                required: true,
                message: "Anggaran tidak boleh kosong!",
              },
              () => ({
                validator(_, value) {
                  if (value < 0) {
                    return Promise.reject("Anggaran minus");
                  } else {
                    return Promise.resolve();
                  }
                },
              }),
            ]}
          >
            <InputNumber className="w-full" disabled={confirmLoading} />
          </Form.Item>
          <Form.Item
            label="Realisasi (Rp)"
            name="real_amount"
            rules={[
              {
                required: true,
                message: "Realisasi tidak boleh kosong!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value > getFieldValue("plan_amount")) {
                    return Promise.reject(
                      "Realisasi lebih dari Total Anggaran"
                    );
                  } else if (value < 0) {
                    return Promise.reject("Realisasi minus");
                  } else {
                    return Promise.resolve();
                  }
                },
              }),
            ]}
          >
            <InputNumber className="w-full" disabled={confirmLoading} />
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
