"use client";

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById } from "../services/productService";
import Layout from "../../../components/Layout";
import { Button } from "../../../components/common/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import {
  FiEdit2,
  FiArrowLeft,
  FiPackage,
  FiDollarSign,
  FiInfo,
} from "react-icons/fi";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
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
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "warning";
      case "discontinued":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "판매중";
      case "inactive":
        return "판매중지";
      case "discontinued":
        return "단종";
      default:
        return status;
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

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 p-4">
            <p className="text-yellow-700 dark:text-yellow-300">
              제품을 찾을 수 없습니다.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center">
          <Link to="/products" className="mr-4">
            <Button variant="outline" size="sm" icon={FiArrowLeft}>
              목록으로
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">제품 상세 정보</h1>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{product.name}</CardTitle>
            <Badge variant={getStatusBadgeVariant(product.status)}>
              {getStatusText(product.status)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">기본 정보</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      카테고리
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {product.category || "-"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      제품 코드
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {product.code || "-"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      바코드
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {product.barcode || "-"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      제조사
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {product.manufacturer || "-"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">가격 및 재고</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      판매가
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {product.price.toLocaleString()} 원
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      원가
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {product.cost
                        ? `${product.cost.toLocaleString()} 원`
                        : "-"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      마진율
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {product.cost && product.price
                        ? `${Math.round(
                            ((product.price - product.cost) / product.price) *
                              100
                          )}%`
                        : "-"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      재고
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {product.stock} {product.unit || "개"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      재고 부족 기준
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {product.lowStockThreshold || "-"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {product.description && (
              <div>
                <h3 className="text-lg font-medium mb-2">제품 설명</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" icon={FiPackage}>
                재고 관리
              </Button>
              <Button variant="outline" size="sm" icon={FiDollarSign}>
                가격 이력
              </Button>
              <Button variant="outline" size="sm" icon={FiInfo}>
                판매 이력
              </Button>
            </div>
            <Link to={`/products/edit/${product.id}`}>
              <Button icon={FiEdit2}>수정</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default ProductDetail;
