"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addProduct } from "../services/productService";
import ProductForm from "../components/ProductForm";
import Layout from "../../../components/Layout";
import { toast } from "react-toastify";

const ProductAdd = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      await addProduct(formData);
      toast.success("제품이 성공적으로 등록되었습니다.");
      navigate("/products");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("제품 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">새 제품 등록</h1>
          <p className="text-gray-500 dark:text-gray-400">
            새로운 제품 정보를 입력하세요.
          </p>
        </div>

        <ProductForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </Layout>
  );
};

export default ProductAdd;
