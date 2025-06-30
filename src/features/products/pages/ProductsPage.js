"use client"

import { useState, useEffect } from "react"
import { getAllProducts, deleteProduct, addProduct } from "../services/productService"
import { FiPlus, FiEdit2, FiTrash2, FiAlertCircle } from "react-icons/fi"
import ProductForm from "../components/ProductForm"
import ProductFilter from "../components/ProductFilter"
import ExcelImportExport from "../components/ExcelImportExport"
// 기존 import 문에 추가
import BarcodeScanner from "../components/BarcodeScanner"

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null)
  const [filters, setFilters] = useState({
    category: "",
    search: "",
    stockStatus: "all", // all, inStock, lowStock, outOfStock
  })
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importData, setImportData] = useState([])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const productsData = await getAllProducts()
      setProducts(productsData)
    } catch (error) {
      console.error("Error fetching products:", error)
      alert("제품 목록을 불러오는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (product = null) => {
    setCurrentProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setCurrentProduct(null)
    setIsModalOpen(false)
  }

  const handleSaveProduct = async () => {
    await fetchProducts()
    handleCloseModal()
    alert(currentProduct ? "제품이 수정되었습니다." : "새 제품이 등록되었습니다.")
  }

  const handleDeleteProduct = async (id) => {
    if (window.confirm("정말로 이 제품을 삭제하시겠습니까?")) {
      try {
        await deleteProduct(id)
        await fetchProducts()
        alert("제품이 삭제되었습니다.")
      } catch (error) {
        console.error("Error deleting product:", error)
        alert("제품 삭제 중 오류가 발생했습니다.")
      }
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters })
  }

  const handleImportData = (data) => {
    setImportData(data)
    setImportModalOpen(true)
  }

  const handleConfirmImport = async () => {
    try {
      setLoading(true)

      // 각 제품 데이터 추가
      for (const product of importData) {
        await addProduct(product, "current-user-id") // 실제로는 인증된 사용자 ID 사용
      }

      alert(`${importData.length}개의 제품이 성공적으로 가져와졌습니다.`)
      setImportModalOpen(false)
      setImportData([])
      await fetchProducts()
    } catch (error) {
      console.error("Error importing products:", error)
      alert("제품 가져오기 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((product) => {
    // 카테고리 필터
    if (filters.category && product.category !== filters.category) {
      return false
    }

    // 검색어 필터
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const nameMatch = product.name.toLowerCase().includes(searchLower)
      const codeMatch = product.code && product.code.toLowerCase().includes(searchLower)
      if (!nameMatch && !codeMatch) {
        return false
      }
    }

    // 재고 상태 필터
    if (filters.stockStatus !== "all") {
      const stock = product.stock || 0
      const lowStockThreshold = product.lowStockThreshold || 10

      if (filters.stockStatus === "inStock" && stock <= 0) {
        return false
      }
      if (filters.stockStatus === "lowStock" && (stock <= 0 || stock > lowStockThreshold)) {
        return false
      }
      if (filters.stockStatus === "outOfStock" && stock > 0) {
        return false
      }
    }

    return true
  })

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(value)
  }

  // Products 컴포넌트 내부에 추가 (return문 위에 추가)
  const handleBarcodeScan = async (scannedBarcode) => {
    try {
      setLoading(true)
      // const product = await findProductByBarcode(db, scannedBarcode) // db is not defined.
      const product = products.find((p) => p.barcode === scannedBarcode)

      if (product) {
        // 제품을 찾았으면 모달에서 열기
        handleOpenModal(product)
      } else {
        // 제품을 찾지 못했으면 알림
        alert(`바코드 ${scannedBarcode}에 해당하는 제품을 찾을 수 없습니다.`)
      }
    } catch (error) {
      console.error("Error handling barcode scan:", error)
      alert("바코드 스캔 처리 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">제품관리</h1>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <FiPlus className="mr-2" />새 제품 등록
          </button>
          <ExcelImportExport data={products} onImport={handleImportData} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
        <ProductFilter filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {/* return문 내부의 필터 부분 아래에 추가 (showFilters && ... 블록 아래) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-200 mt-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">바코드 스캔</h2>
        <BarcodeScanner onScan={handleBarcodeScan} disabled={loading} />
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
                    제품명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    코드
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    가격
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    재고
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const stock = product.stock || 0
                    const lowStockThreshold = product.lowStockThreshold || 10
                    const isLowStock = stock > 0 && stock <= lowStockThreshold
                    const isOutOfStock = stock <= 0

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {product.code || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {isOutOfStock ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                품절
                              </span>
                            ) : isLowStock ? (
                              <span className="flex items-center px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                <FiAlertCircle className="mr-1" />
                                {stock}개
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {stock}개
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                          >
                            <FiEdit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      등록된 제품이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {isModalOpen && (
        <ProductForm
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
          product={currentProduct}
        />
      )}

      {/* Import Confirmation Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  엑셀 데이터 가져오기 확인
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {importData.length}개의 제품 데이터를 가져오시겠습니까?
                </p>
                <div className="max-h-60 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                          제품명
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                          카테고리
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                          가격
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {importData.map((product, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {product.name}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {product.category}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {formatCurrency(product.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  가져오기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImportModalOpen(false)
                    setImportData([])
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-700"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products
