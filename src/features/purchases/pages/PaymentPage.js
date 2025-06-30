"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import { toast } from "react-toastify";
import purchaseService from "../services/purchaseService";

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    paymentStatus: "미지급",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentAmount: 0,
    paymentMethod: "계좌이체",
    notes: "",
  });

  const fetchPurchaseData = useCallback(async () => {
    try {
      setLoading(true);
      const purchaseData = await purchaseService.fetchPurchaseById(id);
      setPurchase(purchaseData);

      // 폼 데이터 초기화
      setFormData({
        paymentStatus: purchaseData.paymentStatus || "미지급",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentAmount: purchaseData.total || 0,
        paymentMethod: purchaseData.paymentMethod || "계좌이체",
        notes: "",
      });
    } catch (error) {
      console.error("Error fetching purchase data: ", error);
      toast.error("매입 정보를 불러오는데 실패했습니다.");
      navigate("/purchases");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchPurchaseData();
  }, [fetchPurchaseData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 결제 금액이 총액과 같으면 완료, 적으면 부분지급
      const paymentStatus =
        Number.parseFloat(formData.paymentAmount) >=
        Number.parseFloat(purchase.total)
          ? "완료"
          : Number.parseFloat(formData.paymentAmount) > 0
          ? "부분지급"
          : "미지급";

      await purchaseService.updatePaymentStatus(
        id,
        paymentStatus,
        formData.paymentDate
      );

      // 결제 이력 추가 (실제로는 별도의 컬렉션에 저장)
      // await addPaymentHistory({
      //   purchaseId: id,
      //   amount: parseFloat(formData.paymentAmount),
      //   method: formData.paymentMethod,
      //   date: new Date(formData.paymentDate),
      //   notes: formData.notes,
      // });

      toast.success("결제 정보가 업데이트되었습니다.");
      navigate(`/purchases/${id}`);
    } catch (error) {
      console.error("Error updating payment status: ", error);
      toast.error("결제 정보 업데이트에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
          매입 정보를 찾을 수 없습니다.
        </h2>
        <Link
          to="/purchases"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <FiArrowLeft className="mr-2" /> 매입 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link
          to={`/purchases/${id}`}
          className="mr-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <FiArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          매입금 지불 관리
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                매입 정보
              </h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    공급업체
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {purchase.supplier}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    날짜
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {purchase.date}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    총액
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    ₩{purchase.total?.toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    현재 결제 상태
                  </dt>
                  <dd className="text-sm">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        purchase.paymentStatus === "완료"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : purchase.paymentStatus === "부분지급"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {purchase.paymentStatus || "미지급"}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                품목 정보
              </h3>
              <div className="space-y-2">
                {purchase.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {item.name} ({item.quantity}개)
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      ₩{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              결제 정보 입력
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    결제 상태
                  </label>
                  <select
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="미지급">미지급</option>
                    <option value="부분지급">부분지급</option>
                    <option value="완료">완료</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    결제 날짜
                  </label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    결제 금액
                  </label>
                  <input
                    type="number"
                    name="paymentAmount"
                    value={formData.paymentAmount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="0"
                    max={purchase.total}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    결제 방법
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="현금">현금</option>
                    <option value="카드">카드</option>
                    <option value="계좌이체">계좌이체</option>
                    <option value="어음">어음</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    비고
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  ></textarea>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiSave className="mr-2 -ml-1 h-5 w-5" />
                  결제 정보 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
