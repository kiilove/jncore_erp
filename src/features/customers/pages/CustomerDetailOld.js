"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCustomer, deleteCustomer } from "../services/customerServiceOld";
import { Button } from "../../../components/common/Button";
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
  FiFileText,
} from "react-icons/fi";

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const data = await fetchCustomer(id);
      setCustomer(data);
    } catch (error) {
      console.error("Error fetching customer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/customers/${id}/edit`);
  };

  const handleBack = () => {
    navigate("/customers");
  };

  const handleDelete = async () => {
    if (window.confirm("정말로 이 거래처를 삭제하시겠습니까?")) {
      try {
        await deleteCustomer(id);
        navigate("/customers");
      } catch (error) {
        console.error("Error deleting customer:", error);
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
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="flex items-center"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          뒤로가기
        </Button>
        <div className="flex space-x-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleEdit}
            className="flex items-center"
          >
            <FiEdit2 className="mr-2 h-4 w-4" />
            수정하기
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            className="flex items-center"
          >
            <FiTrash2 className="mr-2 h-4 w-4" />
            삭제하기
          </Button>
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
                <div className="flex items-center">
                  <FiCalendar className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    개업일자:
                  </span>
                  <span className="ml-2 font-medium text-gray-800 dark:text-white">
                    {customer.openingDate}
                  </span>
                </div>
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
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                <FiUser className="mr-2 h-5 w-5 text-blue-500" />
                담당자 정보
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center">
                  <span className="text-gray-600 dark:text-gray-300">
                    담당자:
                  </span>
                  <span className="ml-2 font-medium text-gray-800 dark:text-white">
                    {customer.contactName}
                  </span>
                </div>
                <div className="flex items-center">
                  <FiPhone className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    연락처:
                  </span>
                  <span className="ml-2 font-medium text-gray-800 dark:text-white">
                    {customer.contactPhone}
                  </span>
                </div>
                <div className="flex items-center">
                  <FiMail className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    이메일:
                  </span>
                  <span className="ml-2 font-medium text-gray-800 dark:text-white">
                    {customer.emails?.[0]}
                  </span>
                </div>
              </div>
            </div>

            {/* 비고 */}
            {customer.notes && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                  <FiFileText className="mr-2 h-5 w-5 text-blue-500" />
                  비고
                </h2>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    {customer.notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
