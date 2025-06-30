"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCustomer, updateCustomer } from "../services/customerService";
import CustomerForm from "../components/CustomerForm";
import { toast } from "react-toastify";
import type { Customer, CustomerFormData } from "../types";

const CustomerEdit = () => {
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

  const handleSubmit = async (formData: CustomerFormData) => {
    if (!id) return;

    try {
      // 실제 데이터베이스 구조에 맞게 데이터 전달
      await updateCustomer(id, formData);
      toast.success("거래처가 성공적으로 수정되었습니다.");
      navigate(`/customers/${id}`);
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("거래처 수정 중 오류가 발생했습니다.");
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
          onClick={() => navigate("/customers")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          거래처 목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <CustomerForm
      customer={customer}
      onClose={() => navigate(`/customers/${id}`)}
      onSubmit={handleSubmit}
    />
  );
};

export default CustomerEdit;
