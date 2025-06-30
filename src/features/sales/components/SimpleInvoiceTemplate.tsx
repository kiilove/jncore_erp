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

interface SimpleInvoiceTemplateProps {
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

const SimpleInvoiceTemplate = forwardRef<
  HTMLDivElement,
  SimpleInvoiceTemplateProps
>(({ sale, companyInfo, showStamp = true }, ref) => {
  if (!sale) return null;

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}.${String(date.getDate()).padStart(2, "0")}`;
  };

  // 품목 행 수 계산
  const itemCount = sale.items.length;
  const emptyRowCount = itemCount >= 10 ? 0 : 10 - itemCount;

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
        fontFamily: "sans-serif",
      }}
    >
      <div className="relative z-10">
        {/* 심플한 헤더 */}
        <div className="border-b-2 border-black pb-2 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">거래명세서</h1>
              <p className="text-xs text-gray-600">SALES INVOICE</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">{companyInfo.name}</div>
              <div className="text-xs text-gray-600">
                {companyInfo.businessNumber}
              </div>
            </div>
          </div>
          <div className="mt-2 flex justify-between items-end">
            <div>
              <div className="text-xs text-gray-600">문서번호</div>
              <div className="text-sm font-medium">
                {sale.documentNumber || "-"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-600">발행일</div>
              <div className="text-sm">{formatDate(sale.issueDate)}</div>
            </div>
          </div>
        </div>

        {/* 공급자/공급받는자 정보 - 심플한 테이블 형태 */}
        <div className="mb-4">
          <table className="w-full border-collapse text-xs">
            <tbody>
              <tr>
                <td className="border border-gray-300 bg-gray-100 font-semibold p-1 w-24 align-middle">
                  공급자
                </td>
                <td className="border border-gray-300 p-1 align-middle">
                  <div className="grid grid-cols-6 gap-1">
                    <div className="font-semibold">회사명</div>
                    <div className="col-span-2">{companyInfo.name}</div>
                    <div className="font-semibold">사업자번호</div>
                    <div className="col-span-2">
                      {companyInfo.businessNumber}
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-1 mt-1">
                    <div className="font-semibold">주소</div>
                    <div className="col-span-5">{companyInfo.address}</div>
                  </div>
                  <div className="grid grid-cols-6 gap-1 mt-1">
                    <div className="font-semibold">연락처</div>
                    <div className="col-span-2">{companyInfo.phone}</div>
                    <div className="font-semibold">이메일</div>
                    <div className="col-span-2">{companyInfo.email}</div>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 bg-gray-100 font-semibold p-1 align-middle">
                  공급받는자
                </td>
                <td className="border border-gray-300 p-1 align-middle">
                  <div className="grid grid-cols-6 gap-1">
                    <div className="font-semibold">회사명</div>
                    <div className="col-span-2">
                      {sale.customer?.name || "개인"}
                    </div>
                    <div className="font-semibold">사업자번호</div>
                    <div className="col-span-2">
                      {sale.customer?.businessNumber || "-"}
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-1 mt-1">
                    <div className="font-semibold">주소</div>
                    <div className="col-span-5">
                      {sale.customer?.address || "-"}
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-1 mt-1">
                    <div className="font-semibold">담당자</div>
                    <div className="col-span-2">
                      {sale.contact?.name || "-"}
                    </div>
                    <div className="font-semibold">이메일</div>
                    <div className="col-span-2">
                      {sale.contact?.email || "-"}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 품목 테이블 - 심플한 디자인 */}
        <div className="mb-4">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-100 p-1 text-center align-middle h-8">
                  No.
                </th>
                <th className="border border-gray-300 bg-gray-100 p-1 text-left align-middle h-8">
                  품목
                </th>
                <th className="border border-gray-300 bg-gray-100 p-1 text-left align-middle h-8">
                  규격
                </th>
                <th className="border border-gray-300 bg-gray-100 p-1 text-right align-middle h-8">
                  수량
                </th>
                <th className="border border-gray-300 bg-gray-100 p-1 text-right align-middle h-8">
                  단가
                </th>
                <th className="border border-gray-300 bg-gray-100 p-1 text-right align-middle h-8">
                  세액
                </th>
                <th className="border border-gray-300 bg-gray-100 p-1 text-right align-middle h-8">
                  공급가액
                </th>
                <th className="border border-gray-300 bg-gray-100 p-1 text-right align-middle h-8">
                  금액
                </th>
                <th className="border border-gray-300 bg-gray-100 p-1 text-left align-middle h-8">
                  비고
                </th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-1 text-center align-middle h-8">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 p-1 align-middle h-8">
                    {item.itemName}
                  </td>
                  <td className="border border-gray-300 p-1 align-middle h-8">
                    {item.specification || "-"}
                  </td>
                  <td className="border border-gray-300 p-1 text-right align-middle h-8">
                    {formatNumber(item.quantity)}
                  </td>
                  <td className="border border-gray-300 p-1 text-right align-middle h-8">
                    {formatCurrency(item.unitPrice)}원
                  </td>
                  <td className="border border-gray-300 p-1 text-right align-middle h-8">
                    {formatCurrency(item.taxAmount)}원
                  </td>
                  <td className="border border-gray-300 p-1 text-right align-middle h-8">
                    {formatCurrency(item.supplyAmount)}원
                  </td>
                  <td className="border border-gray-300 p-1 text-right font-medium align-middle h-8">
                    {formatCurrency(item.totalAmount)}원
                  </td>
                  <td className="border border-gray-300 p-1 align-middle h-8">
                    {item.notes || "-"}
                  </td>
                </tr>
              ))}

              {/* 빈 행 추가 (10줄 미만일 경우) */}
              {emptyRowCount > 0 &&
                Array.from({ length: emptyRowCount - 1 }).map((_, index) => (
                  <tr key={`empty-${index}`}>
                    <td className="border border-gray-300 p-1 text-center align-middle h-8">
                      {sale.items.length + index + 1}
                    </td>
                    <td className="border border-gray-300 p-1 align-middle h-8">
                      &nbsp;
                    </td>
                    <td className="border border-gray-300 p-1 align-middle h-8">
                      &nbsp;
                    </td>
                    <td className="border border-gray-300 p-1 align-middle h-8">
                      &nbsp;
                    </td>
                    <td className="border border-gray-300 p-1 align-middle h-8">
                      &nbsp;
                    </td>
                    <td className="border border-gray-300 p-1 align-middle h-8">
                      &nbsp;
                    </td>
                    <td className="border border-gray-300 p-1 align-middle h-8">
                      &nbsp;
                    </td>
                    <td className="border border-gray-300 p-1 align-middle h-8">
                      &nbsp;
                    </td>
                    <td className="border border-gray-300 p-1 align-middle h-8">
                      &nbsp;
                    </td>
                  </tr>
                ))}

              {/* "이하여백" 행 추가 (10줄 미만일 경우) */}
              {emptyRowCount > 0 && (
                <tr>
                  <td className="border border-gray-300 p-1 text-center align-middle h-8">
                    {10}
                  </td>
                  <td
                    colSpan={8}
                    className="border border-gray-300 p-1 text-center align-middle font-medium text-gray-500 h-8"
                  >
                    이하여백
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan={5}
                  className="border border-gray-300 bg-gray-100 p-1 text-right font-semibold align-middle h-8"
                >
                  합계
                </td>
                <td className="border border-gray-300 p-1 text-right align-middle h-8">
                  {formatCurrency(sale.amounts.taxAmount)}원
                </td>
                <td className="border border-gray-300 p-1 text-right align-middle h-8">
                  {formatCurrency(sale.amounts.supplyAmount)}원
                </td>
                <td className="border border-gray-300 p-1 text-right font-bold align-middle h-8">
                  {formatCurrency(sale.amounts.totalAmount)}원
                </td>
                <td className="border border-gray-300 p-1 align-middle h-8"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 메모 */}
        {sale.notes && (
          <div className="mb-4">
            <table className="w-full border-collapse text-xs">
              <tbody>
                <tr>
                  <td className="border border-gray-300 bg-gray-100 font-semibold p-1 w-24 align-middle">
                    비고
                  </td>
                  <td className="border border-gray-300 p-1 align-middle">
                    <p className="whitespace-pre-line">{sale.notes}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 인감 부분 - 심플한 디자인 */}
        <div className="mb-4 mt-8">
          <table className="w-full border-collapse text-xs">
            <tbody>
              <tr>
                <td className="p-1 w-1/2 align-middle">
                  <div className="text-center">
                    <p className="font-semibold mb-2">공급자 확인</p>
                    <div className="border border-gray-300 h-24 mx-auto flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-gray-500 mb-1">서명/인감</p>
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
                            <span className="text-gray-400">직인생략</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="mt-2">{companyInfo.name}</p>
                  </div>
                </td>
                <td className="p-1 w-1/2 align-middle">
                  <div className="text-center">
                    <p className="font-semibold mb-2">공급받는자 확인</p>
                    <div className="border border-gray-300 h-24 mx-auto flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-gray-500 mb-1">서명 날인</p>
                        <div className="w-16 h-16 mx-auto border border-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-400">서명/인감</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-2">{sale.customer?.name || "개인"}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 푸터 */}
        <div className="text-center text-gray-500 text-[10px] mt-4 pt-2 border-t border-gray-300">
          <p>본 거래명세서는 전자적으로 발행된 문서로 법적 효력을 가집니다.</p>
          <p>
            © {new Date().getFullYear()} {companyInfo.name}. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
});

SimpleInvoiceTemplate.displayName = "SimpleInvoiceTemplate";

export default SimpleInvoiceTemplate;
