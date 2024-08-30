import React, { useState, useEffect } from "react";
import { Form, Input, Button, Upload, message, Row, Col } from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useFirestoreUpdateData } from "../hooks/useFirestore";
import useFileUpload from "../hooks/useFileUpload";
import { useLocation } from "react-router-dom";

const { Item: FormItem } = Form;

const ClientInfo = () => {
  const [form] = Form.useForm();
  const { updateData } = useFirestoreUpdateData();
  const { uploadFile, deleteFileFromStorage } = useFileUpload();
  const location = useLocation();

  const clientInfo = location.state?.clientInfo;
  const [businessCertificateUrl, setBusinessCertificateUrl] = useState(
    clientInfo?.businessCertificateUrl || null
  );
  const [bankCopyUrl, setBankCopyUrl] = useState(
    clientInfo?.bankCopyUrl || null
  );
  const [uploadingBusinessCertificate, setUploadingBusinessCertificate] =
    useState(false);
  const [uploadingBankCopy, setUploadingBankCopy] = useState(false);

  const [contacts, setContacts] = useState(clientInfo?.담당자 || []);

  useEffect(() => {
    if (clientInfo) {
      form.setFieldsValue({
        companyName: clientInfo["거래처상호"],
        businessNumber: clientInfo["거래처등록번호"],
        representativeName: clientInfo["대표자명"],
        address: clientInfo["사업자주소"],
        phoneNumber: clientInfo["전화번호"],
        email: clientInfo["이메일주소"],
        businessPairs: clientInfo["업태"],
        businessType: clientInfo["종목"],
      });
    }
  }, [clientInfo, form]);

  const handleSave = async (values) => {
    if (uploadingBusinessCertificate || uploadingBankCopy) {
      message.warning("파일 업로드가 완료될 때까지 기다려주세요.");
      return;
    }

    try {
      const dataToSave = {
        ...clientInfo,
        ...values,
        businessCertificateUrl,
        bankCopyUrl,
        담당자: contacts,
      };

      await updateData("clients", clientInfo.id, dataToSave, () => {
        message.success("고객사 정보가 성공적으로 업데이트되었습니다.");
      });
    } catch (error) {
      message.error("고객사 정보를 저장하는 중 오류가 발생했습니다.");
    }
  };

  const handleFileChange = async (file, type) => {
    if (!file) return;

    try {
      if (type === "businessCertificate" && businessCertificateUrl) {
        await deleteFileFromStorage(businessCertificateUrl);
      }
      if (type === "bankCopy" && bankCopyUrl) {
        await deleteFileFromStorage(bankCopyUrl);
      }

      const result = await uploadFile(
        type === "businessCertificate"
          ? "business_certificates"
          : "bank_copies",
        file,
        file.name
      );

      if (type === "businessCertificate") {
        setBusinessCertificateUrl(result.downloadUrl);
        message.success("사업자등록증이 성공적으로 업로드되었습니다.");
      } else if (type === "bankCopy") {
        setBankCopyUrl(result.downloadUrl);
        message.success("통장사본이 성공적으로 업로드되었습니다.");
      }
    } catch (error) {
      message.error("파일 업로드 중 오류가 발생했습니다.");
    } finally {
      if (type === "businessCertificate") {
        setUploadingBusinessCertificate(false);
      } else if (type === "bankCopy") {
        setUploadingBankCopy(false);
      }
    }
  };

  const beforeUploadHandler = (file, type) => {
    if (type === "businessCertificate") {
      setUploadingBusinessCertificate(true);
    } else if (type === "bankCopy") {
      setUploadingBankCopy(true);
    }

    handleFileChange(file, type);
    return false; // 자동 업로드 방지
  };

  // 담당자 정보 수정
  const handleContactChange = (index, field, value) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setContacts(newContacts);
  };

  // 담당자 추가
  const handleAddContact = () => {
    setContacts([
      ...contacts,
      { 성명: "", 전화번호: "", 휴대전화번호: "", 이메일: "" },
    ]);
  };

  // 담당자 삭제
  const handleRemoveContact = (index) => {
    const newContacts = contacts.filter((_, idx) => idx !== index);
    setContacts(newContacts);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={16}>
        {/* 왼쪽: 회사 정보 */}
        <Col span={12}>
          <h2>고객사 정보 수정</h2>
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
              rules={[
                { required: true, message: "사업자 등록번호를 입력하세요." },
              ]}
            >
              <Input placeholder="사업자 등록번호를 입력하세요" />
            </FormItem>
            <FormItem label="대표자명" name="representativeName">
              <Input placeholder="대표자명을 입력하세요" />
            </FormItem>
            <FormItem label="주소" name="address">
              <Input placeholder="주소를 입력하세요" />
            </FormItem>
            <FormItem label="전화번호" name="phoneNumber">
              <Input placeholder="전화번호를 입력하세요" />
            </FormItem>
            <FormItem
              label="이메일"
              name="email"
              rules={[
                { type: "email", message: "유효한 이메일을 입력하세요." },
              ]}
            >
              <Input placeholder="이메일을 입력하세요" />
            </FormItem>

            <FormItem label="업태" name="businessPairs">
              <Input placeholder="업태를 입력하세요" />
            </FormItem>

            <FormItem label="종목" name="businessType">
              <Input placeholder="종목을 입력하세요" />
            </FormItem>

            <FormItem label="사업자등록증 업로드" name="businessCertificateUrl">
              <Upload
                beforeUpload={(file) =>
                  beforeUploadHandler(file, "businessCertificate")
                }
                accept="image/*,application/pdf"
              >
                <Button
                  icon={<UploadOutlined />}
                  loading={uploadingBusinessCertificate}
                >
                  사업자등록증 업로드
                </Button>
              </Upload>
              <p style={{ marginTop: 8, fontSize: "12px", color: "#888" }}>
                이미지 파일 (JPG, PNG) 또는 PDF 파일만 업로드 가능합니다.
              </p>
              {businessCertificateUrl && (
                <div style={{ marginTop: 10 }}>
                  {businessCertificateUrl.endsWith(".pdf") ? (
                    <a
                      href={businessCertificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      사업자등록증 (PDF 보기)
                    </a>
                  ) : (
                    <img
                      src={businessCertificateUrl}
                      alt="Business Certificate"
                      style={{ maxWidth: "100px", maxHeight: "100px" }}
                    />
                  )}
                </div>
              )}
            </FormItem>

            <FormItem label="통장사본 업로드" name="bankCopyUrl">
              <Upload
                beforeUpload={(file) => beforeUploadHandler(file, "bankCopy")}
                accept="image/*,application/pdf"
              >
                <Button icon={<UploadOutlined />} loading={uploadingBankCopy}>
                  통장사본 업로드
                </Button>
              </Upload>
              <p style={{ marginTop: 8, fontSize: "12px", color: "#888" }}>
                이미지 파일 (JPG, PNG) 또는 PDF 파일만 업로드 가능합니다.
              </p>
              {bankCopyUrl && (
                <div style={{ marginTop: 10 }}>
                  {bankCopyUrl.endsWith(".pdf") ? (
                    <a
                      href={bankCopyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      통장사본 (PDF 보기)
                    </a>
                  ) : (
                    <img
                      src={bankCopyUrl}
                      alt="Bank Copy"
                      style={{ maxWidth: "100px", maxHeight: "100px" }}
                    />
                  )}
                </div>
              )}
            </FormItem>

            <FormItem>
              <Button
                type="primary"
                htmlType="submit"
                style={{ marginTop: 20 }}
                loading={uploadingBusinessCertificate || uploadingBankCopy}
              >
                저장하기
              </Button>
            </FormItem>
          </Form>
        </Col>

        {/* 오른쪽: 담당자 목록 관리 */}
        <Col span={12}>
          <h2>담당자 목록 관리</h2>
          <FormItem label="담당자 목록">
            {contacts.map((contact, index) => (
              <Row gutter={8} key={index} style={{ marginBottom: "10px" }}>
                <Col span={6}>
                  <Input
                    placeholder="성명"
                    value={contact.성명}
                    onChange={(e) =>
                      handleContactChange(index, "성명", e.target.value)
                    }
                  />
                </Col>
                <Col span={6}>
                  <Input
                    placeholder="전화번호"
                    value={contact.전화번호}
                    onChange={(e) =>
                      handleContactChange(index, "전화번호", e.target.value)
                    }
                  />
                </Col>
                <Col span={6}>
                  <Input
                    placeholder="휴대전화번호"
                    value={contact.휴대전화번호}
                    onChange={(e) =>
                      handleContactChange(index, "휴대전화번호", e.target.value)
                    }
                  />
                </Col>
                <Col span={6}>
                  <Input
                    placeholder="이메일"
                    value={contact.이메일}
                    onChange={(e) =>
                      handleContactChange(index, "이메일", e.target.value)
                    }
                  />
                </Col>
                <Col span={4}>
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveContact(index)}
                  />
                </Col>
              </Row>
            ))}
            <Button
              type="dashed"
              onClick={handleAddContact}
              icon={<PlusOutlined />}
              style={{ width: "100%" }}
            >
              담당자 추가
            </Button>
          </FormItem>
        </Col>
      </Row>
    </div>
  );
};

export default ClientInfo;
