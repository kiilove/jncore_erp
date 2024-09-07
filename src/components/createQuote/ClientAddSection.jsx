import React, { useRef, useEffect } from "react";
import { Form, Input, Checkbox, Button, Card } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const ClientAddSection = ({
  form,
  clientItem,
  manualInput,
  setManualInput,
  showClientSearchModal,
}) => {
  const businessNameRef = useRef();

  // Effect to update form when clientItem changes
  useEffect(() => {
    if (clientItem?.company && clientItem.person) {
      form.setFieldsValue({
        businessName: clientItem.company.거래처상호 || "", // Fallback to empty if not present
        personName: clientItem.person.성명 || "",
        personTel: clientItem.person.전화번호 || "",
        personEmail: clientItem.person.이메일 || "",
      });
    }
  }, [clientItem, form]);

  return (
    <Card
      title={
        <Button
          placeholder="상호명"
          onClick={showClientSearchModal}
          icon={<SearchOutlined />}
          className="w-full"
        >
          고객사 검색
        </Button>
      }
      bordered={false}
      style={{ marginBottom: 16 }}
    >
      <>
        <Form.Item
          label="상호명"
          name="businessName"
          rules={[{ required: true, message: "상호명을 입력하세요." }]}
        >
          <Input placeholder="상호명을 입력하세요" />
        </Form.Item>
        <Form.Item
          label="담당자"
          name="personName"
          rules={[{ required: true, message: "담당자를 입력하세요." }]}
        >
          <Input placeholder="미상일경우 구매담당자로 입력" />
        </Form.Item>
        <Form.Item
          label="연락처"
          name="personTel"
          rules={[{ required: true, message: "연락처를 입력하세요." }]}
        >
          <Input placeholder="연락처를 입력하세요" />
        </Form.Item>
        <Form.Item
          label="이메일"
          name="personEmail"
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
    </Card>
  );
};

export default ClientAddSection;
