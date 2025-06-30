"use client";

import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getSales, deleteSale } from "../services/SalesService";
import type { SaleData } from "../services/SalesService";
import {
  PlusCircle,
  FileText,
  Edit,
  Trash2,
  AlertTriangle,
  Search,
  Calendar,
  Building,
  Filter,
  ChevronDown,
  ChevronUp,
  Package,
} from "lucide-react";

export default function Sales() {
  const [sales, setSales] = useState<SaleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firebaseStatus, setFirebaseStatus] = useState<
    "available" | "unavailable" | "unknown"
  >("unknown");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // 검색 및 필터링 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [customerFilter, setCustomerFilter] = useState("");

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setIsLoading(true);
        const data = await getSales();
        setSales(data);
        // If we got data without error, Firebase or mock data is working
        setFirebaseStatus("available");
      } catch (error) {
        console.error("판매 목록 조회 중 오류 발생:", error);
        setError("판매 목록을 불러오는 중 오류가 발생했습니다.");
        setFirebaseStatus("unavailable");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSales();
  }, []);

  // 행 확장/축소 토글
  const toggleRowExpand = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 판매 데이터 삭제 처리
  const handleDelete = async (id: string) => {
    if (window.confirm("이 판매 내역을 삭제하시겠습니까?")) {
      try {
        await deleteSale(id);
        // 삭제 후 목록 갱신
        setSales(sales.filter((sale) => sale.id !== id));
        alert("판매 내역이 삭제되었습니다.");
      } catch (error) {
        console.error("판매 삭제 중 오류 발생:", error);
        alert("판매 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 금액 포맷 함수
  const formatAmount = (amount: number) => {
    return amount.toLocaleString("ko-KR") + "원";
  };

  // 품목 요약 텍스트 생성
  const getItemsSummary = (items: any[]) => {
    if (!items || items.length === 0) return "품목 없음";

    if (items.length === 1) {
      return items[0].itemName;
    }

    return `${items[0].itemName} 외 ${items.length - 1}건`;
  };

  // 검색 및 필터링된 판매 목록
  const filteredSales = sales.filter((sale) => {
    // 검색어 필터링
    const searchMatch =
      searchTerm === "" ||
      sale.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.items &&
        sale.items.some((item) =>
          item.itemName?.toLowerCase().includes(searchTerm.toLowerCase())
        ));

    // 날짜 필터링
    let dateMatch = true;
    if (dateFilter.start && dateFilter.end) {
      const saleDate = new Date(sale.issueDate);
      const startDate = new Date(dateFilter.start);
      const endDate = new Date(dateFilter.end);
      endDate.setHours(23, 59, 59, 999); // 종료일 끝시간으로 설정

      dateMatch = saleDate >= startDate && saleDate <= endDate;
    } else if (dateFilter.start) {
      const saleDate = new Date(sale.issueDate);
      const startDate = new Date(dateFilter.start);
      dateMatch = saleDate >= startDate;
    } else if (dateFilter.end) {
      const saleDate = new Date(sale.issueDate);
      const endDate = new Date(dateFilter.end);
      endDate.setHours(23, 59, 59, 999);
      dateMatch = saleDate <= endDate;
    }

    // 거래처 필터링
    const customerMatch =
      customerFilter === "" || sale.customer?.name?.includes(customerFilter);

    return searchMatch && dateMatch && customerMatch;
  });

  // 필터 초기화
  const resetFilters = () => {
    setSearchTerm("");
    setDateFilter({ start: "", end: "" });
    setCustomerFilter("");
  };

  return (
    <div className="w-full">
      {/* 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-foreground">판매 목록</h1>
        <Link
          to="/sales/add"
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          판매 등록
        </Link>
      </div>

      {/* 검색 및 필터 섹션 */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="문서번호, 거래처명 또는 품목명으로 검색"
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? "필터 숨기기" : "필터 표시"}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                거래일자 시작
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dateFilter.start}
                  onChange={(e) =>
                    setDateFilter({ ...dateFilter, start: e.target.value })
                  }
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                거래일자 종료
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dateFilter.end}
                  onChange={(e) =>
                    setDateFilter({ ...dateFilter, end: e.target.value })
                  }
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                거래처
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  placeholder="거래처명 입력"
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                필터 초기화
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Firebase 연결 상태 알림 */}
      {firebaseStatus === "unavailable" && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-md">
          <p className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Firebase 연결이 불가능합니다. 목업 데이터를 사용합니다.
          </p>
          <p className="text-sm mt-1 ml-7">
            환경 변수를 설정하여 Firebase를 연결해주세요.
          </p>
        </div>
      )}

      {/* 판매 목록 테이블 */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="text-gray-500">판매 목록을 불러오는 중...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              {sales.length === 0
                ? "등록된 판매 내역이 없습니다."
                : "검색 조건에 맞는 판매 내역이 없습니다."}
            </p>
          </div>
        ) : (
          <>
            {/* 데스크톱 테이블 뷰 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-10 px-2 py-3 text-center"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      문서번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      거래처
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      거래일자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      품목
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      합계
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      결제방법
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSales.map((sale) => (
                    <>
                      <tr
                        key={sale.id}
                        className={`hover:bg-gray-50 ${
                          expandedRows[sale.id || ""] ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="px-2 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => sale.id && toggleRowExpand(sale.id)}
                            className={`p-1 rounded-full hover:bg-gray-200 ${
                              expandedRows[sale.id || ""] ? "bg-blue-100" : ""
                            }`}
                            title={
                              expandedRows[sale.id || ""]
                                ? "품목 정보 접기"
                                : "품목 정보 펼치기"
                            }
                          >
                            {expandedRows[sale.id || ""] ? (
                              <ChevronUp className="h-4 w-4 text-blue-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <Link
                            to={`/sales/${sale.id}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                          >
                            <FileText className="h-4 w-4 mr-1.5" />
                            {sale.documentNumber}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sale.customer?.name || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(sale.issueDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-1.5 text-gray-400" />
                            {sale.items && sale.items.length > 0
                              ? getItemsSummary(sale.items)
                              : "품목 없음"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          {formatAmount(sale.amounts.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {sale.payment.methodText}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          <div className="flex justify-center space-x-2">
                            <Link
                              to={`/sales/${sale.id}/edit`}
                              className="text-blue-500 hover:text-blue-700"
                              title="수정"
                            >
                              <Edit className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => sale.id && handleDelete(sale.id)}
                              className="text-red-500 hover:text-red-700"
                              title="삭제"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* 확장된 품목 정보 행 */}
                      {expandedRows[sale.id || ""] &&
                        sale.items &&
                        sale.items.length > 0 && (
                          <tr className="bg-blue-50">
                            <td colSpan={8} className="px-6 py-3">
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 border border-blue-200 rounded-md">
                                  <thead className="bg-blue-100">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        품목명
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        규격
                                      </th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        수량
                                      </th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        단가
                                      </th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        공급가액
                                      </th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        세액
                                      </th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        합계
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {sale.items.map((item, index) => (
                                      <tr
                                        key={index}
                                        className="hover:bg-gray-50"
                                      >
                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                          {item.itemName}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                          {item.specification || "-"}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                                          {item.quantity.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                                          {formatAmount(item.unitPrice)}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                                          {formatAmount(item.supplyAmount)}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                                          {formatAmount(item.taxAmount)}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                          {formatAmount(item.totalAmount)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot className="bg-blue-50">
                                    <tr>
                                      <th
                                        colSpan={4}
                                        className="px-4 py-2 text-left text-xs font-medium text-gray-700"
                                      >
                                        합계
                                      </th>
                                      <td className="px-4 py-2 text-right text-xs font-medium text-gray-700">
                                        {formatAmount(
                                          sale.amounts.supplyAmount
                                        )}
                                      </td>
                                      <td className="px-4 py-2 text-right text-xs font-medium text-gray-700">
                                        {formatAmount(sale.amounts.taxAmount)}
                                      </td>
                                      <td className="px-4 py-2 text-right text-xs font-medium text-gray-700">
                                        {formatAmount(sale.amounts.totalAmount)}
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 모바일 카드 뷰 */}
            <div className="md:hidden">
              {filteredSales.map((sale) => (
                <div key={sale.id} className="border-b border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Link
                      to={`/sales/${sale.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                    >
                      <FileText className="h-4 w-4 mr-1.5" />
                      <span className="font-medium">{sale.documentNumber}</span>
                    </Link>
                    <div className="flex space-x-2">
                      <Link
                        to={`/sales/${sale.id}/edit`}
                        className="text-blue-500 hover:text-blue-700"
                        title="수정"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => sale.id && handleDelete(sale.id)}
                        className="text-red-500 hover:text-red-700"
                        title="삭제"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                    <div>
                      <p className="text-gray-500">거래처</p>
                      <p>{sale.customer?.name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">거래일자</p>
                      <p>{formatDate(sale.issueDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">결제방법</p>
                      <p>{sale.payment.methodText}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">합계</p>
                      <p className="font-medium">
                        {formatAmount(sale.amounts.totalAmount)}
                      </p>
                    </div>
                  </div>

                  {/* 품목 정보 */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Package className="h-4 w-4 mr-1.5" />
                        <span>
                          품목:{" "}
                          {sale.items && sale.items.length > 0
                            ? getItemsSummary(sale.items)
                            : "품목 없음"}
                        </span>
                      </div>
                      <button
                        onClick={() => sale.id && toggleRowExpand(sale.id)}
                        className={`p-1 rounded-full hover:bg-gray-200 ${
                          expandedRows[sale.id || ""] ? "bg-blue-100" : ""
                        }`}
                      >
                        {expandedRows[sale.id || ""] ? (
                          <ChevronUp className="h-4 w-4 text-blue-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </div>

                    {/* 확장된 품목 정보 */}
                    {expandedRows[sale.id || ""] &&
                      sale.items &&
                      sale.items.length > 0 && (
                        <div className="mt-2 bg-blue-50 p-3 rounded-md border border-blue-200">
                          {sale.items.map((item, index) => (
                            <div
                              key={index}
                              className="py-2 border-b border-blue-100 last:border-b-0"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-sm">
                                  {item.itemName}
                                </span>
                                <span className="text-sm font-medium">
                                  {formatAmount(item.totalAmount)}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-1 text-xs text-gray-500">
                                <div>
                                  수량: {item.quantity.toLocaleString()}
                                </div>
                                <div>단가: {formatAmount(item.unitPrice)}</div>
                                <div>
                                  공급가액: {formatAmount(item.supplyAmount)}
                                </div>
                                <div>세액: {formatAmount(item.taxAmount)}</div>
                              </div>
                              {item.specification && (
                                <div className="mt-1 text-xs text-gray-500">
                                  규격: {item.specification}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
