"use client";

import { useState, useEffect } from "react";
import { customerService } from "../services/customerService";
import CustomerCard from "../components/customer/CustomerCard";
import CustomerForm from "../components/customer/CustomerForm";
import CustomerSearch from "../components/customer/CustomerSearch";
import CustomerHeader from "../components/sections/CustomerHeader";

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const customersList = await customerService.getCustomers();
      setCustomers(customersList);
    } catch (error) {
      console.error("Error fetching customers: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (customer = null) => {
    setCurrentCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCustomer(null);
  };

  const handleSubmit = async (formData) => {
    try {
      if (currentCustomer) {
        await customerService.updateCustomer(currentCustomer.id, formData);
      } else {
        await customerService.addCustomer(formData);
      }
      handleCloseModal();
      fetchCustomers();
    } catch (error) {
      console.error("Error saving customer: ", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("정말로 이 거래처를 삭제하시겠습니까?")) {
      try {
        await customerService.deleteCustomer(id);
        fetchCustomers();
      } catch (error) {
        console.error("Error deleting customer: ", error);
      }
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.contactName &&
        customer.contactName
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (customer.businessNumber && customer.businessNumber.includes(searchTerm))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <CustomerHeader onAddCustomer={() => handleOpenModal()} />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
          <CustomerSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <CustomerForm
          customer={currentCustomer}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default CustomersPage;
