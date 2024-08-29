import React, { useState, useEffect } from "react";
import { Row, Col, Input, Button } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const FormField = ({
  field,
  index,
  handleInputChange,
  moveField,
  handleDeleteField,
}) => {
  const [inputValue, setInputValue] = useState(field.value);

  useEffect(() => {
    // field.value가 변경될 때마다 inputValue를 업데이트
    setInputValue(field.value);
  }, [field.value]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
    handleInputChange(field.key, e.target.value);
  };

  return (
    <React.Fragment key={field.key}>
      <Col span={7}>
        <Input
          value={field.label}
          readOnly
          style={{
            marginBottom: "5px",
            fontSize: "14px",
          }}
        />
      </Col>
      <Col span={11}>
        <Input
          placeholder={`Enter ${field.label}`}
          value={inputValue}
          onChange={handleChange}
          style={{
            marginBottom: "5px",
            fontSize: "14px",
          }}
        />
      </Col>
      <Col span={6}>
        <Button
          icon={<ArrowUpOutlined />}
          onClick={() => moveField(index, "up")}
          size="small"
          style={{ marginBottom: "5px" }}
        />
        <Button
          icon={<ArrowDownOutlined />}
          onClick={() => moveField(index, "down")}
          size="small"
          style={{ marginBottom: "5px" }}
        />
        <Button
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteField(field.key)}
          size="small"
        />
      </Col>
    </React.Fragment>
  );
};

export default FormField;
