// CustomerInfoForm.jsx
import React from "react";
import { Form, Input, Card } from "antd";

const CustomerInfoForm = ({ form }) => (
  <Card title="고객사 정보" bordered={false} style={{ marginBottom: 16 }}>
    <Form.Item
      label="고객명"
      name="customerName"
      rules={[{ required: true, message: "고객명을 입력하세요." }]}
    >
      <Input placeholder="고객명을 입력하세요" />
    </Form.Item>
    <Form.Item
      label="연락처"
      name="contact"
      rules={[{ required: true, message: "연락처를 입력하세요." }]}
    >
      <Input placeholder="연락처를 입력하세요" />
    </Form.Item>
    <Form.Item
      label="이메일"
      name="email"
      rules={[
        {
          required: true,
          type: "email",
          message: "유효한 이메일을 입력하세요.",
        },
      ]}
    >
      <Input placeholder="이메일을 입력하세요" />
    </Form.Item>
  </Card>
);

export default CustomerInfoForm;
