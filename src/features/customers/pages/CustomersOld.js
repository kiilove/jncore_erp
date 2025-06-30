"use client";

import { useState, useEffect } from "react";
import {
  fetchCustomers,
  searchCustomers,
  deleteCustomer,
  updateCustomerSearchIndex,
} from "../services/customerServiceOld";
import CustomerCard from "../components/customer/CustomerCard";
import CustomerSearch from "../components/customer/CustomerSearch";
import CustomerHeader from "../components/sections/CustomerHeader";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/common/Button";
import {
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
} from "react-icons/fi";

const ITEMS_PER_PAGE = 10;

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [isUpdatingIndex, setIsUpdatingIndex] = useState(false);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomerList(1);
  }, []);

  const fetchCustomerList = async (page) => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchCustomers(page, ITEMS_PER_PAGE);
      setCustomers(result.customers);
      setPagination({
        totalCount: result.totalCount,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
      });
    } catch (error) {
      console.error("거래처 목록 조회 실패:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchTerm) => {
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
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchCustomerList(page);
    }
  };

  const handleAddCustomer = () => {
    navigate("/customers/add");
  };

  const handleEditCustomer = (id) => {
    navigate(`/customers/${id}/edit`);
  };

  const handleViewCustomer = (id) => {
    navigate(`/customers/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("정말로 이 거래처를 삭제하시겠습니까?")) {
      try {
        await deleteCustomer(id);
        // 삭제 후 현재 페이지 새로고침
        fetchCustomerList(pagination.currentPage);
      } catch (error) {
        console.error("거래처 삭제 실패:", error);
        setError(error.message);
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
        alert(
          `검색 인덱스 업데이트가 완료되었습니다.\n총 ${result.count}개의 거래처가 업데이트되었습니다.`
        );

        // 현재 페이지 새로고침
        fetchCustomerList(pagination.currentPage);
      } catch (error) {
        console.error("검색 인덱스 업데이트 실패:", error);
        setError(error.message);
      } finally {
        setIsUpdatingIndex(false);
      }
    }
  };

  // 페이지 번호 생성
  const getPageNumbers = () => {
    const pages = [];
    const maxPages = 5; // 한 번에 보여줄 최대 페이지 수
    let startPage = Math.max(
      1,
      pagination.currentPage - Math.floor(maxPages / 2)
    );
    let endPage = Math.min(pagination.totalPages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <CustomerHeader onAddCustomer={handleAddCustomer} />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">오류 발생!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
          <CustomerSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSearch={handleSearch}
          />
          <Button
            variant="outline"
            onClick={handleUpdateSearchIndex}
            disabled={isUpdatingIndex}
            className="flex items-center gap-2"
          >
            {isUpdatingIndex ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                인덱스 업데이트 중...
              </>
            ) : (
              <>
                <FiRefreshCw className="h-4 w-4" />
                검색 인덱스 업데이트
              </>
            )}
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          전체 {pagination.totalCount}개 중{" "}
          {(pagination.currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
          {Math.min(
            pagination.currentPage * ITEMS_PER_PAGE,
            pagination.totalCount
          )}
          개 표시
        </div>
      </div>

      {loading && customers.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? "검색 결과가 없습니다." : "등록된 거래처가 없습니다."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {customers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onEdit={() => handleEditCustomer(customer.id)}
                onDelete={() => handleDelete(customer.id)}
                onView={() => handleViewCustomer(customer.id)}
              >
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/customers/${customer.id}`)}
                    className="flex items-center"
                  >
                    자세히
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/customers/${customer.id}/edit`)}
                    className="flex items-center"
                  >
                    <FiEdit2 className="mr-2 h-4 w-4" />
                    수정
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(customer.id)}
                    className="flex items-center"
                  >
                    <FiTrash2 className="mr-2 h-4 w-4" />
                    삭제
                  </Button>
                </div>
              </CustomerCard>
            ))}
          </div>

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.currentPage === 1}
                >
                  <FiChevronLeft className="h-4 w-4" />
                </Button>
                {getPageNumbers().map((page) => (
                  <Button
                    key={page}
                    variant={
                      pagination.currentPage === page ? "primary" : "outline"
                    }
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  <FiChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Customers;
