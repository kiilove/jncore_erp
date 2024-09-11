import React, { useEffect, useState } from "react";
import { Card, Input, Checkbox, Select, Button, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { estimateTemplates } from "../../commons/QuoteTemplate";

const { Option } = Select;

const ProductAddSection = ({ showProductSearchModal, handleProductSelect }) => {
  const [productType, setProductType] = useState(""); // 선택된 제품 타입
  const [manualInput, setManualInput] = useState(false); // 수동 입력 여부
  const [formattedValues, setFormattedValues] = useState({}); // 템플릿 및 수동 입력 필드 저장
  const [customKey, setCustomKey] = useState(""); // 사용자 정의 구분 입력
  const [customValue, setCustomValue] = useState(""); // 사용자 정의 내용 입력
  const [customProduct, setCustomProduct] = useState({
    model: { value: "", order: 1 },
    타입: "",
    price: { value: 0, order: 20 },
  }); // 직접입력 제품 정보

  useEffect(() => {
    if (productType && !manualInput) {
      const selectedTemplate = estimateTemplates[productType] || {};
      const initialValues = Object.keys(selectedTemplate).reduce(
        (acc, key, index) => {
          if (key !== "price") {
            acc[key] = { value: "", order: index + 1 };
          }
          return acc;
        },
        {}
      );
      initialValues.price = { value: 0, order: 20 };
      setFormattedValues(initialValues);
    }
  }, [productType, manualInput]);

  // 필드 값 처리
  const handleFieldChange = (key, value, isManual = false) => {
    if (key === "타입") {
      // '타입' key는 특별 처리
      setFormattedValues((prevValues) => ({
        ...prevValues,
        [key]: value, // '타입'은 value만 저장
      }));

      if (isManual) {
        setCustomProduct((prevProduct) => ({
          ...prevProduct,
          [key]: value, // 수동 입력 시도 동일하게 처리
        }));
      }
    } else {
      // '타입'이 아닌 경우 일반적인 처리
      const order =
        key === "model" ? 1 : Object.keys(formattedValues).length + 1;
      setFormattedValues((prevValues) => ({
        ...prevValues,
        [key]: { value, order },
      }));

      if (isManual) {
        setCustomProduct((prevProduct) => ({
          ...prevProduct,
          [key]: { value, order },
        }));
      }
    }
  };

  // 사용자 정의 필드 추가
  const handleAddCustomField = () => {
    if (!customKey || !customValue) {
      alert("필드를 추가하기 위해 구분과 내용을 모두 입력해야 합니다.");
      return;
    }
    handleFieldChange(customKey, customValue, true); // 사용자 정의 필드 추가
    setCustomKey("");
    setCustomValue("");
  };

  // 폼 제출 핸들러 (템플릿 및 수동 입력 모두 처리)
  const handleFormSubmit = (isManual = false) => {
    const selectedProduct = isManual
      ? { ...customProduct, ...formattedValues }
      : { ...formattedValues };

    handleProductSelect(selectedProduct);

    // 폼 초기화
    setFormattedValues({});
    setProductType("");
    if (isManual) {
      setCustomProduct({
        model: { value: "", order: 1 },
        타입: "",
        price: { value: 0, order: 20 },
      });
    }
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
        onChange={(e) => {
          setManualInput(e.target.checked);
          setFormattedValues({});
        }}
      >
        제품 수동 입력
      </Checkbox>

      {/* 수동 입력 처리 */}
      {manualInput ? (
        <>
          <Input
            placeholder="모델명을 입력하세요"
            value={customProduct.model.value}
            onChange={(e) => handleFieldChange("model", e.target.value, true)}
            style={{ marginBottom: 16 }}
          />
          <Input
            placeholder="타입을 입력하세요"
            value={customProduct.타입}
            onChange={(e) => handleFieldChange("타입", e.target.value, true)}
            style={{ marginBottom: 16 }}
          />
          <Space style={{ marginBottom: 16 }}>
            <Input
              placeholder="구분 입력"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
            />
            <Input
              placeholder="내용 입력"
              value={customValue}
              style={{ width: "350px" }}
              onChange={(e) => setCustomValue(e.target.value)}
            />
            <Button type="dashed" onClick={handleAddCustomField}>
              필드 추가
            </Button>
          </Space>
          {Object.keys(formattedValues)
            .filter((key) => key !== "model" && key !== "타입")
            .map((key, index) => (
              <Space
                key={index}
                style={{ marginBottom: 16 }}
                className="w-full"
              >
                <Input value={key} readOnly />
                <Input
                  value={formattedValues[key].value}
                  readOnly
                  style={{ width: "350px" }}
                />
              </Space>
            ))}
          <Button type="dashed" onClick={() => handleFormSubmit(true)} block>
            직접입력 제품 추가
          </Button>
        </>
      ) : (
        <>
          {/* 템플릿 기반 입력 처리 */}
          <Select
            placeholder="제품 종류를 선택하세요"
            onChange={(value) => setProductType(value)}
            value={productType}
            style={{ width: "100%", marginBottom: 16 }}
          >
            <Option value="laptop">노트북</Option>
            <Option value="desktop">데스크탑</Option>
            <Option value="server">서버</Option>
          </Select>
          {Object.keys(formattedValues).map((key) => (
            <Input
              key={key}
              placeholder={`${key}을 입력하세요`}
              value={formattedValues[key]?.value || ""}
              onChange={(e) => handleFieldChange(key, e.target.value)}
              style={{ marginBottom: 16 }}
            />
          ))}
          <Button type="dashed" onClick={() => handleFormSubmit(false)} block>
            템플릿 제품 추가
          </Button>
        </>
      )}
    </Card>
  );
};

export default ProductAddSection;
