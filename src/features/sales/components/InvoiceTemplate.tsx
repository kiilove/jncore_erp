import { forwardRef } from "react";
import type { SaleData } from "../services/SalesService";

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  businessNumber: string;
  stampUrl?: string; // 인감 이미지 URL 추가
}

interface InvoiceTemplateProps {
  sale: SaleData;
  companyInfo: CompanyInfo;
  showStamp?: boolean; // 인감 표시 여부 prop 추가
}

// 숫자 포맷 함수
export const formatNumber = (number: number) => {
  return new Intl.NumberFormat("ko-KR").format(number);
};

// 통화 포맷 함수
export const formatCurrency = (number: number) => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    currencyDisplay: "symbol",
  })
    .format(number)
    .replace("₩", "");
};

const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ sale, companyInfo, showStamp = true }, ref) => {
    if (!sale) return null;

    // 날짜 포맷 함수
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}.${String(date.getDate()).padStart(2, "0")}`;
    };

    return (
      <div
        ref={ref}
        className="invoice-template"
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "10mm",
          boxSizing: "border-box",
          backgroundColor: "white",
          position: "relative",
          // 상단 여백 조정 (텍스트가 아래로 밀리는 현상 해결)
          paddingTop: "5mm", // 상단 여백을 줄임
        }}
      >
        {/* 배경 워터마크 - 용량 최적화를 위해 투명도 낮춤 */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none z-0"
          style={{
            backgroundImage: `url('/placeholder-sty6f.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div className="relative z-10">
          {/* 그라데이션 헤더 */}
          <div className="rounded-md mb-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3 relative">
              <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill="#FFFFFF"
                    d="M47.5,-61.7C59.9,-51.5,67.3,-35.2,71.9,-18.2C76.5,-1.1,78.3,16.7,71.8,30.7C65.3,44.7,50.5,54.8,35.1,62.8C19.7,70.8,3.7,76.7,-13.2,75.5C-30.1,74.3,-47.9,66,-59.5,52.2C-71.1,38.4,-76.5,19.2,-76.3,0.1C-76.1,-19,-70.3,-38,-58.5,-48.7C-46.7,-59.4,-28.9,-61.7,-12.2,-63.1C4.4,-64.5,35.1,-71.9,47.5,-61.7Z"
                    transform="translate(100 100)"
                  />
                </svg>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    거래명세서
                  </h1>
                  <p className="text-blue-100 text-xs">SALES INVOICE</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-100">
                    {companyInfo.name}
                  </div>
                  <div className="text-xs text-blue-100">
                    {companyInfo.businessNumber}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex justify-between items-end">
                <div>
                  <div className="text-xs text-blue-100">문서번호</div>
                  <div className="text-sm font-medium text-gray-100">
                    {sale.documentNumber || "-"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-blue-100">발행일</div>
                  <div className="text-sm text-gray-100">
                    {formatDate(sale.issueDate)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 공급자/공급받는자 정보 - 수평 레이아웃 */}
          <div className="flex gap-3 mb-3">
            {/* 공급자 정보 */}
            <div className="border border-gray-200 rounded-md overflow-hidden flex-1">
              <div className="bg-blue-50 px-3 py-1 border-b border-blue-100">
                <h2 className="font-semibold text-blue-800 text-xs">
                  공급자 정보
                </h2>
              </div>
              <div className="p-2 space-y-1 text-xs">
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-gray-500">회사명</div>
                  <div className="col-span-2 font-medium text-gray-900">
                    {companyInfo.name}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-gray-500">사업자번호</div>
                  <div className="col-span-2 text-gray-900">
                    {companyInfo.businessNumber}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-gray-500">주소</div>
                  <div className="col-span-2 text-gray-900">
                    {companyInfo.address}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-gray-500">연락처</div>
                  <div className="col-span-2 text-gray-900">
                    {companyInfo.phone}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-gray-500">이메일</div>
                  <div className="col-span-2 text-gray-900">
                    {companyInfo.email}
                  </div>
                </div>
              </div>
            </div>

            {/* 공급받는자 정보 */}
            <div className="border border-gray-200 rounded-md overflow-hidden flex-1">
              <div className="bg-blue-50 px-3 py-1 border-b border-blue-100">
                <h2 className="font-semibold text-blue-800 text-xs">
                  공급받는자 정보
                </h2>
              </div>
              <div className="p-2 space-y-1 text-xs">
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-gray-500">회사명</div>
                  <div className="col-span-2 font-medium text-gray-900">
                    {sale.customer?.name || "개인"}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-gray-500">사업자번호</div>
                  <div className="col-span-2 text-gray-900">
                    {sale.customer?.businessNumber || "-"}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-gray-500">주소</div>
                  <div className="col-span-2 text-gray-900">
                    {sale.customer?.address || "-"}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-gray-500">담당자</div>
                  <div className="col-span-2 text-gray-900">
                    {sale.contact?.name || "-"}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-gray-500">이메일</div>
                  <div className="col-span-2 text-gray-900">
                    {sale.contact?.email || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 품목 테이블 */}
          <div className="mb-3">
            <div className="bg-blue-50 px-3 py-1 border border-blue-100 rounded-t-md">
              <h2 className="font-semibold text-blue-800 text-xs">거래 품목</h2>
            </div>
            <div className="border-x border-gray-200">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-1.5 px-2 text-left border-b border-gray-200 text-gray-600 font-medium">
                      No.
                    </th>
                    <th className="py-1.5 px-2 text-left border-b border-gray-200 text-gray-600 font-medium">
                      품목
                    </th>
                    <th className="py-1.5 px-2 text-left border-b border-gray-200 text-gray-600 font-medium">
                      규격
                    </th>
                    <th className="py-1.5 px-2 text-right border-b border-gray-200 text-gray-600 font-medium w-16">
                      수량
                    </th>
                    <th className="py-1.5 px-2 text-right border-b border-gray-200 text-gray-600 font-medium w-24">
                      단가
                    </th>
                    <th className="py-1.5 px-2 text-right border-b border-gray-200 text-gray-600 font-medium w-24">
                      세액
                    </th>
                    <th className="py-1.5 px-2 text-right border-b border-gray-200 text-gray-600 font-medium w-24">
                      공급가액
                    </th>
                    <th className="py-1.5 px-2 text-right border-b border-gray-200 text-gray-600 font-medium w-24">
                      금액
                    </th>
                    <th className="py-1.5 px-2 text-left border-b border-gray-200 text-gray-600 font-medium">
                      비고
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="py-1.5 px-2 border-b border-gray-200 text-gray-700">
                        {index + 1}
                      </td>
                      <td className="py-1.5 px-2 border-b border-gray-200 text-gray-900">
                        {item.itemName}
                      </td>
                      <td className="py-1.5 px-2 border-b border-gray-200 text-gray-900">
                        {item.specification || "-"}
                      </td>
                      <td className="py-1.5 px-2 border-b border-gray-200 text-gray-900 text-right">
                        {formatNumber(item.quantity)}
                      </td>
                      <td className="py-1.5 px-2 border-b border-gray-200 text-gray-900 text-right">
                        {formatCurrency(item.unitPrice)}원
                      </td>
                      <td className="py-1.5 px-2 border-b border-gray-200 text-gray-900 text-right">
                        {formatCurrency(item.taxAmount)}원
                      </td>
                      <td className="py-1.5 px-2 border-b border-gray-200 text-gray-900 text-right">
                        {formatCurrency(item.supplyAmount)}원
                      </td>
                      <td className="py-1.5 px-2 border-b border-gray-200 text-gray-900 text-right font-medium">
                        {formatCurrency(item.totalAmount)}원
                      </td>
                      <td className="py-1.5 px-2 border-b border-gray-200 text-gray-900">
                        {item.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan={5}
                      className="py-1.5 px-2 border-b border-gray-200 text-gray-600 font-medium text-right"
                    >
                      합계
                    </td>
                    <td className="py-1.5 px-2 border-b border-gray-200 text-gray-900 text-right">
                      {formatCurrency(sale.amounts.taxAmount)}원
                    </td>
                    <td className="py-1.5 px-2 border-b border-gray-200 text-gray-900 text-right">
                      {formatCurrency(sale.amounts.supplyAmount)}원
                    </td>
                    <td className="py-1.5 px-2 border-b border-gray-200 text-gray-900 text-right font-bold">
                      {formatCurrency(sale.amounts.totalAmount)}원
                    </td>
                    <td className="py-1.5 px-2 border-b border-gray-200"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 메모 */}
          {sale.notes && (
            <div className="mb-3 border border-gray-200 rounded-md overflow-hidden">
              <div className="bg-blue-50 px-3 py-1 border-b border-blue-100">
                <h2 className="font-semibold text-blue-800 text-xs">비고</h2>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-900 whitespace-pre-line">
                  {sale.notes}
                </p>
              </div>
            </div>
          )}

          {/* 인감 부분 */}
          <div className="mb-3 mt-6">
            <div className="flex justify-between">
              <div className="w-1/2 pr-4">
                <div className="border-t-2 border-gray-400 pt-2 text-center">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    공급자 확인
                  </p>
                  <div className="border border-dashed border-gray-300 rounded-md h-28 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">서명/인감</p>
                      <div className="w-16 h-16 mx-auto border border-gray-300 rounded-full flex items-center justify-center relative">
                        {showStamp && companyInfo.stampUrl ? (
                          <img
                            src={companyInfo.stampUrl || "/placeholder.svg"}
                            alt="회사 인감"
                            className="w-14 h-14 object-contain absolute"
                            style={{
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                            }}
                          />
                        ) : (
                          <span className="text-xs text-gray-400">
                            직인생략
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {companyInfo.name}
                  </p>
                </div>
              </div>
              <div className="w-1/2 pl-4">
                <div className="border-t-2 border-gray-400 pt-2 text-center">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    공급받는자 확인
                  </p>
                  <div className="border border-dashed border-gray-300 rounded-md h-28 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">서명 날인</p>
                      <div className="w-16 h-16 mx-auto border border-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs text-gray-400">서명/인감</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {sale.customer?.name || "개인"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="text-center text-gray-500 text-[10px] mt-3 border-t border-gray-200 pt-2">
            <p>
              본 거래명세서는 전자적으로 발행된 문서로 법적 효력을 가집니다.
            </p>
            <p>
              © {new Date().getFullYear()} {companyInfo.name}. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    );
  }
);

InvoiceTemplate.displayName = "InvoiceTemplate";

export default InvoiceTemplate;
