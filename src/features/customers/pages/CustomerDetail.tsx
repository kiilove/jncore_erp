"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCustomer, deleteCustomer } from "../services/customerService";
import {
  FiEdit2,
  FiPhone,
  FiMail,
  FiMapPin,
  FiArrowLeft,
  FiTrash2,
  FiBriefcase,
  FiUser,
  FiCalendar,
} from "react-icons/fi";
import { toast } from "react-toastify";
import type { Customer, Contact } from "../types";

const CustomerDetail = () => {
  const params = useParams();
  const id = params.id;
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCustomerData(id);
    }
  }, [id]);

  const fetchCustomerData = async (customerId: string) => {
    try {
      setLoading(true);
      const data = await fetchCustomer(customerId);
      setCustomer(data);
    } catch (error) {
      console.error("Error fetching customer:", error);
      toast.error("거래처 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/customers/${id}/edit`);
    }
  };

  const handleBack = () => {
    navigate("/customers");
  };

  const handleDelete = async () => {
    if (!id || !customer) return;

    if (
      window.confirm(`정말로 "${customer.name}" 거래처를 삭제하시겠습니까?`)
    ) {
      try {
        await deleteCustomer(id);
        toast.success("거래처가 삭제되었습니다.");
        navigate("/customers");
      } catch (error) {
        console.error("Error deleting customer:", error);
        toast.error("거래처 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <div className="text-red-500 text-xl mb-4">
          거래처를 찾을 수 없습니다
        </div>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          거래처 목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          뒤로가기
        </button>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleEdit}
            className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiEdit2 className="mr-2 h-4 w-4" />
            수정하기
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <FiTrash2 className="mr-2 h-4 w-4" />
            삭제하기
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* 헤더 섹션 */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <h1 className="text-3xl font-bold">{customer.name}</h1>
          <p className="text-blue-100 mt-1">
            {customer.businessNumber &&
              `사업자등록번호: ${customer.businessNumber}`}
          </p>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                <FiBriefcase className="mr-2 h-5 w-5 text-blue-500" />
                기본 정보
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center">
                  <FiUser className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    대표자:
                  </span>
                  <span className="ml-2 font-medium text-gray-800 dark:text-white">
                    {customer.representative}
                  </span>
                </div>
                {customer.createdAt && (
                  <div className="flex items-center">
                    <FiCalendar className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      등록일:
                    </span>
                    <span className="ml-2 font-medium text-gray-800 dark:text-white">
                      {new Date(
                        customer.createdAt.toDate()
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-start">
                  <FiMapPin className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400 mt-1" />
                  <span className="text-gray-600 dark:text-gray-300">
                    주소:
                  </span>
                  <span className="ml-2 font-medium text-gray-800 dark:text-white">
                    {customer.address}
                  </span>
                </div>
              </div>
            </div>

            {/* 업종 정보 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                <FiBriefcase className="mr-2 h-5 w-5 text-blue-500" />
                업종 정보
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center">
                  <span className="text-gray-600 dark:text-gray-300">
                    업태:
                  </span>
                  <span className="ml-2 font-medium text-gray-800 dark:text-white">
                    {customer.businessType}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 dark:text-gray-300">
                    종목:
                  </span>
                  <span className="ml-2 font-medium text-gray-800 dark:text-white">
                    {customer.businessCategory}
                  </span>
                </div>
              </div>
            </div>

            {/* 담당자 정보 */}
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                <FiUser className="mr-2 h-5 w-5 text-blue-500" />
                담당자 정보
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customer.contacts &&
                  customer.contacts.map((contact: Contact, index: number) =>
                    contact.name || contact.phone || contact.email ? (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center">
                          <FiUser className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-300">
                            담당자:
                          </span>
                          <span className="ml-2 font-medium text-gray-800 dark:text-white">
                            {contact.name || "-"}
                          </span>
                        </div>
                        {contact.phone && (
                          <div className="flex items-center">
                            <FiPhone className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">
                              연락처:
                            </span>
                            <span className="ml-2 font-medium text-gray-800 dark:text-white">
                              {contact.phone}
                            </span>
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center">
                            <FiMail className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">
                              이메일:
                            </span>
                            <span className="ml-2 font-medium text-gray-800 dark:text-white">
                              {contact.email}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : null
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
