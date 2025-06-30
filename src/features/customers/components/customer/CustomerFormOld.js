import { useState, useEffect } from "react";
import { Button } from "../../../../components/common/Button";
import { Input } from "../../../../components/common/Input";
import { Select } from "../../../../components/common/Select";
import { Form, FormSection } from "../../../../components/common/Form";
import { FiPlus, FiTrash2, FiPhone, FiMail, FiSearch } from "react-icons/fi";

const CustomerForm = ({ customer, onClose, onSubmit }) => {
  const getInitialFormData = () => ({
    type: customer?.type || "기업",
    businessInfo: {
      businessNumber: customer?.businessInfo?.businessNumber || "",
      businessName: customer?.businessInfo?.businessName || "",
      representativeName: customer?.businessInfo?.representativeName || "",
      openingDate: customer?.businessInfo?.openingDate || "",
      baseAddress: customer?.businessInfo?.baseAddress || "",
      detailAddress: customer?.businessInfo?.detailAddress || "",
      businessType: customer?.businessInfo?.businessType || "",
      businessCategory: customer?.businessInfo?.businessCategory || "",
      corporateNumber: customer?.businessInfo?.corporateNumber || "",
    },
    contacts: customer?.contacts || [
      { name: "", phone: "", email: "", position: "" },
    ],
    notes: customer?.notes || "",
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState({});

  // 중첩된 객체의 속성값을 가져오는 헬퍼 함수
  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((o, key) => {
      if (o && typeof o === "object") {
        if (key.includes("[")) {
          const [arrayKey, index] = key.replace("]", "").split("[");
          return o[arrayKey]?.[parseInt(index)];
        }
        return o[key];
      }
      return undefined;
    }, obj);
  };

  useEffect(() => {
    setFormData(getInitialFormData());
  }, [customer]);

  useEffect(() => {
    // 카카오 주소검색 API 스크립트 로드
    const script = document.createElement("script");
    script.src =
      "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        let baseAddress = data.address;
        let extraAddress = "";

        if (data.addressType === "R") {
          if (data.bname !== "") {
            extraAddress += data.bname;
          }
          if (data.buildingName !== "") {
            extraAddress +=
              extraAddress !== ""
                ? ", " + data.buildingName
                : data.buildingName;
          }
          baseAddress += extraAddress !== "" ? " (" + extraAddress + ")" : "";
        }

        handleBusinessInfoChange("baseAddress", baseAddress);
        // 상세주소 입력 필드로 포커스 이동
        document.getElementById("detailAddress")?.focus();
      },
    }).open();
  };

  const validateForm = () => {
    const errors = {};

    // 거래처명 검증
    if (!formData.businessInfo.businessName?.trim()) {
      errors["businessInfo.businessName"] = "거래처명을 입력해주세요.";
    }

    // 사업자등록번호 검증
    if (!formData.businessInfo.businessNumber?.trim()) {
      errors["businessInfo.businessNumber"] = "사업자등록번호를 입력해주세요.";
    }

    // 대표자명 검증
    if (!formData.businessInfo.representativeName?.trim()) {
      errors["businessInfo.representativeName"] = "대표자명을 입력해주세요.";
    }

    // 사업장 소재지 검증
    if (!formData.businessInfo.baseAddress?.trim()) {
      errors["businessInfo.baseAddress"] = "사업장 소재지를 입력해주세요.";
    }

    // 업태 검증
    if (!formData.businessInfo.businessType?.trim()) {
      errors["businessInfo.businessType"] = "업태를 입력해주세요.";
    }

    // 종목 검증
    if (!formData.businessInfo.businessCategory?.trim()) {
      errors["businessInfo.businessCategory"] = "종목을 입력해주세요.";
    }

    // 담당자 정보 검증
    if (formData.contacts.length > 0) {
      if (!formData.contacts[0].name?.trim()) {
        errors["contacts.0.name"] = "담당자명을 입력해주세요.";
      }
      if (!formData.contacts[0].email?.trim()) {
        errors["contacts.0.email"] = "이메일을 입력해주세요.";
      }
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorField = document.querySelector("[data-error]");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
        firstErrorField.focus();
      }
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleContactChange = (index, field, value) => {
    setFormData((prev) => {
      const newContacts = [...prev.contacts];
      newContacts[index] = {
        ...newContacts[index],
        [field]: value,
      };
      return {
        ...prev,
        contacts: newContacts,
      };
    });
  };

  const handleAddContact = () => {
    setFormData((prev) => ({
      ...prev,
      contacts: [
        ...prev.contacts,
        {
          name: "",
          phone: "",
          email: "",
        },
      ],
    }));
  };

  const handleRemoveContact = (index) => {
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  };

  const handleBusinessInfoChange = (field, value) => {
    setFormData({
      ...formData,
      businessInfo: {
        ...formData.businessInfo,
        [field]: value,
      },
    });
  };

  const requiredFields = [
    "type",
    "businessNumber",
    "businessName",
    "representativeName",
    "baseAddress",
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {customer ? "거래처 정보 수정" : "새 거래처 등록"}
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="flex items-center"
        >
          뒤로가기
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="기본 정보">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select
                label={
                  <span>
                    거래처 유형
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                }
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                options={[
                  { value: "기업", label: "기업" },
                  { value: "개인", label: "개인" },
                ]}
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="사업자 정보">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label={
                  <span>
                    {formData.type === "기업" ? "상호(법인명)" : "이름"}
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                }
                name="businessName"
                value={formData.businessInfo.businessName}
                onChange={(e) =>
                  handleBusinessInfoChange("businessName", e.target.value)
                }
                error={errors["businessInfo.businessName"]}
                data-error={
                  errors["businessInfo.businessName"] ? true : undefined
                }
                required
              />
            </div>

            <div>
              <Input
                label={
                  <span>
                    사업자등록번호
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                }
                name="businessNumber"
                value={formData.businessInfo.businessNumber}
                onChange={(e) =>
                  handleBusinessInfoChange("businessNumber", e.target.value)
                }
                placeholder="000-00-00000"
                error={errors["businessInfo.businessNumber"]}
                data-error={
                  errors["businessInfo.businessNumber"] ? true : undefined
                }
                required
              />
            </div>

            <div>
              <Input
                label={
                  <span>
                    대표자명
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                }
                name="representativeName"
                value={formData.businessInfo.representativeName}
                onChange={(e) =>
                  handleBusinessInfoChange("representativeName", e.target.value)
                }
                error={errors["businessInfo.representativeName"]}
                data-error={
                  errors["businessInfo.representativeName"] ? true : undefined
                }
                required
              />
            </div>

            <div>
              <Input
                label="개업일자"
                name="openingDate"
                value={formData.businessInfo.openingDate}
                onChange={(e) =>
                  handleBusinessInfoChange("openingDate", e.target.value)
                }
                placeholder="YYYY-MM-DD"
              />
            </div>

            <div className="md:col-span-2">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      label={
                        <span>
                          기본주소
                          <span className="text-red-500 ml-1">*</span>
                        </span>
                      }
                      name="baseAddress"
                      value={formData.businessInfo.baseAddress}
                      onChange={(e) =>
                        handleBusinessInfoChange("baseAddress", e.target.value)
                      }
                      error={errors["businessInfo.baseAddress"]}
                      data-error={
                        errors["businessInfo.baseAddress"] ? true : undefined
                      }
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddressSearch}
                      className="h-10"
                    >
                      <FiSearch className="mr-2 h-4 w-4" />
                      주소검색
                    </Button>
                  </div>
                </div>

                <div>
                  <Input
                    label="상세주소"
                    id="detailAddress"
                    name="detailAddress"
                    value={formData.businessInfo.detailAddress}
                    onChange={(e) =>
                      handleBusinessInfoChange("detailAddress", e.target.value)
                    }
                    error={errors["businessInfo.detailAddress"]}
                    data-error={
                      errors["businessInfo.detailAddress"] ? true : undefined
                    }
                    placeholder="상세주소를 입력하세요"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label={
                    <span>
                      업태
                      <span className="text-red-500 ml-1">*</span>
                    </span>
                  }
                  value={formData.businessInfo.businessType}
                  onChange={(e) =>
                    handleBusinessInfoChange("businessType", e.target.value)
                  }
                  placeholder="예: 도매업, 소매업, 제조업"
                  error={errors["businessInfo.businessType"]}
                  data-error={
                    errors["businessInfo.businessType"] ? true : undefined
                  }
                  required
                />
              </div>

              <div>
                <Input
                  label={
                    <span>
                      종목
                      <span className="text-red-500 ml-1">*</span>
                    </span>
                  }
                  value={formData.businessInfo.businessCategory}
                  onChange={(e) =>
                    handleBusinessInfoChange("businessCategory", e.target.value)
                  }
                  placeholder="예: 전자제품, 의류, 식품"
                  error={errors["businessInfo.businessCategory"]}
                  data-error={
                    errors["businessInfo.businessCategory"] ? true : undefined
                  }
                  required
                />
              </div>
            </div>

            {formData.type === "기업" && (
              <div>
                <Input
                  label="법인등록번호"
                  value={formData.businessInfo.corporateNumber}
                  onChange={(e) =>
                    handleBusinessInfoChange("corporateNumber", e.target.value)
                  }
                  placeholder="000000-0000000"
                  error={errors["businessInfo.corporateNumber"]}
                  data-error={
                    errors["businessInfo.corporateNumber"] ? true : undefined
                  }
                />
              </div>
            )}
          </div>
        </FormSection>

        <FormSection title="담당자 정보">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">담당자 정보</h3>
            {formData.contacts.map((contact, index) => (
              <div key={index} className="mb-4 p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">담당자 {index + 1}</h4>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveContact(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      삭제
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      이름
                    </label>
                    <Input
                      value={contact.name}
                      onChange={(e) =>
                        handleContactChange(index, "name", e.target.value)
                      }
                      placeholder="담당자 이름"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      연락처
                    </label>
                    <Input
                      value={contact.phone}
                      onChange={(e) =>
                        handleContactChange(index, "phone", e.target.value)
                      }
                      placeholder="담당자 연락처"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      이메일
                    </label>
                    <Input
                      value={contact.email}
                      onChange={(e) =>
                        handleContactChange(index, "email", e.target.value)
                      }
                      placeholder="담당자 이메일"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddContact}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              + 담당자 추가
            </button>
          </div>
        </FormSection>

        <FormSection title="기타 정보">
          <div>
            <Input
              label="메모"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              type="textarea"
              rows="3"
              placeholder="거래처에 대한 추가 정보나 메모를 입력하세요."
            />
          </div>
        </FormSection>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" variant="primary">
            {customer ? "수정" : "등록"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
