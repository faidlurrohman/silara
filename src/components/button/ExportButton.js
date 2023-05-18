import { CSVLink } from "react-csv";
import { Button } from "antd";
import { ExportOutlined } from "@ant-design/icons";
import { EXPORT_TARGET } from "../../helpers/constants";

export default function ExportButton({
  title = "Export",
  data,
  target,
  stateLoading,
}) {
  const exportData = (data = [], target = "") =>
    data.map((item) => {
      Object.keys(item).map((key) => {
        if (!EXPORT_TARGET[target].fields.includes(key)) {
          delete item[key];
        } else {
          if (key === "active") {
            item[key] = item[key] ? `Ya` : `Tidak`;
          }
        }
      });
      return item;
    });

  return (
    <CSVLink
      data={exportData(data, target) || []}
      headers={EXPORT_TARGET[target].headers}
      filename={`${EXPORT_TARGET[target].filename}.csv`}
    >
      <Button type="primary" icon={<ExportOutlined />} disabled={stateLoading}>
        {title}
      </Button>
    </CSVLink>
  );
}
