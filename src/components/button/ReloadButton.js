import { LoadingOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React from "react";

export default function ReloadButton({
  title = "Perbarui",
  onClick,
  stateLoading,
}) {
  return (
    <Button
      type="primary"
      icon={stateLoading ? <LoadingOutlined /> : <ReloadOutlined />}
      disabled={stateLoading}
      onClick={() => onClick()}
    >
      {title}
    </Button>
  );
}
