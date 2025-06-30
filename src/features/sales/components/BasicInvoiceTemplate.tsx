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

interface BasicInvoiceTemplateProps {
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

const BasicInvoiceTemplate = forwardRef<
  HTMLDivElement,
  BasicInvoiceTemplateProps
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
        {/* 매우 기본적인 헤더 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold border-b-2 border-t-2 border-black py-2 mb-2">
            거래명세서
          </h1>
          <div className="flex justify-between text-sm">
            <div>문서번호: {sale.documentNumber || "-"}</div>
            <div>발행일: {formatDate(sale.issueDate)}</div>
          </div>
        </div>

        {/* 공급자/공급받는자 정보 - 가장 기본적인 테이블 */}
        <div className="mb-6">
          <table className="w-full border-collapse text-xs">
            <tbody>
              <tr>
                <td className="border border-black bg-gray-100 font-semibold p-1 w-20 text-center align-middle">
                  공급자
                </td>
                <td
                  className="border border-black p-1 align-middle"
                  colSpan={3}
                >
                  {companyInfo.name} (사업자번호: {companyInfo.businessNumber})
                </td>
              </tr>
              <tr>
                <td className="border border-black bg-gray-100 font-semibold p-1 text-center align-middle">
                  주소
                </td>
                <td
                  className="border border-black p-1 align-middle"
                  colSpan={3}
                >
                  {companyInfo.address}
                </td>
              </tr>
              <tr>
                <td className="border border-black bg-gray-100 font-semibold p-1 text-center align-middle">
                  연락처
                </td>
                <td className="border border-black p-1 align-middle">
                  {companyInfo.phone}
                </td>
                <td className="border border-black bg-gray-100 font-semibold p-1 w-20 text-center align-middle">
                  이메일
                </td>
                <td className="border border-black p-1 align-middle">
                  {companyInfo.email}
                </td>
              </tr>
              <tr>
                <td className="border border-black bg-gray-100 font-semibold p-1 text-center align-middle">
                  공급받는자
                </td>
                <td
                  className="border border-black p-1 align-middle"
                  colSpan={3}
                >
                  {sale.customer?.name || "개인"}{" "}
                  {sale.customer?.businessNumber
                    ? `(사업자번호: ${sale.customer.businessNumber})`
                    : ""}
                </td>
              </tr>
              <tr>
                <td className="border border-black bg-gray-100 font-semibold p-1 text-center align-middle">
                  주소
                </td>
                <td
                  className="border border-black p-1 align-middle"
                  colSpan={3}
                >
                  {sale.customer?.address || "-"}
                </td>
              </tr>
              <tr>
                <td className="border border-black bg-gray-100 font-semibold p-1 text-center align-middle">
                  담당자
                </td>
                <td className="border border-black p-1 align-middle">
                  {sale.contact?.name || "-"}
                </td>
                <td className="border border-black bg-gray-100 font-semibold p-1 text-center align-middle">
                  이메일
                </td>
                <td className="border border-black p-1 align-middle">
                  {sale.contact?.email || "-"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 품목 테이블 - 매우 기본적인 디자인 */}
        <div className="mb-6">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="border border-black bg-gray-100 p-1 text-center align-middle h-8">
                  No.
                </th>
                <th className="border border-black bg-gray-100 p-1 text-center align-middle h-8">
                  품목
                </th>
                <th className="border border-black bg-gray-100 p-1 text-center align-middle h-8">
                  규격
                </th>
                <th className="border border-black bg-gray-100 p-1 text-center align-middle h-8">
                  수량
                </th>
                <th className="border border-black bg-gray-100 p-1 text-center align-middle h-8">
                  단가
                </th>
                <th className="border border-black bg-gray-100 p-1 text-center align-middle h-8">
                  세액
                </th>
                <th className="border border-black bg-gray-100 p-1 text-center align-middle h-8">
                  공급가액
                </th>
                <th className="border border-black bg-gray-100 p-1 text-center align-middle h-8">
                  금액
                </th>
                <th className="border border-black bg-gray-100 p-1 text-center align-middle h-8">
                  비고
                </th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-black p-1 text-center align-middle h-8">
                    {index + 1}
                  </td>
                  <td className="border border-black p-1 align-middle h-8">
                    {item.itemName}
                  </td>
                  <td className="border border-black p-1 align-middle h-8">
                    {item.specification || "-"}
                  </td>
                  <td className="border border-black p-1 text-right align-middle h-8">
                    {formatNumber(item.quantity)}
                  </td>
                  <td className="border border-black p-1 text-right align-middle h-8">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="border border-black p-1 text-right align-middle h-8">
                    {formatCurrency(item.taxAmount)}
                  </td>
                  <td className="border border-black p-1 text-right align-middle h-8">
                    {formatCurrency(item.supplyAmount)}
                  </td>
                  <td className="border border-black p-1 text-right font-medium align-middle h-8">
                    {formatCurrency(item.totalAmount)}
                  </td>
                  <td className="border border-black p-1 align-middle h-8">
                    {item.notes || "-"}
                  </td>
                </tr>
              ))}

              {/* 빈 행 추가 (10줄 미만일 경우) */}
              {emptyRowCount > 0 &&
                Array.from({ length: emptyRowCount - 1 }).map((_, index) => (
                  <tr key={`empty-${index}`}>
                    <td className="border border-black p-1 text-center align-middle h-8">
                      {sale.items.length + index + 1}
                    </td>
                    <td className="border border-black p-1 align-middle h-8">
                      &nbsp;
                    </td>
                    <td className="border border-black p-1 align-middle h-8">
                      &nbsp;
                    </td>
                    <td className="border border-black p-1 align-middle h-8">
                      &nbsp;
                    </td>
                    <td className="border border-black p-1 align-middle h-8">
                      &nbsp;
                    </td>
                    <td className="border border-black p-1 align-middle h-8">
                      &nbsp;
                    </td>
                    <td className="border border-black p-1 align-middle h-8">
                      &nbsp;
                    </td>
                    <td className="border border-black p-1 align-middle h-8">
                      &nbsp;
                    </td>
                    <td className="border border-black p-1 align-middle h-8">
                      &nbsp;
                    </td>
                  </tr>
                ))}

              {/* "이하여백" 행 추가 (10줄 미만일 경우) */}
              {emptyRowCount > 0 && (
                <tr>
                  <td className="border border-black p-1 text-center align-middle h-8">
                    {10}
                  </td>
                  <td
                    colSpan={8}
                    className="border border-black p-1 text-center align-middle font-medium text-gray-500 h-8"
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
                  className="border border-black bg-gray-100 p-1 text-center font-semibold align-middle h-8"
                >
                  합계
                </td>
                <td className="border border-black p-1 text-right align-middle h-8">
                  {formatCurrency(sale.amounts.taxAmount)}
                </td>
                <td className="border border-black p-1 text-right align-middle h-8">
                  {formatCurrency(sale.amounts.supplyAmount)}
                </td>
                <td className="border border-black p-1 text-right font-bold align-middle h-8">
                  {formatCurrency(sale.amounts.totalAmount)}
                </td>
                <td className="border border-black p-1 align-middle h-8"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 메모 */}
        {sale.notes && (
          <div className="mb-6">
            <table className="w-full border-collapse text-xs">
              <tbody>
                <tr>
                  <td className="border border-black bg-gray-100 font-semibold p-1 w-20 text-center align-middle">
                    비고
                  </td>
                  <td className="border border-black p-1 align-middle">
                    <p className="whitespace-pre-line">{sale.notes}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 인감 부분 - 매우 기본적인 디자인 */}
        <div className="mb-6 mt-8">
          <table className="w-full border-collapse text-xs">
            <tbody>
              <tr>
                <td className="border border-black p-1 w-1/2 text-center align-middle">
                  <p className="font-semibold mb-2">공급자 확인</p>
                  <div className="h-20 flex items-center justify-center">
                    <div className="text-center">
                      <p className="mb-1">서명/인감</p>
                      <div className="w-16 h-16 mx-auto border border-black rounded-full flex items-center justify-center relative">
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
                          <span>인</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="mt-2">{companyInfo.name}</p>
                </td>
                <td className="border border-black p-1 w-1/2 text-center align-middle">
                  <p className="font-semibold mb-2">공급받는자 확인</p>
                  <div className="h-20 flex items-center justify-center">
                    <div className="text-center">
                      <p className="mb-1">서명 날인</p>
                      <div className="w-16 h-16 mx-auto border border-black rounded-full flex items-center justify-center">
                        <span>인</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2">{sale.customer?.name || "개인"}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 푸터 */}
        <div className="text-center text-[10px] mt-4 pt-2 border-t border-black">
          <p>본 거래명세서는 전자적으로 발행된 문서로 법적 효력을 가집니다.</p>
          <p>
            © {new Date().getFullYear()} {companyInfo.name}
          </p>
        </div>
      </div>
    </div>
  );
});

BasicInvoiceTemplate.displayName = "BasicInvoiceTemplate";

export default BasicInvoiceTemplate;
