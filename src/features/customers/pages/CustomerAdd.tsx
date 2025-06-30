"use client";

import { useNavigate } from "react-router-dom";
import { createCustomer } from "../services/customerService";
import CustomerForm from "../components/CustomerForm";
import { toast } from "react-toastify";
import type { CustomerFormData } from "../types";

const CustomerAdd = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData: CustomerFormData) => {
    try {
      // 실제 데이터베이스 구조에 맞게 데이터 전달
      const customerData = {
        ...formData,
        createdBy: "user",
      };

      await createCustomer(customerData);
      toast.success("거래처가 성공적으로 등록되었습니다.");
      navigate("/customers");
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("거래처 등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <CustomerForm
      onClose={() => navigate("/customers")}
      onSubmit={handleSubmit}
    />
  );
};

export default CustomerAdd;
