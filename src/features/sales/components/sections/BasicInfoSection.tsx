"use client";

import { useEffect, useState } from "react";
import {
  generateInvoiceNumber,
  extractRandomCodeFromInvoiceNumber,
} from "../utils/document-utils";

export default function BasicInfoSection({
  date,
  invoiceNumber,
  onUpdate,
}: {
  date: string;
  invoiceNumber: string;
  onUpdate: (data: any) => void;
}) {
  // 문서번호의 랜덤 코드 부분 저장
  const [randomCode, setRandomCode] = useState<string | null>(null);

  // 컴포넌트 마운트 시 또는 invoiceNumber가 변경될 때 랜덤 코드 추출
  useEffect(() => {
    if (invoiceNumber) {
      const code = extractRandomCodeFromInvoiceNumber(invoiceNumber);
      setRandomCode(code);
    } else {
      // 초기 문서번호가 없는 경우 새로 생성
      const newInvoiceNumber = generateInvoiceNumber(date);
      onUpdate({ invoiceNumber: newInvoiceNumber });

      // 새 문서번호에서 랜덤 코드 추출
      const code = extractRandomCodeFromInvoiceNumber(newInvoiceNumber);
      setRandomCode(code);
    }
  }, [invoiceNumber, date, onUpdate]);

  // 날짜 변경 시 문서번호 업데이트
  const handleDateChange = (newDate: string) => {
    // 날짜 변경 시 기존 랜덤 코드를 유지하면서 문서번호 업데이트
    const updatedInvoiceNumber = generateInvoiceNumber(
      newDate,
      randomCode || undefined
    );

    onUpdate({
      date: newDate,
      invoiceNumber: updatedInvoiceNumber,
    });
  };

  // 새 문서번호 생성
  const handleGenerateNewInvoiceNumber = () => {
    const newInvoiceNumber = generateInvoiceNumber(date);
    onUpdate({ invoiceNumber: newInvoiceNumber });

    // 새 문서번호에서 랜덤 코드 추출
    const code = extractRandomCodeFromInvoiceNumber(newInvoiceNumber);
    setRandomCode(code);
  };

  return (
    <section className="bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden border border-border">
      <div className="bg-gradient-to-r from-blue-50 to-card dark:from-blue-950/20 dark:to-card border-b border-border py-4 px-6">
        <h2 className="text-lg font-medium text-foreground flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-blue-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
          기본 정보
        </h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              거래 날짜
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-muted-foreground"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="pl-10 h-10 w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              문서 번호
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-muted-foreground"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={invoiceNumber}
                  readOnly
                  className="pl-10 h-10 w-full rounded-md border border-input bg-muted text-foreground shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm"
                />
              </div>
              <button
                type="button"
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleGenerateNewInvoiceNumber}
                title="새 문서번호 생성"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
