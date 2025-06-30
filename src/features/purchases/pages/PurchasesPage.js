"use client"

import { useState, useEffect } from "react"
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiDollarSign, FiFileText } from "react-icons/fi"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import purchaseService from "../services/purchaseService"
import supplierService from "../../suppliers/services/supplierService"

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPurchase, setCurrentPurchase] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterSupplier, setFilterSupplier] = useState("")
  const [filterDateRange, setFilterDateRange] = useState({
    startDate: "",
    endDate: "",
  })

  // Form state
  const [formData, setFormData] = useState({
    supplier: "",
    supplierId: "",
    date: new Date().toISOString().split("T")[0],
    items: [{ name: "", productId: "", quantity: 1, price: 0 }],
    paymentMethod: "현금",
    status: "완료",
    paymentStatus: "미지급",
    paymentDueDate: "",
    notes: "",
  })

  useEffect(() => {
    fetchPurchases()
    fetchSuppliers()
  }, [])

  const fetchPurchases = async () => {
    try {
      setLoading(true)

      // 필터 적용
      const filters = {}
      if (filterStatus) filters.status = filterStatus
      if (filterSupplier) filters.supplier = filterSupplier
      if (filterDateRange.startDate && filterDateRange.endDate) {
        filters.startDate = filterDateRange.startDate
        filters.endDate = filterDateRange.endDate
      }

      const purchasesList = await purchaseService.fetchPurchases(filters)

      // 검색어 필터링 (클라이언트 측)
      const filteredPurchases = searchTerm
        ? purchasesList.filter(
            (purchase) =>
              purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
              purchase.items.some((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase())),
          )
        : purchasesList

      setPurchases(filteredPurchases)
    } catch (error) {
      console.error("Error fetching purchases: ", error)
      toast.error("매입 목록을 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const suppliersList = await supplierService.fetchSuppliers()
      setSuppliers(suppliersList)
    } catch (error) {
      console.error("Error fetching suppliers: ", error)
    }
  }

  const handleOpenModal = (purchase = null) => {
    if (purchase) {
      setCurrentPurchase(purchase)
      setFormData({
        supplier: purchase.supplier || "",
        supplierId: purchase.supplierId || "",
        date: purchase.date || new Date().toISOString().split("T")[0],
        items: purchase.items || [{ name: "", productId: "", quantity: 1, price: 0 }],
        paymentMethod: purchase.paymentMethod || "현금",
        status: purchase.status || "완료",
        paymentStatus: purchase.paymentStatus || "미지급",
        paymentDueDate: purchase.paymentDueDate || "",
        notes: purchase.notes || "",
      })
    } else {
      setCurrentPurchase(null)
      setFormData({
        supplier: "",
        supplierId: "",
        date: new Date().toISOString().split("T")[0],
        items: [{ name: "", productId: "", quantity: 1, price: 0 }],
        paymentMethod: "현금",
        status: "완료",
        paymentStatus: "미지급",
        paymentDueDate: "",
        notes: "",
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentPurchase(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name === "supplier") {
      // 공급업체 선택 시 ID도 함께 설정
      const selectedSupplier = suppliers.find((s) => s.name === value)
      setFormData({
        ...formData,
        [name]: value,
        supplierId: selectedSupplier ? selectedSupplier.id : "",
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items]
    updatedItems[index][field] = value
    setFormData({ ...formData, items: updatedItems })
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: "", productId: "", quantity: 1, price: 0 }],
    })
  }

  const removeItem = (index) => {
    const updatedItems = [...formData.items]
    updatedItems.splice(index, 1)
    setFormData({ ...formData, items: updatedItems })
  }

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + item.quantity * item.price
    }, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (currentPurchase) {
        // Update existing purchase
        await purchaseService.updatePurchase(currentPurchase.id, formData)
        toast.success("매입 정보가 수정되었습니다.")
      } else {
        // Add new purchase
        await purchaseService.addPurchase(formData)
        toast.success("새 매입이 등록되었습니다.")
      }

      handleCloseModal()
      fetchPurchases()
    } catch (error) {
      console.error("Error saving purchase: ", error)
      toast.error("매입 저장에 실패했습니다.")
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("정말로 이 매입 기록을 삭제하시겠습니까?")) {
      try {
        await purchaseService.deletePurchase(id)
        toast.success("매입 기록이 삭제되었습니다.")
        fetchPurchases()
      } catch (error) {
        console.error("Error deleting purchase: ", error)
        toast.error("매입 삭제에 실패했습니다.")
      }
    }
  }

  const handleUpdatePaymentStatus = async (purchaseId, newStatus) => {
    try {
      await purchaseService.updatePaymentStatus(purchaseId, newStatus, new Date().toISOString().split("T")[0])
      toast.success("결제 상태가 업데이트되었습니다.")
      fetchPurchases()
    } catch (error) {
      console.error("Error updating payment status: ", error)
      toast.error("결제 상태 업데이트에 실패했습니다.")
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target

    if (name === "startDate" || name === "endDate") {
      setFilterDateRange({
        ...filterDateRange,
        [name]: value,
      })
    } else if (name === "status") {
      setFilterStatus(value)
    } else if (name === "supplier") {
      setFilterSupplier(value)
    }
  }

  const applyFilters = () => {
    fetchPurchases()
  }

  const resetFilters = () => {
    setFilterStatus("")
    setFilterSupplier("")
    setFilterDateRange({ startDate: "", endDate: "" })
    setSearchTerm("")
    fetchPurchases()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">매입관리</h1>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="검색..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && fetchPurchases()}
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <FiPlus className="mr-2" />새 매입 등록
          </button>
        </div>
      </div>

      {/* 필터 섹션 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center mb-4">
          <FiFilter className="mr-2 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">필터</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">상태</label>
            <select
              name="status"
              value={filterStatus}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">모든 상태</option>
              <option value="완료">완료</option>
              <option value="진행중">진행중</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">공급업체</label>
            <select
              name="supplier"
              value={filterSupplier}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">모든 공급업체</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.name}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">시작일</label>
            <input
              type="date"
              name="startDate"
              value={filterDateRange.startDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">종료일</label>
            <input
              type="date"
              name="endDate"
              value={filterDateRange.endDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={resetFilters}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            초기화
          </button>
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
          >
            적용
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    날짜
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    공급업체
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    품목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    총액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    상태
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
                {purchases.length > 0 ? (
                  purchases.map((purchase) => (
                    <tr
                      key={purchase.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {purchase.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {purchase.supplier}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {purchase.items.map((item, index) => (
                          <div key={index}>
                            {item.name} ({item.quantity}개)
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        ₩{purchase.total?.toLocaleString() || "0"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            purchase.status === "완료"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                        >
                          {purchase.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            purchase.paymentStatus === "완료"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : purchase.paymentStatus === "부분지급"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {purchase.paymentStatus || "미지급"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/purchases/${purchase.id}`}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-3"
                        >
                          <FiFileText className="h-5 w-5" />
                        </Link>
                        {purchase.paymentStatus !== "완료" && (
                          <button
                            onClick={() => handleUpdatePaymentStatus(purchase.id, "완료")}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                          >
                            <FiDollarSign className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenModal(purchase)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                        >
                          <FiEdit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(purchase.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      매입 기록이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Purchase Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full md:max-w-2xl">
              <form onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                    {currentPurchase ? "매입 정보 수정" : "새 매입 등록"}
                  </h3>

                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        공급업체
                      </label>
                      <select
                        name="supplier"
                        value={formData.supplier}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      >
                        <option value="">공급업체 선택</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier.id} value={supplier.name}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">날짜</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">상태</label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="완료">완료</option>
                          <option value="진행중">진행중</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          결제 예정일
                        </label>
                        <input
                          type="date"
                          name="paymentDueDate"
                          value={formData.paymentDueDate}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">품목</label>
                      <button
                        type="button"
                        onClick={addItem}
                        className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        <FiPlus className="mr-1" /> 품목 추가
                      </button>
                    </div>

                    {formData.items.map((item, index) => (
                      <div key={index} className="flex flex-wrap -mx-2 mb-2">
                        <div className="px-2 w-full sm:w-5/12">
                          <input
                            type="text"
                            placeholder="품목명"
                            value={item.name}
                            onChange={(e) => handleItemChange(index, "name", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                          />
                        </div>
                        <div className="px-2 w-full sm:w-2/12 mt-2 sm:mt-0">
                          <input
                            type="number"
                            placeholder="수량"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", Number.parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            min="1"
                            required
                          />
                        </div>
                        <div className="px-2 w-full sm:w-4/12 mt-2 sm:mt-0">
                          <input
                            type="number"
                            placeholder="단가"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, "price", Number.parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            min="0"
                            required
                          />
                        </div>
                        <div className="px-2 w-full sm:w-1/12 flex items-center justify-center mt-2 sm:mt-0">
                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="mt-4 text-right">
                      <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                        총액: ₩{calculateTotal().toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">비고</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-800 dark:text-gray-300 dark:border-gray-500"
                    onClick={handleCloseModal}
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PurchasesPage
