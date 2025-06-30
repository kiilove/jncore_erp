"use client";

import type React from "react";

import { useState } from "react";
import BasicInfoSection from "./sections/BasicInfoSection";
import CustomerSection from "./sections/CustomerSection";
import ItemsSection from "./sections/ItemsSection";
import PaymentSection from "./sections/PaymentSection";
import NoteSection from "./sections/NoteSection";
import SummarySection from "./sections/SummarySection";
import { generateInvoiceNumber } from "./utils/document-utils";
import { serverTimestamp } from "firebase/firestore";
// 타입 정의
import type { CustomerBasic, Contact } from "./sections/CustomerSection";
import type { Item } from "./sections/ItemsSection";
import type { SaleData } from "../services/SalesService";

interface FormData {
  date: string;
  invoiceNumber: string;
  customer: CustomerBasic | null;
  contact: Contact | null;
  items: Item[];
  paymentMethod: string;
  notes: string;
  taxMethod: string;
}

interface SalesFormProps {
  initialValues?: SaleData;
  onSubmit: (data: SaleData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  isEdit?: boolean;
}

export default function SalesForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
  isEdit = false,
}: SalesFormProps) {
  // 현재 날짜를 서버 시간으로 가져오기
  const today = new Date()
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\. /g, "-")
    .replace(".", "");

  // 초기 문서번호 생성
  const initialInvoiceNumber = generateInvoiceNumber(today);

  const [formData, setFormData] = useState<FormData>({
    date: initialValues?.issueDate || today,
    invoiceNumber: initialValues?.documentNumber || initialInvoiceNumber,
    customer: initialValues?.customer || null,
    contact: initialValues?.contact || null,
    items: initialValues?.items || [],
    paymentMethod: initialValues?.payment?.method || "CREDIT",
    taxMethod: initialValues?.tax?.method || "excluded",
    notes: initialValues?.notes || "",
  });

  const updateFormData = (section: string, data: Partial<FormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  // 총 금액 계산 함수
  const calculateTotals = () => {
    const supplyAmount = formData.items.reduce(
      (sum, item) => sum + (item.supplyAmount || 0),
      0
    );
    const taxAmount = formData.items.reduce(
      (sum, item) => sum + (item.taxAmount || 0),
      0
    );
    const totalAmount = formData.items.reduce(
      (sum, item) => sum + (item.totalAmount || 0),
      0
    );

    return { supplyAmount, taxAmount, totalAmount };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 총 금액 계산
    const { supplyAmount, taxAmount, totalAmount } = calculateTotals();

    // 제출할 데이터 구성
    const submissionData: SaleData = {
      // 기본 정보
      documentNumber: formData.invoiceNumber,
      issueDate: formData.date,

      // 거래처 정보
      customer: formData.customer
        ? {
            name: formData.customer.name,
            businessNumber: formData.customer.businessNumber,
            representative: formData.customer.representative,
            address: formData.customer.address,
            businessType: formData.customer.businessType,
            businessCategory: formData.customer.businessCategory,
          }
        : null,

      // 담당자 정보
      contact: formData.contact
        ? {
            name: formData.contact.name,
            phone: formData.contact.phone,
            email: formData.contact.email,
          }
        : null,

      // 상품 정보
      items: formData.items.map((item, index) => ({
        id: item.id || null,
        itemName: item.itemName,
        specification: item.specification,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        supplyAmount: item.supplyAmount,
        taxAmount: item.taxAmount,
        totalAmount: item.totalAmount,
        notes: item.notes,
      })),

      // 결제 정보
      payment: {
        method: formData.paymentMethod,
        methodText:
          formData.paymentMethod === "CREDIT"
            ? "신용거래"
            : formData.paymentMethod === "CASH"
            ? "현금"
            : "카드",
      },

      // 세금 정보
      tax: {
        method: formData.taxMethod,
        methodText:
          formData.taxMethod === "included" ? "부가세포함" : "부가세별도",
      },

      // 금액 정보
      amounts: {
        supplyAmount,
        taxAmount,
        totalAmount,
      },

      // 비고
      notes: formData.notes,
    };

    // 유효성 검사 결과 출력
    const validationResults = validateFormData(submissionData);
    if (validationResults.length > 0) {
      console.log("=== 유효성 검사 결과 ===");
      validationResults.forEach((result) => {
        console.log(`- ${result}`);
      });
      alert(validationResults.join("\n"));
      return;
    }

    // 부모 컴포넌트의 onSubmit 호출
    onSubmit(submissionData);
  };

  // 유효성 검사 함수
  const validateFormData = (data: any) => {
    const errors: string[] = [];

    console.log("=== 제출 데이터 전체 ===");
    console.log(data);

    console.log("\n=== 상품 데이터 ===");
    console.log(data.items);

    // 필수 필드 검사
    if (!data.documentNumber) errors.push("문서 번호가 필요합니다.");
    if (!data.issueDate) errors.push("거래 날짜가 필요합니다.");

    // 거래처 정보 검사
    if (!data.customer) {
      errors.push("거래처 정보가 필요합니다.");
    } else {
      if (!data.customer.name) errors.push("거래처명이 필요합니다.");
      if (!data.customer.businessNumber)
        errors.push("사업자등록번호가 필요합니다.");
    }

    // 상품 정보 검사
    if (!data.items || data.items.length === 0) {
      errors.push("최소 하나 이상의 상품이 필요합니다.");
    } else {
      data.items.forEach((item: any, index: number) => {
        console.log(`\n=== 상품 #${index + 1} 데이터 ===`);
        console.log(item);

        if (!item.itemName)
          errors.push(`상품 #${index + 1}: 품목명이 필요합니다.`);
        if (item.quantity <= 0)
          errors.push(`상품 #${index + 1}: 수량은 0보다 커야 합니다.`);
      });
    }

    console.log("\n=== 유효성 검사 결과 ===");
    console.log(errors);

    return errors;
  };

  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">판매 등록</h1>
          <p className="text-muted-foreground mt-1">
            새로운 판매 정보를 입력하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <CustomerSection
            data={{ customer: formData.customer, contact: formData.contact }}
            onUpdate={(data) => updateFormData("customerInfo", data)}
          />

          <BasicInfoSection
            date={formData.date}
            invoiceNumber={formData.invoiceNumber}
            onUpdate={(data) => updateFormData("basicInfo", data)}
          />

          <ItemsSection
            items={formData.items}
            onUpdate={(data) => updateFormData("items", data)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <NoteSection
                notes={formData.notes}
                onUpdate={(data) => updateFormData("notes", data)}
              />
            </div>
            <div>
              <SummarySection
                items={formData.items}
                taxMethod={formData.taxMethod}
                onUpdate={(data) => updateFormData("summary", data)}
              />
            </div>
          </div>

          <PaymentSection
            paymentMethod={formData.paymentMethod}
            onUpdate={(data) => updateFormData("payment", data)}
          />

          <div className="sticky bottom-0 z-10 bg-card border-t border-border shadow-lg py-4 px-4 left-0 right-0 mt-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>모든 필수 정보를 입력하세요</span>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 inline"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  취소
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 inline"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  등록
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1 inline"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
