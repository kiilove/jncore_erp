// ProductAddSection.jsx
import React from "react";
import { Card, Form, Input, Checkbox, Select, InputNumber, Button } from "antd";

const { Option } = Select;

const ProductAddSection = ({
  form,
  manualInput,
  setManualInput,
  showProductSearchModal,
}) => (
  <Card title="제품 추가" bordered={false} style={{ marginBottom: 16 }}>
    <Form.Item>
      <Checkbox
        checked={manualInput}
        onChange={(e) => setManualInput(e.target.checked)}
      >
        제품 수동 입력
      </Checkbox>
    </Form.Item>

    {!manualInput ? (
      <Form.Item label="제품 검색" name="productName">
        <Input
          placeholder="제품을 검색하세요"
          onClick={showProductSearchModal}
        />
      </Form.Item>
    ) : (
      <>
        <Form.Item
          label="제품명"
          name="productName"
          rules={[{ required: true, message: "제품명을 입력하세요." }]}
        >
          <Input placeholder="제품명을 입력하세요" />
        </Form.Item>
        <Form.Item
          label="제품 종류"
          name="productType"
          rules={[{ required: true, message: "제품 종류를 선택하세요." }]}
        >
          <Select placeholder="제품 종류를 선택하세요">
            <Option value="laptop">노트북</Option>
            <Option value="desktop">데스크탑</Option>
            <Option value="server">서버</Option>
            <Option value="other">기타</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="수량"
          name="quantity"
          rules={[{ required: true, message: "수량을 입력하세요." }]}
        >
          <InputNumber min={1} placeholder="수량을 입력하세요" />
        </Form.Item>
        <Form.Item
          label="단가"
          name="unitPrice"
          rules={[{ required: true, message: "단가를 입력하세요." }]}
        >
          <InputNumber min={0} placeholder="단가를 입력하세요" />
        </Form.Item>
      </>
    )}

    <Button type="dashed" onClick={form.submit} block>
      제품 추가
    </Button>
  </Card>
);

export default ProductAddSection;
