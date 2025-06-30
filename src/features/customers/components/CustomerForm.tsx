"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  FiSearch,
  FiUser,
  FiBriefcase,
  FiMapPin,
  FiPhone,
  FiMail,
  FiPlus,
  FiTrash2,
  FiFileText,
  FiSave,
  FiX,
} from "react-icons/fi";
import type { Customer, Contact, FormErrors, CustomerFormData } from "../types";

// 카카오 주소검색 API 타입 정의
interface DaumPostcodeData {
  address: string;
  addressType: string;
  bname: string;
  buildingName: string;
}

interface DaumPostcode {
  open: () => void;
  oncomplete: (data: DaumPostcodeData) => void;
}

// Window 타입 확장
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void;
      }) => DaumPostcode;
    };
  }
}

// 컴포넌트 props 타입 정의
interface CustomerFormProps {
  customer?: Customer | null;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => Promise<void>;
}

// 섹션 타입 정의
interface Section {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const CustomerForm = ({ customer, onClose, onSubmit }: CustomerFormProps) => {
  const getInitialFormData = (): CustomerFormData => ({
    name: customer?.name || "",
    businessNumber: customer?.businessNumber || "",
    representative: customer?.representative || "",
    address: customer?.address || "",
    businessType: customer?.businessType || "",
    businessCategory: customer?.businessCategory || "",
    contacts: customer?.contacts || [{ name: "", phone: "", email: "" }],
  });

  const [formData, setFormData] = useState<CustomerFormData>(
    getInitialFormData()
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");

  useEffect(() => {
    if (customer) {
      setFormData(getInitialFormData());
    }
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
      oncomplete: (data: DaumPostcodeData) => {
        let fullAddress = data.address;
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
          fullAddress += extraAddress !== "" ? " (" + extraAddress + ")" : "";
        }

        // 주소를 단일 필드로 설정
        setFormData({
          ...formData,
          address: fullAddress,
        });
      },
    }).open();
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // 회사명 검증
    if (!formData.name?.trim()) {
      errors["name"] = "회사명을 입력해주세요.";
    }

    // 사업자등록번호 검증
    if (!formData.businessNumber?.trim()) {
      errors["businessNumber"] = "사업자등록번호를 입력해주세요.";
    }

    // 대표자명 검증
    if (!formData.representative?.trim()) {
      errors["representative"] = "대표자명을 입력해주세요.";
    }

    // 주소 검증
    if (!formData.address?.trim()) {
      errors["address"] = "주소를 입력해주세요.";
    }

    // 업태 검증
    if (!formData.businessType?.trim()) {
      errors["businessType"] = "업태를 입력해주세요.";
    }

    // 종목 검증
    if (!formData.businessCategory?.trim()) {
      errors["businessCategory"] = "종목을 입력해주세요.";
    }

    // 담당자 정보 검증 (최소 한 명의 담당자 필요)
    if (formData.contacts.length === 0 || !formData.contacts[0].name?.trim()) {
      errors["contacts.0.name"] = "최소 한 명의 담당자 정보가 필요합니다.";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 폼 제출 시 부모 컴포넌트로 데이터 전달
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorField = document.querySelector("[data-error]");
      if (firstErrorField) {
        // 먼저 요소를 화면에 스크롤
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });

        // 그 다음 HTMLElement로 캐스팅하여 focus 메서드 호출
        if (firstErrorField instanceof HTMLElement) {
          firstErrorField.focus();
        }
      }
      return;
    }

    try {
      setIsSubmitting(true);
      // 빈 담당자 정보 필터링
      const filteredContacts = formData.contacts.filter(
        (contact) =>
          contact.name.trim() !== "" ||
          contact.phone.trim() !== "" ||
          contact.email.trim() !== ""
      );

      const submitData = {
        ...formData,
        contacts:
          filteredContacts.length > 0
            ? filteredContacts
            : [{ name: "", phone: "", email: "" }],
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleContactChange = (
    index: number,
    field: keyof Contact,
    value: string
  ) => {
    setFormData((prev) => {
      const newContacts = [...prev.contacts];
      if (!newContacts[index]) {
        newContacts[index] = { name: "", phone: "", email: "" };
      }
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

  const handleRemoveContact = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  };

  const sections: Section[] = [
    { id: "basic", label: "기본 정보", icon: <FiBriefcase /> },
    { id: "contact", label: "담당자 정보", icon: <FiPhone /> },
    { id: "etc", label: "기타 정보", icon: <FiFileText /> },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
                <FiBriefcase className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {customer ? "거래처 정보 수정" : "새 거래처 등록"}
              </h1>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                <FiX className="mr-2 h-4 w-4" />
                취소
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                <FiSave className="mr-2 h-4 w-4" />
                {isSubmitting ? "처리 중..." : customer ? "수정" : "등록"}
              </button>
            </div>
          </div>
        </div>

        {/* 네비게이션 탭 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 mb-6 overflow-x-auto">
          <div className="flex space-x-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  activeSection === section.id
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
                type="button"
              >
                <span className="mr-2">{section.icon}</span>
                <span>{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 섹션 */}
          <div className={activeSection === "basic" ? "block" : "hidden"}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <FiBriefcase className="mr-2 h-5 w-5" />
                  기본 정보
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-1">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      <span className="flex items-center">
                        <FiBriefcase className="mr-2 h-4 w-4 text-gray-500" />
                        회사명
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      data-error={errors["name"] ? true : undefined}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors["name"] ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors["name"] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors["name"]}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label
                      htmlFor="businessNumber"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      <span className="flex items-center">
                        <FiFileText className="mr-2 h-4 w-4 text-gray-500" />
                        사업자등록번호
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <input
                      id="businessNumber"
                      name="businessNumber"
                      type="text"
                      value={formData.businessNumber}
                      onChange={handleInputChange}
                      placeholder="000-00-00000"
                      required
                      data-error={errors["businessNumber"] ? true : undefined}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors["businessNumber"]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors["businessNumber"] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors["businessNumber"]}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label
                      htmlFor="representative"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      <span className="flex items-center">
                        <FiUser className="mr-2 h-4 w-4 text-gray-500" />
                        대표자명
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <input
                      id="representative"
                      name="representative"
                      type="text"
                      value={formData.representative}
                      onChange={handleInputChange}
                      required
                      data-error={errors["representative"] ? true : undefined}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors["representative"]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors["representative"] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors["representative"]}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex gap-2">
                      <div className="flex-1 flex flex-col space-y-1">
                        <label
                          htmlFor="address"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          <span className="flex items-center">
                            <FiMapPin className="mr-2 h-4 w-4 text-gray-500" />
                            주소
                            <span className="text-red-500 ml-1">*</span>
                          </span>
                        </label>
                        <input
                          id="address"
                          name="address"
                          type="text"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          data-error={errors["address"] ? true : undefined}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                            errors["address"]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {errors["address"] && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors["address"]}
                          </p>
                        )}
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={handleAddressSearch}
                          className="h-10 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FiSearch className="mr-2 h-4 w-4 inline" />
                          주소검색
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label
                      htmlFor="businessType"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      <span className="flex items-center">
                        <FiBriefcase className="mr-2 h-4 w-4 text-gray-500" />
                        업태
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <input
                      id="businessType"
                      name="businessType"
                      type="text"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      placeholder="예: 도매업, 소매업, 제조업"
                      required
                      data-error={errors["businessType"] ? true : undefined}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors["businessType"]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors["businessType"] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors["businessType"]}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label
                      htmlFor="businessCategory"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      <span className="flex items-center">
                        <FiBriefcase className="mr-2 h-4 w-4 text-gray-500" />
                        종목
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <input
                      id="businessCategory"
                      name="businessCategory"
                      type="text"
                      value={formData.businessCategory}
                      onChange={handleInputChange}
                      placeholder="예: 전자제품, 의류, 식품"
                      required
                      data-error={errors["businessCategory"] ? true : undefined}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors["businessCategory"]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors["businessCategory"] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors["businessCategory"]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 담당자 정보 섹션 */}
          <div className={activeSection === "contact" ? "block" : "hidden"}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <FiPhone className="mr-2 h-5 w-5" />
                  담당자 정보
                </h2>
              </div>
              <div className="p-6">
                {formData.contacts.map((contact, index) => (
                  <div
                    key={index}
                    className="mb-6 p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-lg flex items-center text-blue-600 dark:text-blue-400">
                        <FiUser className="mr-2 h-5 w-5" />
                        담당자 {index + 1}
                      </h4>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveContact(index)}
                          className="text-red-500 hover:text-red-700 flex items-center px-2 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          <FiTrash2 className="mr-1 h-4 w-4" />
                          삭제
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex flex-col space-y-1">
                        <label
                          htmlFor={`contact-name-${index}`}
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          <span className="flex items-center">
                            <FiUser className="mr-2 h-4 w-4 text-gray-500" />
                            이름
                          </span>
                        </label>
                        <input
                          id={`contact-name-${index}`}
                          type="text"
                          value={contact.name}
                          onChange={(e) =>
                            handleContactChange(index, "name", e.target.value)
                          }
                          placeholder="담당자 이름"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label
                          htmlFor={`contact-phone-${index}`}
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          <span className="flex items-center">
                            <FiPhone className="mr-2 h-4 w-4 text-gray-500" />
                            연락처
                          </span>
                        </label>
                        <input
                          id={`contact-phone-${index}`}
                          type="text"
                          value={contact.phone}
                          onChange={(e) =>
                            handleContactChange(index, "phone", e.target.value)
                          }
                          placeholder="담당자 연락처"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label
                          htmlFor={`contact-email-${index}`}
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          <span className="flex items-center">
                            <FiMail className="mr-2 h-4 w-4 text-gray-500" />
                            이메일
                          </span>
                        </label>
                        <input
                          id={`contact-email-${index}`}
                          type="email"
                          value={contact.email}
                          onChange={(e) =>
                            handleContactChange(index, "email", e.target.value)
                          }
                          placeholder="담당자 이메일"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddContact}
                  className="mt-2 flex items-center text-blue-600 hover:text-blue-800 border-dashed border-2 px-4 py-2 rounded-md"
                >
                  <FiPlus className="mr-2 h-4 w-4" />
                  담당자 추가
                </button>
              </div>
            </div>
          </div>

          {/* 기타 정보 섹션 */}
          <div className={activeSection === "etc" ? "block" : "hidden"}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <FiFileText className="mr-2 h-5 w-5" />
                  기타 정보
                </h2>
              </div>
              <div className="p-6">
                <div className="text-gray-600 dark:text-gray-300 mb-4">
                  <p>
                    <strong>생성일:</strong>{" "}
                    {customer?.createdAt
                      ? new Date(customer.createdAt.toDate()).toLocaleString()
                      : "신규 등록"}
                  </p>
                  <p>
                    <strong>생성자:</strong>{" "}
                    {customer?.createdBy || "신규 등록"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  처리 중...
                </>
              ) : (
                <>
                  <FiSave className="mr-2 h-4 w-4 inline" />
                  {customer ? "수정" : "등록"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
