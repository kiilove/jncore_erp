"use client";

import { useNavigate } from "react-router-dom";
import { createCustomer } from "../services/customerServiceOld";
import CustomerForm from "../components/customer/CustomerFormOld";
import { toast } from "react-toastify";

const CustomerAdd = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      // 엑셀 데이터 구조에 맞게 변환
      const customerData = {
        name: formData.businessInfo.businessName,
        businessNumber: formData.businessInfo.businessNumber,
        representative: formData.businessInfo.representativeName,
        address: formData.businessInfo.baseAddress,
        businessType: formData.businessInfo.businessType,
        businessCategory: formData.businessInfo.businessCategory,
        contactName: formData.contacts[0]?.name || "",
        emails: formData.contacts[0]?.email ? [formData.contacts[0].email] : [],
        notes: formData.notes,
        createdBy: "user",
      };

      await createCustomer(customerData);
      toast.success("거래처가 성공적으로 등록되었습니다.");
      navigate("/customers");
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error(
        error.response?.data?.message || "거래처 등록 중 오류가 발생했습니다."
      );
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
