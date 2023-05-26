import { Button, DatePicker, Input, InputNumber, Space } from "antd";
import { EditOutlined, SearchOutlined } from "@ant-design/icons";
import { convertDate, viewDate } from "./date";
import { DATE_FORMAT_VIEW } from "./constants";
import { dbDate } from "./date";

export const searchColumn = (
  searchRef,
  key,
  labelHeader,
  stateFilter,
  useSort = false,
  stateSort,
  sortType = "string"
) => ({
  title: labelHeader,
  dataIndex: key,
  key: key,
  filterDropdown: ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
  }) => (
    <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
      {sortType === "int" ? (
        <InputNumber
          ref={searchRef}
          placeholder={`Cari ${labelHeader}`}
          className="w-full"
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e ? [e] : [])}
          onPressEnter={() => confirm()}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
      ) : key.includes("date") ? (
        <DatePicker
          ref={searchRef}
          placeholder={`Cari ${labelHeader}`}
          format={DATE_FORMAT_VIEW}
          value={selectedKeys[0] && convertDate(selectedKeys[0])}
          className="w-full"
          onChange={(e) => setSelectedKeys(e ? [dbDate(e)] : [])}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
      ) : (
        <Input
          ref={searchRef}
          placeholder={`Cari ${labelHeader}`}
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
      )}
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
  filteredValue: stateFilter[key] || null,
  onFilterDropdownOpenChange: (visible) => {
    if (visible && !key.includes("date")) {
      setTimeout(() => searchRef.current?.select(), 100);
    }
  },
  render: (value) => {
    if (key.includes("date")) return viewDate(value);

    return value;
  },
  // IF USING SORT
  ...(useSort && {
    sorter: true,
    sortOrder: stateSort.columnKey === key ? stateSort.order : null,
  }),
});

export const activeColumn = (stateFilter) => ({
  title: "Aktif",
  dataIndex: "active",
  key: "active",
  width: 100,
  filters: [
    { text: "Ya", value: true },
    { text: "Tidak", value: false },
  ],
  filteredValue: stateFilter.active || null,
  render: (value) => (value ? "Ya" : "Tidak"),
});

export const actionColumn = (onAddUpdate) => ({
  title: "#",
  key: "action",
  align: "center",
  width: 100,
  render: (value) => (
    <Space size="middle">
      <Button
        type="dashed"
        size="small"
        icon={<EditOutlined />}
        style={{ color: "#1677FF" }}
        onClick={() => onAddUpdate(true, value)}
      >
        Ubah
      </Button>
    </Space>
  ),
});
