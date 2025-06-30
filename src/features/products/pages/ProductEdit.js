"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, updateProduct } from "../services/productService";
import Layout from "../../../components/Layout";
import ProductForm from "../components/ProductForm";
import { toast } from "react-toastify";

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await getProductById(id);
        setProduct(productData);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("제품 정보를 불러오는 중 오류가 발생했습니다.");
        toast.error("제품 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      await updateProduct(id, formData);
      toast.success("제품이 성공적으로 수정되었습니다.");
      navigate("/products");
    } catch (err) {
      console.error("Error updating product:", err);
      toast.error("제품 수정 중 오류가 발생했습니다.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">제품 수정</h1>
        {product && (
          <ProductForm
            initialData={product}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
          />
        )}
      </div>
    </Layout>
  );
};

export default ProductEdit;
