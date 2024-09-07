import React, { useEffect, useState } from "react";
import { Card, Input, Checkbox, Select, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { estimateTemplates } from "../../commons/QuoteTemplate";

const { Option } = Select;

const ProductAddSection = ({ showProductSearchModal, handleProductSelect }) => {
  const [fields, setFields] = useState([]); // 템플릿 필드들
  const [productType, setProductType] = useState(""); // 선택된 제품 타입
  const [manualInput, setManualInput] = useState(false); // 수동 입력 여부
  const [formattedValues, setFormattedValues] = useState({}); // 입력된 제품 정보 {value, order} 형태로 저장
  const [inputOrder, setInputOrder] = useState(1); // 입력 순서 관리

  // 제품 종류가 변경될 때 템플릿 필드 동적 생성
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
      setFields(templateFields); // 필드 업데이트
      setFormattedValues({
        타입: { value: productType, order: 0 },
        price: { value: 0, order: 20 },
      }); // 초기값 설정 (타입 및 가격)
      setInputOrder(1); // 입력 순서 초기화
    }
  }, [productType]);

  // 값을 { value, order } 형태로 변환하여 별도의 상태에 저장
  const handleValuesChange = (key, value) => {
    setFormattedValues((prevValues) => ({
      ...prevValues,
      [key]: {
        value: value,
        order: inputOrder, // 입력 순서에 따라 order 설정
      },
    }));
    setInputOrder((prevOrder) => prevOrder + 1); // 입력 순서 증가
  };

  // 폼 제출 핸들러
  const handleFormSubmit = () => {
    // 부모에게 넘길 객체 생성
    const selectedProduct = {
      ...formattedValues,
    };

    console.log("선택된 제품:", selectedProduct);
    // 부모의 handleProductSelect 함수 호출
    handleProductSelect(selectedProduct);

    // 폼 초기화
    setFormattedValues({});
    setProductType("");
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
          {/* 제품 종류 선택 */}
          <div style={{ marginBottom: 16 }}>
            <label>제품 종류</label>
            <Select
              placeholder="제품 종류를 선택하세요"
              onChange={(value) => {
                setProductType(value);
                handleValuesChange("타입", value);
              }}
              value={productType}
              style={{ width: "100%" }}
            >
              <Option value="laptop">노트북</Option>
              <Option value="desktop">데스크탑</Option>
              <Option value="server">서버</Option>
            </Select>
          </div>

          {/* 템플릿 기반 필드들 */}
          {fields.map((field) => (
            <div key={field.name} style={{ marginBottom: 16 }}>
              <label>{field.label}</label>
              <Input
                placeholder={`${field.label}을 입력하세요`}
                value={formattedValues[field.name]?.value || ""}
                onChange={(e) => handleValuesChange(field.name, e.target.value)}
              />
            </div>
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
