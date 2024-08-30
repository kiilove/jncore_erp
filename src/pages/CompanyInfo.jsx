import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Row,
  Col,
  Select,
  Radio,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  useFirestoreAddData,
  useFirestoreUpdateData,
  useFirestoreQuery,
} from "../hooks/useFirestore";
import useImageUpload from "../hooks/useFireStorage"; // useImageUpload 훅 임포트

const { Item: FormItem } = Form;
const { Option } = Select;

const CompanyInfo = () => {
  const [form] = Form.useForm();
  const { addData } = useFirestoreAddData();
  const { updateData } = useFirestoreUpdateData();
  const fetchCompanyInfo = useFirestoreQuery();
  const { uploadImage, deleteFileFromStorage } = useImageUpload();

  const [companyInfo, setCompanyInfo] = useState(null);
  const [sealUrl, setSealUrl] = useState(null);
  const [businessPairs, setBusinessPairs] = useState([{ type: "", item: "" }]); // 업태와 종목 관리
  const [selectedMainBusiness, setSelectedMainBusiness] = useState(0); // 대표 종목 선택

  // Firestore에서 기존 회사 정보를 불러오기
  const loadCompanyInfo = async () => {
    await fetchCompanyInfo.getDocuments("company_info", (data) => {
      if (data.length > 0) {
        setCompanyInfo(data[0]);
        setSealUrl(data[0].sealUrl);
        form.setFieldsValue(data[0]);
        setBusinessPairs(data[0].businessPairs || [{ type: "", item: "" }]); // 업태와 종목 불러오기
        setSelectedMainBusiness(data[0].selectedMainBusiness || 0); // 대표 종목 설정
      }
    });
  };

  // 컴포넌트가 로드될 때 회사 정보를 불러옵니다.
  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const handleSave = async (values) => {
    try {
      const dataToSave = {
        ...values,
        sealUrl,
        businessPairs,
        selectedMainBusiness,
      };

      if (companyInfo) {
        await updateData("company_info", companyInfo.id, dataToSave, () => {
          message.success("회사 정보가 성공적으로 업데이트되었습니다.");
        });
      } else {
        await addData("company_info", dataToSave, () => {
          message.success("회사 정보가 성공적으로 저장되었습니다.");
        });
      }
    } catch (error) {
      message.error("회사 정보를 저장하는 중 오류가 발생했습니다.");
    }
  };

  const handleFileChange = async (info) => {
    if (info.file.status === "uploading") {
      return;
    }
    if (info.file.status === "done" || info.file.originFileObj) {
      try {
        if (sealUrl) {
          await deleteFileFromStorage(sealUrl);
        }
        const file = info.file.originFileObj || info.file;
        const result = await uploadImage("company_seals", file, file.name);
        setSealUrl(result.downloadUrl);
        message.success("인감 이미지가 성공적으로 업로드되었습니다.");
      } catch (error) {
        message.error("인감 이미지 업로드 중 오류가 발생했습니다.");
      }
    }
  };

  // 업태와 종목 추가
  const handleAddBusinessPair = () => {
    setBusinessPairs([...businessPairs, { type: "", item: "" }]);
  };

  // 업태와 종목 삭제
  const handleRemoveBusinessPair = (index) => {
    const newPairs = businessPairs.filter((_, idx) => idx !== index);
    setBusinessPairs(newPairs);
    if (index === selectedMainBusiness) {
      setSelectedMainBusiness(0); // 대표 종목이 삭제되면 첫 번째 항목을 대표로 설정
    }
  };

  // 업태와 종목 수정
  const handleBusinessPairChange = (index, field, value) => {
    const newPairs = [...businessPairs];
    newPairs[index][field] = value;
    setBusinessPairs(newPairs);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h2>회사 정보 입력</h2>
      <Form form={form} onFinish={handleSave} layout="vertical">
        <FormItem
          label="회사명"
          name="companyName"
          rules={[{ required: true, message: "회사명을 입력하세요." }]}
        >
          <Input placeholder="회사명을 입력하세요" />
        </FormItem>
        <FormItem
          label="사업자 등록번호"
          name="businessNumber"
          rules={[{ required: true, message: "사업자 등록번호를 입력하세요." }]}
        >
          <Input placeholder="사업자 등록번호를 입력하세요" />
        </FormItem>
        <FormItem
          label="대표자명"
          name="representativeName"
          rules={[{ required: true, message: "대표자명을 입력하세요." }]}
        >
          <Input placeholder="대표자명을 입력하세요" />
        </FormItem>
        <FormItem
          label="주소"
          name="address"
          rules={[{ required: true, message: "주소를 입력하세요." }]}
        >
          <Input placeholder="주소를 입력하세요" />
        </FormItem>
        <FormItem
          label="전화번호"
          name="phoneNumber"
          rules={[{ required: true, message: "전화번호를 입력하세요." }]}
        >
          <Input placeholder="전화번호를 입력하세요" />
        </FormItem>
        <FormItem
          label="이메일"
          name="email"
          rules={[
            { required: true, message: "이메일을 입력하세요." },
            { type: "email", message: "유효한 이메일을 입력하세요." },
          ]}
        >
          <Input placeholder="이메일을 입력하세요" />
        </FormItem>

        <FormItem label="업태 및 종목">
          {businessPairs.map((pair, index) => (
            <Row gutter={8} key={index} style={{ marginBottom: "10px" }}>
              <Col span={10}>
                <Input
                  placeholder="업태"
                  value={pair.type}
                  onChange={(e) =>
                    handleBusinessPairChange(index, "type", e.target.value)
                  }
                />
              </Col>
              <Col span={10}>
                <Input
                  placeholder="종목"
                  value={pair.item}
                  onChange={(e) =>
                    handleBusinessPairChange(index, "item", e.target.value)
                  }
                />
              </Col>
              <Col span={4}>
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveBusinessPair(index)}
                />
              </Col>
            </Row>
          ))}
          <Button
            type="dashed"
            onClick={handleAddBusinessPair}
            icon={<PlusOutlined />}
          >
            업태 및 종목 추가
          </Button>
        </FormItem>
        <FormItem label="대표 종목">
          <Radio.Group
            value={selectedMainBusiness}
            onChange={(e) => setSelectedMainBusiness(e.target.value)}
          >
            {businessPairs.map((pair, index) => (
              <Radio key={index} value={index}>
                {pair.type} - {pair.item}
              </Radio>
            ))}
          </Radio.Group>
        </FormItem>
        <FormItem label="회사 인감" name="sealUrl">
          <Upload
            beforeUpload={() => false}
            onChange={handleFileChange}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>인감 이미지 업로드</Button>
          </Upload>
          {sealUrl && (
            <div style={{ marginTop: 10 }}>
              <img
                src={sealUrl}
                alt="Company Seal"
                style={{ maxWidth: "100px", maxHeight: "100px" }}
              />
            </div>
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" style={{ marginTop: 20 }}>
            저장하기
          </Button>
        </FormItem>
      </Form>
    </div>
  );
};

export default CompanyInfo;
