import React, { useEffect, useState } from "react";
import { Card, Form, Input, Checkbox, Select, InputNumber, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { estimateTemplates } from "../../commons/QuoteTemplate";

const { Option } = Select;

const ProductAddSection = ({
  form,

  showProductSearchModal,
  handleProductSelect, // 부모로부터 받은 함수
}) => {
  const [fields, setFields] = useState([]);
  const [productType, setProductType] = useState("");
  const [formattedValues, setFormattedValues] = useState({}); // 변환된 값 저장
  const [manualInput, setManualInput] = useState(false);

  // 제품 종류가 변경될 때 해당 템플릿 필드를 동적으로 추가
  useEffect(() => {
    if (productType) {
      const selectedTemplate = estimateTemplates[productType] || {};
      const templateFields = Object.keys(selectedTemplate).map(
        (key, index) => ({
          name: key,
          label: selectedTemplate[key].ko,
          order: index,
        })
      );
      setFields(templateFields);
    }
  }, [productType]);

  // 값을 { value, order } 형태로 변환하여 별도의 상태에 저장
  const handleValuesChange = (changedValues, allValues) => {
    const updatedFormattedValues = { ...formattedValues };

    Object.keys(changedValues).forEach((key, index) => {
      updatedFormattedValues[key] = {
        value: changedValues[key],
        order: Object.keys(allValues).indexOf(key),
      };
    });

    setFormattedValues(updatedFormattedValues); // 변환된 값 상태로 저장
  };

  // 폼 제출 핸들러
  const handleFormSubmit = () => {
    // 폼 값 가져오기
    const formValues = form.getFieldsValue();

    // 부모에게 넘길 값 생성
    const selectedProduct = {
      ...formattedValues,
      타입: productType,
      price: { value: 0, index: 20 }, // 변환된 값도 포함
    };

    console.log(selectedProduct);
    // 부모의 handleProductSelect 함수 호출
    handleProductSelect(selectedProduct);

    // 폼 제출 (필요한 경우)
    // form.submit();
  };

  return (
    <Card
      title={
        <Button
          placeholder="제품을 검색하세요"
          onClick={showProductSearchModal}
          icon={<SearchOutlined />}
          className="w-full"
        >
          제품 검색
        </Button>
      }
      bordered={false}
      style={{ marginBottom: 16 }}
    >
      <Checkbox
        checked={manualInput}
        onChange={(e) => setManualInput(e.target.checked)}
      >
        제품 수동 입력
      </Checkbox>

      {manualInput && (
        <>
          <Form.Item
            label="제품 종류"
            name="타입"
            rules={[{ required: true, message: "제품 종류를 선택하세요." }]}
          >
            <Select
              placeholder="제품 종류를 선택하세요"
              onChange={(value) => setProductType(value)}
            >
              <Option value="laptop">노트북</Option>
              <Option value="desktop">데스크탑</Option>
              <Option value="server">서버</Option>
              <Option value="manual">직접입력</Option>
            </Select>
          </Form.Item>

          {/* 템플릿 기반 필드들 */}
          {fields
            .filter((field) => field.name !== "price") // "price" 필드를 필터링
            .map((field) => (
              <Form.Item key={field.name} label={field.label} name={field.name}>
                <Input placeholder={`${field.label}을 입력하세요`} />
              </Form.Item>
            ))}
          <Button type="dashed" onClick={handleFormSubmit} block>
            제품 추가
          </Button>
        </>
      )}
    </Card>
  );
};

export default ProductAddSection;
