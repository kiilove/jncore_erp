"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCustomer, updateCustomer } from "../services/customerServiceOld";
import CustomerForm from "../components/customer/CustomerFormOld";

const CustomerEdit = () => {
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

      // 엑셀 데이터 구조를 폼 데이터 구조로 변환
      const formData = {
        type: "business",
        businessInfo: {
          businessNumber: data.businessNumber || "",
          name: data.name || "",
          representative: data.representative || "",
          address: data.address || "",
          businessType: data.businessType || "",
          businessCategory: data.businessCategory || "",
          openingDate: data.openingDate || "",
        },
        contacts: data.contacts || [
          {
            name: data.contactName || "",
            phone: data.contactPhone || "",
            email: data.emails?.[0] || "",
          },
        ],
        notes: data.notes || "",
      };

      setCustomer(formData);
    } catch (error) {
      console.error("Error fetching customer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      // 폼 데이터를 엑셀 데이터 구조로 변환
      const customerData = {
        name: formData.businessInfo.name,
        businessNumber: formData.businessInfo.businessNumber,
        representative: formData.businessInfo.representative,
        address: formData.businessInfo.address,
        businessType: formData.businessInfo.businessType,
        businessCategory: formData.businessInfo.businessCategory,
        openingDate: formData.businessInfo.openingDate,
        contactName: formData.contacts[0]?.name || "",
        contactPhone: formData.contacts[0]?.phone || "",
        emails: formData.contacts[0]?.email ? [formData.contacts[0].email] : [],
        notes: formData.notes,
      };

      await updateCustomer(id, customerData);
      navigate(`/customers/${id}`);
    } catch (error) {
      console.error("Error updating customer:", error);
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
    <CustomerForm
      customer={customer}
      onClose={() => navigate(`/customers/${id}`)}
      onSubmit={handleSubmit}
    />
  );
};

export default CustomerEdit;
