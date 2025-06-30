"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  fetchCustomers,
  searchCustomers,
  deleteCustomer,
  updateCustomerSearchIndex,
} from "../services/customerService";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiUser,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiFilter,
  FiX,
  FiDownload,
  FiGrid,
  FiList,
} from "react-icons/fi";
import { toast } from "react-toastify";
import type {
  Customer,
  Contact,
  FilterOptions,
  PaginationState,
} from "../types";

const ITEMS_PER_PAGE = 12;

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingIndex, setIsUpdatingIndex] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    businessType: "",
    businessCategory: "",
  });
  const [pagination, setPagination] = useState<PaginationState>({
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomerList(1);
  }, []);

  const fetchCustomerList = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchCustomers(page, ITEMS_PER_PAGE);
      setCustomers(result.items); // 수정: customers -> items로 변경
      setPagination({
        totalCount: result.totalCount,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
      });
    } catch (error) {
      console.error("거래처 목록 조회 실패:", error);
      setError("거래처 목록을 불러오는 중 오류가 발생했습니다.");
      toast.error("거래처 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchCustomerList(1);
      return;
    }

    try {
      setLoading(true);
      const results = await searchCustomers(searchTerm);
      setCustomers(results);
      setPagination({
        totalCount: results.length,
        currentPage: 1,
        totalPages: 1,
      });
    } catch (error) {
      console.error("거래처 검색 실패:", error);
      setError("검색 중 오류가 발생했습니다.");
      toast.error("검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchCustomerList(page);
    }
  };

  const handleAddCustomer = () => {
    navigate("/customers/add");
  };

  const handleViewCustomer = (id: string) => {
    navigate(`/customers/${id}`);
  };

  const handleEditCustomer = (id: string) => {
    navigate(`/customers/${id}/edit`);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`정말로 "${name}" 거래처를 삭제하시겠습니까?`)) {
      try {
        await deleteCustomer(id);
        toast.success("거래처가 삭제되었습니다.");
        // 삭제 후 현재 페이지 새로고침
        fetchCustomerList(pagination.currentPage);
      } catch (error) {
        console.error("거래처 삭제 실패:", error);
        toast.error("거래처 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleUpdateSearchIndex = async () => {
    if (
      window.confirm(
        "거래처 검색 인덱스를 업데이트하시겠습니까?\n이 작업은 시간이 걸릴 수 있습니다."
      )
    ) {
      try {
        setIsUpdatingIndex(true);
        setError(null);

        const result = await updateCustomerSearchIndex();
        toast.success(
          `검색 인덱스 업데이트가 완료되었습니다. 총 ${result.count}개의 거래처가 업데이트되었습니다.`
        );

        // 현재 페이지 새로고침
        fetchCustomerList(pagination.currentPage);
      } catch (error) {
        console.error("검색 인덱스 업데이트 실패:", error);
        toast.error("검색 인덱스 업데이트 중 오류가 발생했습니다.");
      } finally {
        setIsUpdatingIndex(false);
      }
    }
  };

  const applyFilters = () => {
    // 필터링 로직 구현 (실제로는 서버에서 필터링하는 것이 좋음)
    // 현재는 클라이언트 측 필터링만 구현
    setFilterOpen(false);
    fetchCustomerList(1); // 실제로는 필터 파라미터를 전달해야 함
  };

  const resetFilters = () => {
    setFilters({
      businessType: "",
      businessCategory: "",
    });
    setFilterOpen(false);
    fetchCustomerList(1);
  };

  // 페이지 번호 생성
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxPages = 5; // 한 번에 보여줄 최대 페이지 수
    let startPage = Math.max(
      1,
      pagination.currentPage - Math.floor(maxPages / 2)
    );
    const endPage = Math.min(pagination.totalPages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  // 담당자 정보 요약
  const getContactSummary = (contacts: Contact[]): string => {
    if (!contacts || contacts.length === 0) return "담당자 정보 없음";

    const validContacts = contacts.filter((c) => c.name || c.phone || c.email);
    if (validContacts.length === 0) return "담당자 정보 없음";

    const primaryContact = validContacts[0];
    return primaryContact.name || "이름 없음";
  };

  // 엑셀 내보내기 (예시 함수)
  const exportToExcel = () => {
    toast.info("엑셀 내보내기 기능은 준비 중입니다.");
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 섹션 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
                <FiBriefcase className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  거래처 관리
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  전체 {pagination.totalCount}개의 거래처
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiFilter className="mr-2 h-4 w-4" />
                필터
              </button>
              <button
                type="button"
                onClick={exportToExcel}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiDownload className="mr-2 h-4 w-4" />
                엑셀 내보내기
              </button>
              <button
                type="button"
                onClick={handleAddCustomer}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus className="mr-2 h-4 w-4" />새 거래처
              </button>
            </div>
          </div>
        </div>

        {/* 필터 패널 */}
        {filterOpen && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                필터 옵션
              </h2>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="text-gray-500 p-1 hover:bg-gray-100 rounded-full focus:outline-none"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="businessType"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  업태
                </label>
                <input
                  id="businessType"
                  type="text"
                  value={filters.businessType}
                  onChange={(e) =>
                    setFilters({ ...filters, businessType: e.target.value })
                  }
                  placeholder="업태로 필터링"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="businessCategory"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  종목
                </label>
                <input
                  id="businessCategory"
                  type="text"
                  value={filters.businessCategory}
                  onChange={(e) =>
                    setFilters({ ...filters, businessCategory: e.target.value })
                  }
                  placeholder="종목으로 필터링"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                초기화
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                적용
              </button>
            </div>
          </div>
        )}

        {/* 검색 및 도구 모음 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 flex items-center">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="거래처명, 대표자, 사업자번호 검색..."
                  className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {searchTerm && (
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setSearchTerm("")}
                    type="button"
                  >
                    <FiX className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={handleSearch}
                className="ml-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                검색
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-md">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${
                    viewMode === "grid"
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                      : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  type="button"
                >
                  <FiGrid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${
                    viewMode === "list"
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                      : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  type="button"
                >
                  <FiList className="h-5 w-5" />
                </button>
              </div>
              <button
                type="button"
                onClick={handleUpdateSearchIndex}
                disabled={isUpdatingIndex}
                className="flex items-center whitespace-nowrap px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingIndex ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    업데이트 중...
                  </>
                ) : (
                  <>
                    <FiRefreshCw className="mr-2 h-4 w-4" />
                    검색 인덱스 업데이트
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 로딩 상태 */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        )}

        {/* 데이터 없음 상태 */}
        {!loading && customers.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <FiBriefcase className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? "검색 결과가 없습니다" : "등록된 거래처가 없습니다"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm
                ? "다른 검색어로 다시 시도해보세요"
                : "새 거래처를 등록하여 시작하세요"}
            </p>
            <button
              type="button"
              onClick={handleAddCustomer}
              className="flex items-center mx-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlus className="mr-2 h-4 w-4" />새 거래처 등록
            </button>
          </div>
        )}

        {/* 그리드 뷰 */}
        {!loading && customers.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                  <h3
                    className="text-lg font-semibold text-white truncate"
                    title={customer.name}
                  >
                    {customer.name}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    {customer.businessNumber}
                  </p>
                </div>
                <div className="p-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start">
                      <FiUser className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300 text-sm">
                        대표자: {customer.representative}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <FiBriefcase className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300 text-sm">
                        업태/종목: {customer.businessType}/
                        {customer.businessCategory}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <FiMapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 mr-2" />
                      <span
                        className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2"
                        title={customer.address}
                      >
                        {customer.address}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <FiPhone className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300 text-sm">
                        담당자: {getContactSummary(customer.contacts)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => handleViewCustomer(customer.id)}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <FiEye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditCustomer(customer.id)}
                      className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(customer.id, customer.name)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 리스트 뷰 */}
        {!loading && customers.length > 0 && viewMode === "list" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      거래처명
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      대표자
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      사업자번호
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      업태/종목
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      담당자
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {customer.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {customer.representative}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {customer.businessNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {customer.businessType}/{customer.businessCategory}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {getContactSummary(customer.contacts)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => handleViewCustomer(customer.id)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditCustomer(customer.id)}
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(customer.id, customer.name)
                            }
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 페이지네이션 */}
        {!loading && customers.length > 0 && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage === 1}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="h-4 w-4 inline" />
                <FiChevronLeft className="h-4 w-4 -ml-2 inline" />
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="h-4 w-4" />
              </button>

              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border rounded-md text-sm ${
                    pagination.currentPage === page
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight className="h-4 w-4 inline" />
                <FiChevronRight className="h-4 w-4 -ml-2 inline" />
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
