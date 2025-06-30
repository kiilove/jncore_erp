"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { FiArrowLeft, FiEdit2, FiTrash2, FiFileText, FiDollarSign, FiPlus } from "react-icons/fi"
import { toast } from "react-toastify"
import supplierService from "../services/supplierService"

const SupplierDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [supplier, setSupplier] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("info")

  useEffect(() => {
    fetchSupplierData()
  }, [id])

  const fetchSupplierData = async () => {
    try {
      setLoading(true)

      // 공급업체 정보 가져오기
      const supplierData = await supplierService.fetchSupplierById(id)
      setSupplier(supplierData)

      // 거래 내역 가져오기
      const transactionsData = await supplierService.fetchSupplierTransactions(id)
      setTransactions(transactionsData)

      // 통계 가져오기
      const statsData = await supplierService.fetchSupplierStats(id)
      setStats(statsData)
    } catch (error) {
      console.error("Error fetching supplier data: ", error)
      toast.error("공급업체 정보를 불러오는데 실패했습니다.")
      navigate("/suppliers")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("정말로 이 공급업체를 삭제하시겠습니까?")) {
      try {
        await supplierService.deleteSupplier(id)
        toast.success("공급업체가 삭제되었습니다.")
        navigate("/suppliers")
      } catch (error) {
        console.error("Error deleting supplier: ", error)
        if (error.message.includes("existing purchase records")) {
          toast.error("이 공급업체와 연결된 매입 기록이 있어 삭제할 수 없습니다.")
        } else {
          toast.error("공급업체 삭제에 실패했습니다.")
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">공급업체를 찾을 수 없습니다.</h2>
        <Link
          to="/suppliers"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <FiArrowLeft className="mr-2" /> 공급업체 목록으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          <Link
            to="/suppliers"
            className="mr-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{supplier.name}</h1>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Link
            to={`/suppliers/edit/${id}`}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <FiEdit2 className="mr-2" />
            수정
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            <FiTrash2 className="mr-2" />
            삭제
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("info")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "info"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              기본 정보
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "transactions"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              거래 내역
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "stats"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              통계
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "info" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">연락처 정보</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">담당자</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{supplier.contactPerson || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">이메일</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{supplier.email || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">연락처</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{supplier.phone || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">주소</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{supplier.address || "-"}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">사업자 정보</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">사업자등록번호</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{supplier.businessNumber || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">카테고리</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{supplier.category || "일반"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">결제 조건</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {supplier.paymentTerms === "0" ? "즉시 결제" : `${supplier.paymentTerms}일`}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">등록일</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString() : "-"}
                    </dd>
                  </div>
                </dl>
              </div>
              {supplier.notes && (
                <div className="col-span-1 md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">비고</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{supplier.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "transactions" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">거래 내역</h3>
                <Link
                  to="/purchases/new"
                  state={{ supplierId: id, supplierName: supplier.name }}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <FiPlus className="mr-1" /> 새 매입 등록
                </Link>
              </div>

              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          날짜
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          품목
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          총액
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          결제 상태
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          작업
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {transactions.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {transaction.date}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                            {transaction.items.map((item, index) => (
                              <div key={index}>
                                {item.name} ({item.quantity}개)
                              </div>
                            ))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            ₩{transaction.total?.toLocaleString() || "0"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                transaction.paymentStatus === "완료"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : transaction.paymentStatus === "부분지급"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}
                            >
                              {transaction.paymentStatus || "미지급"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              to={`/purchases/${transaction.id}`}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                            >
                              <FiFileText className="h-5 w-5" />
                            </Link>
                            {transaction.paymentStatus !== "완료" && (
                              <Link
                                to={`/purchases/payment/${transaction.id}`}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              >
                                <FiDollarSign className="h-5 w-5" />
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  이 공급업체와의 거래 내역이 없습니다.
                </div>
              )}
            </div>
          )}

          {activeTab === "stats" && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">거래 통계</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-700 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-300 truncate">총 거래액</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                        ₩{stats.totalAmount?.toLocaleString() || "0"}
                      </dd>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-300 truncate">거래 횟수</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                        {stats.transactionCount || 0}회
                      </dd>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-300 truncate">미지급액</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                        ₩{stats.unpaidAmount?.toLocaleString() || "0"}
                      </dd>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-300 truncate">최근 거래일</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                        {stats.lastTransactionDate || "-"}
                      </dd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SupplierDetailPage
