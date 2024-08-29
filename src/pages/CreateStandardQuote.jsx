import React, { useState, useEffect } from "react";
import { Row, Col, Button, List, Select, message } from "antd";

import { useLocation } from "react-router-dom";
import { estimateTemplates } from "../commons/QuoteTemplate";
import { fieldMapping, fieldOrder } from "../commons/fieldConfig";
import { removeQuotes, adjustModelName } from "../utils/utils";
import FormField from "../components/standardQuote/FormField";
import { CopyButton, AddFieldButton } from "../components/ActionButton";
import {
  useFirestoreAddData,
  useFirestoreGetDocument,
  useFirestoreDeleteData,
} from "../hooks/useFirestore";

const { Option } = Select;

const CreateStandardQuote = () => {
  const location = useLocation();
  const [selectedTemplate, setSelectedTemplate] = useState("laptop");
  const [language, setLanguage] = useState("ko");
  const [formData, setFormData] = useState({});
  const [extraFields, setExtraFields] = useState({});
  const [templateFields, setTemplateFields] = useState([]);
  const [quoteId, setQuoteId] = useState(null);
  const [isEdit, setIsEdit] = useState(location.state?.isEdit);

  const { addData } = useFirestoreAddData();
  const { deleteData } = useFirestoreDeleteData();
  const { getDocument } = useFirestoreGetDocument();

  const mapDataToFields = (data) => {
    const mappedData = {};
    const additionalFields = { ...data };

    Object.keys(data).forEach((key) => {
      if (key !== "refProductId" && key !== "imgUrl") {
        mappedData[key] = {
          value: removeQuotes(data[key].value),
          order: data[key].order, // 기본 order를 100으로 설정
        };
        delete additionalFields[key];
      }
    });

    return { mappedData, additionalFields };
  };

  const initializeData = async (editMode, editId) => {
    if (editMode && editId) {
      try {
        await getDocument("standard_quote", editId, (data) => {
          const deletedIdData = { ...data };
          delete deletedIdData.id;
          const { mappedData, additionalFields } =
            mapDataToFields(deletedIdData);

          console.log(mappedData);
          let templateFieldsData = Object.keys(mappedData)
            .sort((a, b) => mappedData[a].order - mappedData[b].order)
            .map((key) => ({
              key,
              label:
                estimateTemplates[selectedTemplate][key]?.[language] || key,
              value: mappedData[key].value,
              order: mappedData[key].order,
            }));

          setFormData(mappedData);
          setExtraFields({
            ...location.state.description[0],
            ...additionalFields,
          });

          // 여기서 templateFields를 정렬합니다.
          templateFieldsData = templateFieldsData.sort(
            (a, b) => a.order - b.order
          );

          setTemplateFields(templateFieldsData);
        });
      } catch (error) {
        message.error("표준 견적 데이터를 불러오는 중 오류가 발생했습니다.");
        console.error("Error loading standard quote: ", error);
      }
    } else if (location.state?.description[0]) {
      const initialData = location.state.description[0];

      const adjustedNames = adjustModelName(
        initialData["검색모델명"],
        initialData["모델명"]
      );

      const mappedData = {
        brand: {
          value: adjustedNames.brand,
          order: 0, // 초기 order 설정
        },
        model: {
          value: adjustedNames.model,
          order: 1, // 초기 order 설정
        },
      };

      // fieldMapping을 통해 매핑된 필드 추가
      Object.keys(fieldMapping).forEach((key) => {
        if (key !== "모델명" && initialData[key]) {
          mappedData[key] = {
            value: removeQuotes(initialData[key]),
            order: fieldOrder.indexOf(key) + 2, // order 값 재설정
          };
        }
      });

      // order 값을 기반으로 정렬
      const sortedFields = Object.keys(mappedData).sort(
        (a, b) => mappedData[a].order - mappedData[b].order
      );

      // 추가 필드를 정리
      const additionalFields = Object.keys(initialData).reduce(
        (result, key) => {
          if (!Object.values(fieldMapping).includes(key)) {
            result[key] = initialData[key];
          }
          return result;
        },
        {}
      );

      // templateFields 설정
      const templateFieldsData = sortedFields.map((key, index) => ({
        key,
        label: estimateTemplates[selectedTemplate][key]?.[language] || key,
        value: mappedData[key]?.value || "",
        order: index,
      }));

      setFormData(mappedData);
      setExtraFields(additionalFields);
      setTemplateFields(templateFieldsData);
    }
  };

  useEffect(() => {
    initializeData(isEdit, location.state?.quoteId);
    setQuoteId(location.state?.quoteId);
  }, [isEdit, location.state?.quoteId]);

  const handleInputChange = (key, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [key]: { ...prevFormData[key], value },
    }));
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        message.success("클립보드에 복사되었습니다.");
      })
      .catch(() => {
        message.error("복사 중 오류가 발생했습니다.");
      });
  };

  const handleAddField = (key, value) => {
    const nextOrder = templateFields.length;
    const newField = {
      key,
      label: key,
      value: removeQuotes(value),
      order: nextOrder,
    };

    setTemplateFields((prevFields) => [...prevFields, newField]);
    setFormData((prevFormData) => ({
      ...prevFormData,
      [key]: { value: newField.value, order: nextOrder },
    }));
  };

  const handleDeleteField = (key) => {
    // 템플릿 필드에서 해당 필드를 제거
    setTemplateFields((prevFields) =>
      prevFields.filter((field) => field.key !== key)
    );

    const updatedFormData = { ...formData };
    delete updatedFormData[key];

    // formData에서 해당 필드를 제거
    setFormData(
      () => updatedFormData // 업데이트된 formData 반환
    );
  };

  const moveField = (index, direction) => {
    const updatedFields = [...templateFields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < updatedFields.length) {
      // 필드의 순서를 교환
      [updatedFields[targetIndex], updatedFields[index]] = [
        updatedFields[index],
        updatedFields[targetIndex],
      ];

      // 모든 필드의 order 속성을 인덱스 기반으로 다시 설정
      const reorderedFields = updatedFields.map((field, idx) => ({
        ...field,
        order: idx,
      }));

      // 상태 업데이트
      setTemplateFields(reorderedFields);
    }
  };

  const handleSave = async (id, dataToSubmit, refProductId, imgUrl) => {
    if (!dataToSubmit || !refProductId || !imgUrl) {
      message.error("필수 정보가 누락되었습니다. 모든 필드를 확인하세요.");
      return;
    }

    try {
      if (isEdit && id) {
        // 기존 문서 삭제
        await deleteData("standard_quote", id);
        await addData(
          "standard_quote",
          { ...dataToSubmit, refProductId, imgUrl },
          (data) => {
            setQuoteId(data.id);
            message.success("데이터가 성공적으로 업데이트되었습니다.");
          }
        );
      } else {
        // 신규 데이터 추가
        await addData(
          "standard_quote",
          { ...dataToSubmit, refProductId, imgUrl },
          () => {
            message.success("데이터가 성공적으로 저장되었습니다.");
          }
        );
      }
    } catch (error) {
      message.error("데이터 저장 중 오류가 발생했습니다.");
      console.error("Error saving document: ", error);
    }
  };

  const handleSubmit = () => {
    const dataToSubmit = templateFields.reduce((result, field) => {
      result[field.key] = {
        value: formData[field.key]?.value || "",
        order: field.order, // 기존 order 값을 그대로 유지
      };
      return result;
    }, {});

    handleSave(
      quoteId,
      dataToSubmit,
      location?.state?.description[0]?.id,
      location?.state?.description[0]?.검색모델img || ""
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <Row justify="end" style={{ marginBottom: "20px" }}>
        <Col>
          <Select
            value={selectedTemplate}
            onChange={setSelectedTemplate}
            style={{ width: 120, marginRight: 10 }}
          >
            <Option value="laptop">Laptop</Option>
            <Option value="desktop">Desktop</Option>
            <Option value="server">Server</Option>
          </Select>
          <Select
            value={language}
            onChange={setLanguage}
            style={{ width: 120 }}
          >
            <Option value="ko">한글</Option>
            <Option value="en">영문</Option>
          </Select>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <h3>템플릿 필드</h3>
          <Row gutter={[8, 8]}>
            {templateFields.map((field, index) => (
              <FormField
                key={field.key}
                field={field}
                index={index}
                handleInputChange={handleInputChange}
                moveField={moveField}
                handleDeleteField={handleDeleteField}
              />
            ))}
          </Row>

          <Button
            type="primary"
            onClick={handleSubmit}
            style={{ marginTop: "20px" }}
          >
            {isEdit ? "견적서 수정" : "견적서 제출"}
          </Button>
        </Col>

        <Col span={12}>
          <h3>디스크립션 내용</h3>
          <List
            bordered
            dataSource={Object.keys(extraFields)}
            renderItem={(key) => (
              <List.Item style={{ cursor: "pointer" }}>
                <Row style={{ width: "100%" }}>
                  <Col span={18}>
                    <strong>{key}:</strong> {extraFields[key]}
                  </Col>

                  <Col span={6}>
                    <CopyButton
                      text={extraFields[key]}
                      onCopy={handleCopyToClipboard}
                    />
                    <AddFieldButton
                      onAdd={handleAddField}
                      fieldKey={key}
                      fieldValue={extraFields[key]}
                    />
                  </Col>
                </Row>
              </List.Item>
            )}
          />
        </Col>
      </Row>
    </div>
  );
};

export default CreateStandardQuote;
