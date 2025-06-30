import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/common/Button";
import { formatCurrency } from "../../../utils/numberUtils";
import {
  FiEdit2,
  FiArrowLeft,
  FiPrinter,
  FiDownload,
  FiUser,
  FiCreditCard,
  FiPackage,
  FiFileText,
  FiCalendar,
  FiPhone,
  FiMail,
  FiTruck,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAlertCircle,
} from "react-icons/fi";

const SalesDetailView = ({ sale }) => {
  const handlePrint = () => {
    window.print();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FiCheckCircle className="text-green-500" />;
      case "pending":
        return <FiClock className="text-yellow-500" />;
      case "cancelled":
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiAlertCircle className="text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "완료";
      case "pending":
        return "대기중";
      case "cancelled":
        return "취소됨";
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/sales">
            <Button variant="outline" className="mr-4">
              <FiArrowLeft className="mr-2 h-4 w-4" />
              목록으로
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">매출 상세 정보</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <FiPrinter className="mr-2 h-4 w-4" />
            인쇄
          </Button>
          <Button variant="outline">
            <FiDownload className="mr-2 h-4 w-4" />
            명세서
          </Button>
          <Link to={`/sales/edit/${sale.id}`}>
            <Button>
              <FiEdit2 className="mr-2 h-4 w-4" />
              수정
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-4">
                <FiUser className="mr-2 h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold">고객 정보</h2>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="text-gray-500">고객명:</span>{" "}
                  {sale.customerName}
                </p>
                <p>
                  <span className="text-gray-500">연락처:</span>{" "}
                  {sale.contactPerson?.phone}
                </p>
                <p>
                  <span className="text-gray-500">이메일:</span>{" "}
                  {sale.contactPerson?.email}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center mb-4">
                <FiCreditCard className="mr-2 h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold">결제 정보</h2>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="text-gray-500">결제 상태:</span>{" "}
                  <span className="flex items-center">
                    {getStatusIcon(sale.status)}
                    <span className="ml-1">{getStatusText(sale.status)}</span>
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">결제 방법:</span>{" "}
                  {sale.paymentMethod}
                </p>
                <p>
                  <span className="text-gray-500">배송 방법:</span>{" "}
                  {sale.deliveryMethod}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center mb-4">
              <FiPackage className="mr-2 h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold">판매 항목</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      품목
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      수량
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      단가
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      금액
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sale.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-4 text-right text-sm font-medium text-gray-900"
                    >
                      합계
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(sale.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {sale.notes && (
            <div className="mt-8">
              <div className="flex items-center mb-4">
                <FiFileText className="mr-2 h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold">메모</h2>
              </div>
              <p className="text-gray-700">{sale.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesDetailView;
