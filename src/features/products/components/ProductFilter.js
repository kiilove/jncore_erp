"use client"

import { useState, useEffect } from "react"
import { FiSearch } from "react-icons/fi"
import Input from "../../../components/common/Input"
import Select from "../../../components/common/Select"

const ProductFilter = ({ filters, onFilterChange }) => {
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState(filters.search || "")

  // 카테고리 목록 가져오기 (실제로는 API 호출 등으로 대체)
  useEffect(() => {
    // 예시 카테고리 데이터
    const sampleCategories = [
      { value: "", label: "모든 카테고리" },
      { value: "컴퓨터", label: "컴퓨터" },
      { value: "노트북", label: "노트북" },
      { value: "모니터", label: "모니터" },
      { value: "주변기기", label: "주변기기" },
      { value: "부품", label: "부품" },
    ]
    setCategories(sampleCategories)
  }, [])

  const stockStatusOptions = [
    { value: "all", label: "모든 재고 상태" },
    { value: "inStock", label: "재고 있음" },
    { value: "lowStock", label: "재고 부족" },
    { value: "outOfStock", label: "품절" },
  ]

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    onFilterChange({ search })
  }

  const handleCategoryChange = (e) => {
    onFilterChange({ category: e.target.value })
  }

  const handleStockStatusChange = (e) => {
    onFilterChange({ stockStatus: e.target.value })
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="제품명 또는 코드로 검색"
            value={search}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          검색
        </button>
      </form>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/2">
          <Select value={filters.category} onChange={handleCategoryChange} options={categories} />
        </div>
        <div className="w-full sm:w-1/2">
          <Select value={filters.stockStatus} onChange={handleStockStatusChange} options={stockStatusOptions} />
        </div>
      </div>
    </div>
  )
}

export default ProductFilter
