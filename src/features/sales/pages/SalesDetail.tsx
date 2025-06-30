"use client";

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getSale } from "../services/SalesService";
import type { SaleData } from "../services/SalesService";
import {
  ArrowLeft,
  Edit,
  Printer,
  Building,
  Calendar,
  CreditCard,
  FileText,
  DollarSign,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Info,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

export default function SalesDetail() {
  const { id } = useParams<{ id: string }>();
  const [sale, setSale] = useState<SaleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSale = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await getSale(id);
        setSale(data);
      } catch (error) {
        console.error("판매 정보 조회 중 오류 발생:", error);
        setError("판매 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSale();
  }, [id]);

  // 상태에 따른 배지 스타일 및 아이콘 결정
  const getStatusBadge = (status: string) => {
    let bgColor = "bg-gray-100 text-gray-800";
    let Icon = AlertCircle;

    switch (status) {
      case "completed":
        bgColor = "bg-green-100 text-green-800";
        Icon = CheckCircle;
        status = "완료";
        break;
      case "pending":
        bgColor = "bg-yellow-100 text-yellow-800";
        Icon = Clock;
        status = "대기중";
        break;
      case "cancelled":
        bgColor = "bg-red-100 text-red-800";
        Icon = XCircle;
        status = "취소됨";
        break;
      default:
        status = status || "미정";
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}
      >
        <Icon className="w-3.5 h-3.5 mr-1" />
        {status}
      </span>
    );
  };

  // 금액 포맷 함수
  const formatAmount = (amount: number) => {
    return amount.toLocaleString("ko-KR") + "원";
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

  // 타임스탬프 포맷 함수
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "-";

    // Firebase 타임스탬프 처리
    if (timestamp.toDate && typeof timestamp.toDate === "function") {
      const date = timestamp.toDate();
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // 일반 Date 객체 또는 ISO 문자열 처리
    const date = new Date(timestamp);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-500">판매 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 오류 표시
  if (error || !sale) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 text-red-700 p-4 rounded-md max-w-md">
          <h2 className="text-lg font-semibold mb-2">오류 발생</h2>
          <p>{error || "판매 정보를 찾을 수 없습니다."}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm"
          >
            이전 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 print:hidden">
        <div className="flex items-center space-x-2">
          <Link
            to="/sales"
            className="inline-flex items-center px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            목록으로
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">거래 명세서</h1>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/sales/${id}/edit`}
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            수정
          </Link>
          <Link
            to={`/sales/invoice/${id}`}
            className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            <Printer className="w-4 h-4 mr-2" />
            거래명세서 출력
          </Link>
        </div>
      </div>

      {/* 문서 컨테이너 */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden print:shadow-none print:border-none">
        {/* 문서 헤더 */}
        <div className="p-6 border-b border-gray-200 bg-white print:bg-white">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                거래 명세서
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <p className="text-gray-500 flex items-center">
                  <FileText className="w-4 h-4 mr-1.5" />
                  문서번호: {sale.documentNumber}
                </p>
                <p className="text-gray-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  발행일: {formatDate(sale.issueDate)}
                </p>
              </div>
              {sale.status && (
                <div className="mt-2">{getStatusBadge(sale.status)}</div>
              )}
            </div>
            <div className="mt-4 md:mt-0 md:text-right">
              <p className="text-gray-500 flex items-center md:justify-end">
                <CreditCard className="w-4 h-4 mr-1.5" />
                결제방법: {sale.payment?.methodText || "신용거래"}
              </p>
              <p className="text-gray-500 flex items-center md:justify-end mt-1">
                <DollarSign className="w-4 h-4 mr-1.5" />
                부가세: {sale.tax?.methodText || "부가세별도"}
              </p>
            </div>
          </div>
        </div>

        {/* 거래처 정보 - 간결하게 표시 */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center mb-2">
            <Building className="w-4 h-4 mr-2 text-blue-500" />
            <h3 className="text-sm font-medium text-gray-700">거래처 정보</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-gray-500">거래처명</p>
              <p className="font-medium">{sale.customer?.name || "미지정"}</p>
            </div>
            <div>
              <p className="text-gray-500">사업자등록번호</p>
              <p className="font-medium">
                {sale.customer?.businessNumber || "미지정"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">대표자</p>
              <p className="font-medium">
                {sale.customer?.representative || "미지정"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">담당자</p>
              <p className="font-medium">{sale.contact?.name || "미지정"}</p>
            </div>
          </div>

          {/* 주소 정보 추가 */}
          <div className="mt-3 text-xs">
            <p className="text-gray-500 flex items-center">
              <MapPin className="w-3 h-3 mr-1.5" />
              주소
            </p>
            <p className="font-medium mt-1">
              {sale.customer?.address || "미지정"}
            </p>
          </div>

          {/* 연락처 정보 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3 text-xs">
            <div>
              <p className="text-gray-500 flex items-center">
                <Phone className="w-3 h-3 mr-1.5" />
                연락처
              </p>
              <p className="font-medium">{sale.contact?.phone || "미지정"}</p>
            </div>
            <div>
              <p className="text-gray-500 flex items-center">
                <Mail className="w-3 h-3 mr-1.5" />
                이메일
              </p>
              <p className="font-medium">{sale.contact?.email || "미지정"}</p>
            </div>
          </div>
        </div>

        {/* 품목 정보 - 강조 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center mb-4">
            <Package className="w-5 h-5 mr-2 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">품목 정보</h3>
          </div>

          {/* 품목 테이블 */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    품목명
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    규격
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수량
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    단가
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    공급가액
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    세액
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    합계
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sale.items && sale.items.length > 0 ? (
                  sale.items.map((item, index) => (
                    <tr
                      key={item.id || index}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.itemName}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.specification || "-"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {item.quantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatAmount(item.unitPrice)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatAmount(item.supplyAmount)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatAmount(item.taxAmount)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {formatAmount(item.totalAmount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-4 text-center text-sm text-gray-500"
                    >
                      등록된 품목이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-blue-50">
                  <th
                    scope="row"
                    colSpan={4}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-900"
                  >
                    합계
                  </th>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {formatAmount(sale.amounts.supplyAmount)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {formatAmount(sale.amounts.taxAmount)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {formatAmount(sale.amounts.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 품목 메모 */}
          {sale.items && sale.items.some((item) => item.notes) && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
              <div className="flex items-center mb-2">
                <Info className="w-4 h-4 mr-1.5 text-blue-500" />
                <p className="font-medium text-gray-700">품목 메모</p>
              </div>
              <ul className="space-y-2">
                {sale.items
                  .filter((item) => item.notes)
                  .map((item, index) => (
                    <li key={index} className="flex">
                      <span className="font-medium text-gray-700 mr-2">
                        {item.itemName}:
                      </span>
                      <span className="text-gray-600">{item.notes}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>

        {/* 금액 정보 */}
        <div className="p-6 border-b border-gray-200 bg-gray-50 print:bg-white">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-blue-500" />
            금액 정보
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">공급가액</p>
              <p className="text-xl font-semibold">
                {formatAmount(sale.amounts.supplyAmount)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">부가세</p>
              <p className="text-xl font-semibold">
                {formatAmount(sale.amounts.taxAmount)}
              </p>
            </div>
            <div className="bg-blue-100 p-4 rounded-md border border-blue-200 shadow-sm">
              <p className="text-sm text-blue-600 mb-1">총 금액</p>
              <p className="text-2xl font-bold text-blue-700">
                {formatAmount(sale.amounts.totalAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* 메모 및 추가 정보 */}
        <div className="p-6">
          <h3 className="text-sm font-medium mb-3 flex items-center text-gray-700">
            <FileText className="w-4 h-4 mr-2 text-blue-500" />
            메모 및 추가 정보
          </h3>

          {sale.notes && (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
              <p className="text-sm whitespace-pre-line">{sale.notes}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-gray-500">
            <div>
              <p>작성일: {formatTimestamp(sale.createdAt)}</p>
            </div>
            <div>
              <p>최종 수정일: {formatTimestamp(sale.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
