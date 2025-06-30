"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "../../../components/common/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/common/Card";
import { Upload, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";

const CustomerExcelUpload = ({ onUpload }) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const processCustomerData = (data) => {
    const processedData = [];
    const businessNumberMap = new Map(); // 사업자번호별 이메일을 저장할 Map

    // 5번째 행부터 데이터 처리 (인덱스 4부터)
    for (let i = 4; i < data.length; i++) {
      const row = data[i];
      try {
        console.log(`처리 중인 행 ${i + 1}:`, row);

        // [폐업] 체크
        if (row[3]?.includes("[폐업]")) {
          // D열 (인덱스 3)
          console.log(`[폐업] 건너뛰기: ${row[3]}`);
          continue;
        }

        const businessNumber = row[1]; // B열 (인덱스 1)
        if (!businessNumber) {
          console.log(`사업자등록번호 없음 건너뛰기: ${row[3]}`);
          continue;
        }

        // 담당자 정보 처리
        const contactName = row[9] || ""; // J열 (인덱스 9)
        const contactPhone = row[10] || ""; // K열 (인덱스 10)
        const contactEmail = row[13] || ""; // N열 (인덱스 13)

        // 담당자 객체 생성
        const contact = {
          name: contactName,
          phone: contactPhone,
          email: contactEmail,
        };

        // 사업자번호별로 데이터 수집
        if (!businessNumberMap.has(businessNumber)) {
          businessNumberMap.set(businessNumber, {
            businessNumber: businessNumber,
            name: row[3] || "", // D열 (인덱스 3)
            representative: row[4] || "", // E열 (인덱스 4)
            address: row[5] || "", // F열 (인덱스 5)
            businessType: row[6] || "", // G열 (인덱스 6)
            businessCategory: row[7] || "", // H열 (인덱스 7)
            contacts: [contact], // 담당자 정보를 객체 배열로 저장
          });
        } else {
          // 이미 존재하는 사업자번호의 경우 담당자 정보 추가
          const existingData = businessNumberMap.get(businessNumber);
          existingData.contacts.push(contact);
        }
      } catch (err) {
        console.error(`행 ${i + 1} 처리 중 오류:`, err);
      }
    }

    // Map의 데이터를 배열로 변환
    businessNumberMap.forEach((value) => {
      const customerData = {
        ...value,
        // contacts 배열이 비어있는 경우 빈 배열로 초기화
        contacts: value.contacts || [],
      };
      console.log(`생성된 고객 데이터:`, customerData);
      processedData.push(customerData);
    });

    return processedData;
  };

  const handleFileUpload = useCallback(
    async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log("파일 선택됨:", file.name);
        const data = await file.arrayBuffer();
        console.log("파일 데이터 로드됨");

        const workbook = XLSX.read(data);
        console.log("워크북 생성됨:", workbook.SheetNames);

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        console.log("워크시트 로드됨");

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log("원본 JSON 데이터:", jsonData);
        console.log("데이터 행 수:", jsonData.length);

        // 헤더 행 확인
        console.log("헤더 행 (4번째 행):", jsonData[3]);

        if (jsonData.length < 5) {
          throw new Error("엑셀 파일에 데이터가 충분하지 않습니다.");
        }

        const processedData = processCustomerData(jsonData);
        console.log("처리된 데이터:", processedData);
        console.log("처리된 데이터 수:", processedData.length);

        if (processedData.length === 0) {
          setError("처리 가능한 거래처 정보가 없습니다.");
          return;
        }

        onUpload(processedData);
      } catch (err) {
        console.error("파일 처리 중 오류:", err);
        setError(
          err.message ||
            "파일 처리 중 오류가 발생했습니다. 엑셀 파일 형식을 확인해주세요."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [onUpload]
  );

  return (
    <Card className="border-t-4 border-t-blue-500 dark:border-t-blue-400 shadow-md">
      <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-9 flex items-center justify-center px-4 py-0">
        <CardTitle className="text-sm flex w-full items-center text-blue-700 dark:text-blue-300">
          <Upload className="mr-2 h-4 w-4" />
          거래처 엑셀 업로드
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {error && (
          <div className="mb-4 flex items-center text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}

        <div className="flex flex-col items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleButtonClick}
            className="flex items-center"
            disabled={isLoading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isLoading ? "처리 중..." : "엑셀 파일 선택"}
          </Button>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            홈택스에서 다운로드한 거래처 정보 엑셀 파일을 선택해주세요.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerExcelUpload;
