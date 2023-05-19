import { Button, Input, Space } from "antd";
import { EditOutlined, SearchOutlined } from "@ant-design/icons";

export const searchColumn = (
  searchRef,
  key,
  labelHeader,
  stateFilter,
  useSort,
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
  onFilter: (value, record) =>
    record[key].toString().toLowerCase().includes(value.toLowerCase()),
  onFilterDropdownOpenChange: (visible) => {
    if (visible) {
      setTimeout(() => searchRef.current?.select(), 100);
    }
  },
  // IF USING SORT
  ...(useSort && {
    sorter: (a, b) =>
      sortType === "string" ? a[key].localeCompare(b[key]) : a[key] - b[key],
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
  onFilter: (value, record) => record?.active === value,
  filteredValue: stateFilter.active || null,
  render: (value) => (value ? "Ya" : "Tidak"),
});

export const actionColumn = (onAddUpdate) => ({
  title: "Action",
  key: "action",
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
