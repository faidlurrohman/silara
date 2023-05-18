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
  return (
    <CSVLink
      data={
        data.map(({ active, ...rest }) => ({
          ...rest,
          active: active ? `Ya` : `Tidak`,
        })) || []
      }
      headers={EXPORT_TARGET[target].headers}
      filename={`${EXPORT_TARGET[target].filename}.csv`}
    >
      <Button type="primary" icon={<ExportOutlined />} disabled={stateLoading}>
        {title}
      </Button>
    </CSVLink>
  );
}
