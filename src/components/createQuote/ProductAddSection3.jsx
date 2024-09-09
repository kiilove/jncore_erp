import React, { useEffect, useState } from "react";
import { Card, Input, Checkbox, Select, Button, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { estimateTemplates } from "../../commons/QuoteTemplate";

const { Option } = Select;

const ProductAddSection = ({ showProductSearchModal, handleProductSelect }) => {
  const [fields, setFields] = useState([]); // 템플릿 필드들
  const [productType, setProductType] = useState(""); // 선택된 제품 타입
  const [manualInput, setManualInput] = useState(false); // 수동 입력 여부
  const [formattedValues, setFormattedValues] = useState({}); // 템플릿 기반 입력값
  const [customKey, setCustomKey] = useState(""); // 사용자 정의 구분 입력
  const [customValue, setCustomValue] = useState(""); // 사용자 정의 내용 입력
  const [customFields, setCustomFields] = useState([]); // 사용자 정의 필드들
  const [customProduct, setCustomProduct] = useState({
    model: { value: "", order: 1 }, // model의 order를 1로 설정
    타입: "",
    price: { vlaue: 0, order: 20 },
  }); // 직접입력 제품 정보

  // 제품 종류가 변경될 때 템플릿 필드 동적 생성
  useEffect(() => {
    if (productType && !manualInput) {
      const selectedTemplate = estimateTemplates[productType] || {};
      const templateFields = Object.keys(selectedTemplate)
        .filter((f) => f !== "price") // price 필드 제외
        .map((key, index) => ({
          name: key,
          label: selectedTemplate[key].ko,
          order: index,
        }));
      setFields(templateFields); // 필드 업데이트
      setFormattedValues({
        타입: productType, // 타입을 바로 string으로 설정
        price: { value: 0, order: 20 }, // 가격 필드 고정
        amount: 1,
      }); // 초기값 설정 (타입 및 가격)
    }
  }, [productType, manualInput]);

  // 템플릿 필드 값 처리
  const handleTemplateValuesChange = (key, value) => {
    setFormattedValues((prevValues) => ({
      ...prevValues,
      [key]: {
        value: value,
        order: key === "model" ? 1 : Object.keys(prevValues).length, // model은 order=1로 고정
      },
    }));
  };

  // 사용자 정의 필드 추가 핸들러
  const handleAddCustomField = () => {
    if (!customKey || !customValue) {
      alert("필드를 추가하기 위해서는 구분과 내용을 모두 입력해야 합니다.");
      return;
    }

    // formattedValues에 사용자 정의 필드 추가
    setFormattedValues((prevValues) => ({
      ...prevValues,
      [customKey]: {
        value: customValue,
        order: Object.keys(prevValues).length,
      },
    }));

    // 필드 추가 후 입력 값 초기화
    setCustomKey("");
    setCustomValue("");
  };

  // 템플릿 기반 폼 제출 핸들러
  const handleTemplateFormSubmit = () => {
    // 부모에게 넘길 객체 생성
    const selectedProduct = {
      ...formattedValues,
      price: { value: 0, order: 20 }, // 가격은 항상 0으로 설정
    };
    console.log("템플릿 기반 제품:", selectedProduct);
    handleProductSelect(selectedProduct);

    // 폼 초기화
    setFormattedValues({});
    setProductType("");
  };

  // 직접입력 폼 제출 핸들러
  const handleCustomFormSubmit = () => {
    if (!customProduct.model.value || !customProduct.타입) {
      alert("모델명과 제품 종류를 입력해주세요.");
      return;
    }

    // 부모에게 넘길 객체 생성
    const selectedProduct = {
      ...customProduct,
      ...formattedValues, // 사용자 정의 필드를 합쳐서 전달
      price: { value: 0 }, // 직접입력의 경우 가격을 0으로 고정
    };
    console.log("직접입력 제품:", selectedProduct);
    handleProductSelect(selectedProduct);

    // 폼 초기화
    setCustomProduct({
      model: { value: "", order: 1 }, // model 초기화
      타입: "",
    });
    setCustomFields([]); // 사용자 정의 필드 초기화
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

      {/* 수동 입력 */}
      {manualInput ? (
        <>
          {/* 모델명 */}
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="모델명을 입력하세요"
              value={customProduct.model.value}
              onChange={(e) =>
                setCustomProduct({
                  ...customProduct,
                  model: { value: e.target.value, order: 1 }, // model의 order는 1로 고정
                })
              }
            />
          </div>
          {/* 종류 */}
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="종류(타입)를 입력하세요"
              value={customProduct.타입}
              onChange={
                (e) =>
                  setCustomProduct({ ...customProduct, 타입: e.target.value }) // 타입을 바로 value로 설정
              }
            />
          </div>
          {/* 사용자 정의 필드 추가를 위한 Input */}
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

          {/* 추가된 사용자 정의 필드들 */}
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

          <Button type="dashed" onClick={handleCustomFormSubmit} block>
            직접입력 제품 추가
          </Button>
        </>
      ) : (
        <>
          {/* 템플릿 기반 입력 */}
          <div style={{ marginBottom: 16 }}>
            <label>제품 종류</label>
            <Select
              placeholder="제품 종류를 선택하세요"
              onChange={(value) => setProductType(value)}
              value={productType}
              style={{ width: "100%" }}
            >
              <Option value="laptop">노트북</Option>
              <Option value="desktop">데스크탑</Option>
              <Option value="server">서버</Option>
            </Select>
          </div>

          {fields.map((field) => (
            <div key={field.name} style={{ marginBottom: 16 }}>
              <label>{field.label}</label>
              <Input
                placeholder={`${field.label}을 입력하세요`}
                value={formattedValues[field.name]?.value || ""}
                onChange={(e) =>
                  handleTemplateValuesChange(field.name, e.target.value)
                }
              />
            </div>
          ))}

          <Button type="dashed" onClick={handleTemplateFormSubmit} block>
            템플릿 제품 추가
          </Button>
        </>
      )}
    </Card>
  );
};

export default ProductAddSection;
