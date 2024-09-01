import React from "react";
import { Form, Input, Checkbox, Button, Card } from "antd";

const ClientAddSection = ({
  form,

  manualInput,
  setManualInput,
  showClientSearchModal,
}) => {
  return (
    <Card title="고객사 정보" bordered={false} style={{ marginBottom: 16 }}>
      <Form.Item>
        <Checkbox
          checked={manualInput}
          onChange={(e) => setManualInput(e.target.checked)}
        >
          고객사 정보 수동 입력
        </Checkbox>
      </Form.Item>

      {!manualInput ? (
        <Form.Item label="고객사 검색" name="customerName">
          <Input
            placeholder="고객사를 검색하세요"
            onClick={showClientSearchModal}
          />
        </Form.Item>
      ) : (
        <>
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
        </>
      )}
    </Card>
  );
};

export default ClientAddSection;
