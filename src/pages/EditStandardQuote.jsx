import React, { useState, useEffect } from "react";
import { Row, Col, Input, Button, Select, message } from "antd";
import FormFields from "../components/standardQuote/FormField"; // 공통 컴포넌트

const { Option } = Select;

const EditStandardQuote = () => {
  // 하드코딩된 테스트 데이터
  const initialData = {
    brand: { value: "LG전자", order: 13 },
    model: { value: "LG전자 2024 그램17 17Z90S-G.AP76ML", order: 1 },
    cpu: { value: "Ultra7 155H", order: 2 },
    ram: { value: "16GB On-Board (LPDDR5x) 확장불가", order: 3 },
    storage: { value: "NVMe Gen4. 256GB+추가 SLOT 1EA", order: 4 },
    gpu: { value: "Intel Arc Graphics", order: 5 },
    display: { value: '17.0" WQXGA IPS, 16:10, Anti Glare', order: 6 },
    resolution: { value: "2560x1600(WQXGA)", order: 7 },
    battery: { value: "77Wh", order: 8 },
    weight: { value: "1.35kg", order: 9 },
    os: { value: "윈도우11 프로", order: 10 },
    warranty: { value: 1, order: 11 },
    price: { value: 1900000, order: 12 },
    refProductId: "1Tc4sugOKqpOjvNpxSZi",
  };

  const [formData, setFormData] = useState({});
  const [templateFields, setTemplateFields] = useState([]);

  useEffect(() => {
    // 초기 데이터 설정
    setFormData(initialData);

    // 템플릿 필드 초기화
    const fields = Object.keys(initialData)
      .filter((key) => key !== "refProductId")
      .sort((a, b) => initialData[a].order - initialData[b].order)
      .map((key) => ({
        key,
        label: key,
        value: initialData[key].value,
      }));
    setTemplateFields(fields);
  }, []);

  const handleInputChange = (key, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: { ...prevData[key], value },
    }));
  };

  const handleSave = () => {
    console.log("Form Data to Save:", formData);
    // 저장 기능은 여기에 추가됩니다.
    message.success("데이터가 성공적으로 저장되었습니다.");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>제품 수정</h2>
      <Row gutter={[16, 16]}>
        {templateFields.map((field, index) => (
          <React.Fragment key={field.key}>
            <Col span={6}>
              <Input
                value={field.label}
                readOnly
                style={{
                  marginBottom: "5px",
                  fontSize: "14px",
                }}
              />
            </Col>
            <Col span={18}>
              <Input
                placeholder={`Enter ${field.label}`}
                value={formData[field.key]?.value || ""}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                style={{
                  marginBottom: "5px",
                  fontSize: "14px",
                }}
              />
            </Col>
          </React.Fragment>
        ))}
      </Row>
      <Button type="primary" onClick={handleSave} style={{ marginTop: "20px" }}>
        저장하기
      </Button>
    </div>
  );
};

export default EditStandardQuote;
