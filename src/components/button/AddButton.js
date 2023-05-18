import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React from "react";

export default function AddButton({
  title = "Tambah Data",
  onClick,
  stateLoading,
}) {
  return (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => onClick()}
      disabled={stateLoading}
    >
      {title}
    </Button>
  );
}
