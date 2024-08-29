// components/ActionButton.js

import React from "react";
import { Button } from "antd";
import { CopyOutlined, PlusOutlined } from "@ant-design/icons";

export const CopyButton = ({ text, onCopy }) => (
  <Button
    icon={<CopyOutlined />}
    onClick={() => onCopy(text)}
    size="large"
    shape="circle"
    style={{ marginLeft: "10px" }}
  />
);

export const AddFieldButton = ({ onAdd, fieldKey, fieldValue }) => (
  <Button
    icon={<PlusOutlined />}
    onClick={() => onAdd(fieldKey, fieldValue)}
    size="large"
    shape="circle"
    style={{ marginLeft: "10px" }}
  />
);
