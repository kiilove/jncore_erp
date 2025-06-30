import React from "react";
import { FiCheckCircle } from "react-icons/fi";

export const formatNumber = (number) => {
  return new Intl.NumberFormat("ko-KR").format(number);
};

export const formatCurrency = (number) => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    currencyDisplay: "symbol",
  })
    .format(number)
    .replace("₩", "");
};

const InvoiceTemplate = React.forwardRef(
  (
    {
      sale,
      companyInfo,
      getPaymentMethodText,
      getStatusText,
      showAdditionalInfo = false,
    },
    ref
  ) => {
    if (!sale) return null;

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}.${String(date.getDate()).padStart(2, "0")}`;
    };

    const calculateSubtotal = () => {
      if (!sale) return 0;
      return sale.items.reduce(
        (total, item) => total + item.quantity * item.price,
        0
      );
    };

    const calculateTax = () => {
      if (sale.includeTax) {
        return Math.round(calculateSubtotal() * 0.1);
      }
      return 0;
    };

    const calculateTotal = () => {
      if (sale.includeTax) {
        return calculateSubtotal() + calculateTax();
      }
      return calculateSubtotal();
    };

    return (
      <div
        ref={ref}
        className="bg-white p-4 max-w-[210mm] mx-auto shadow-none print:shadow-none print:p-4"
        style={{
          minHeight: "297mm",
          maxHeight: "297mm",
          width: "210mm",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background watermark */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
          style={{
            backgroundImage: "url('/placeholder.png?key=ir4k2')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div className="relative z-10">
          {/* Header with gradient */}
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
                    {sale.invoiceNumber || "-"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-blue-100">발행일</div>
                  <div className="text-sm text-gray-100">
                    {formatDate(sale.date)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content grid - HORIZONTAL layout for supplier and customer */}
          <div className="flex gap-3 mb-3 print:flex print:flex-row">
            {/* Supplier Info */}
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

            {/* Customer Info */}
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
                    {sale.customerName || "개인"}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-gray-500">사업자번호</div>
                  <div className="col-span-2 text-gray-900">
                    {sale.customerBusinessNumber || "-"}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-gray-500">주소</div>
                  <div className="col-span-2 text-gray-900">
                    {sale.customerAddress || "-"}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-gray-500">배송방법</div>
                  <div className="col-span-2 text-gray-900">
                    {sale.deliveryMethod || "-"}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-gray-500">결제상태</div>
                  <div className="col-span-2 text-gray-900">
                    {sale.status === "completed" ? "결제완료" : "미결제"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
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
                        {item.productName || item.name}
                      </td>
                      <td className="py-1.5 px-2 border-b border-gray-200 text-gray-900">
                        {item.category || "-"}
                      </td>
                      <td className="py-1.5 px-2 border-b border-gray-200 text-gray-900 text-right">
                        {formatNumber(item.quantity)}
                      </td>
                      <td className="py-1.5 px-2 border-b border-gray-200 text-gray-900 text-right">
                        {formatCurrency(item.price)}원
                      </td>
                      <td className="py-1.5 px-2 border-b border-gray-200 text-gray-900 text-right">
                        {formatCurrency(item.tax)}원
                      </td>
                      <td className="py-1.5 px-2 border-b border-gray-200 text-gray-900 text-right">
                        {formatCurrency(item.netPrice)}원
                      </td>
                      <td className="py-1.5 px-2 border-b border-gray-200 text-gray-900 text-right font-medium">
                        {formatCurrency(item.total)}원
                      </td>
                      <td className="py-1.5 px-2 border-b border-gray-200 text-gray-900">
                        {item.note || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan="5"
                      className="py-1.5 px-2 border-b border-gray-200 text-gray-600 font-medium text-right"
                    >
                      합계
                    </td>
                    <td className="py-1.5 px-2 border-b border-gray-200 text-gray-900 text-right">
                      {formatCurrency(sale.taxAmount)}원
                    </td>
                    <td className="py-1.5 px-2 border-b border-gray-200 text-gray-900 text-right">
                      {formatCurrency(sale.netAmount)}원
                    </td>
                    <td className="py-1.5 px-2 border-b border-gray-200 text-gray-900 text-right font-bold">
                      {formatCurrency(sale.totalAmount)}원
                    </td>
                    <td className="py-1.5 px-2 border-b border-gray-200"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes - Compact */}
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

          {/* Footer */}
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

export default InvoiceTemplate;
