"use client";

import { useState, useEffect } from "react";
import { Input } from "../../../components/common/Input";
import { Select } from "../../../components/common/Select";
import { Button } from "../../../components/common/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../../components/common/Card";
import {
  FiBox,
  FiDollarSign,
  FiTag,
  FiHash,
  FiPackage,
  FiInfo,
} from "react-icons/fi";

const ProductForm = ({ initialData = {}, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    code: "",
    description: "",
    price: 0,
    cost: 0,
    stock: 0,
    lowStockThreshold: 10,
    unit: "개",
    barcode: "",
    manufacturer: "",
    status: "active",
    ...initialData,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        name: "",
        category: "",
        code: "",
        description: "",
        price: 0,
        cost: 0,
        stock: 0,
        lowStockThreshold: 10,
        unit: "개",
        barcode: "",
        manufacturer: "",
        status: "active",
        ...initialData,
      });
    }
  }, [initialData]);

  const categoryOptions = [
    { value: "", label: "카테고리 선택" },
    { value: "컴퓨터", label: "컴퓨터" },
    { value: "노트북", label: "노트북" },
    { value: "모니터", label: "모니터" },
    { value: "주변기기", label: "주변기기" },
    { value: "부품", label: "부품" },
  ];

  const statusOptions = [
    { value: "active", label: "판매중" },
    { value: "inactive", label: "판매중지" },
    { value: "discontinued", label: "단종" },
  ];

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    // 숫자 필드 처리
    if (type === "number") {
      setFormData({
        ...formData,
        [name]: value === "" ? 0 : Number(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "제품명은 필수 입력 항목입니다.";
    }

    if (!formData.category) {
      newErrors.category = "카테고리는 필수 선택 항목입니다.";
    }

    if (formData.price < 0) {
      newErrors.price = "가격은 0 이상이어야 합니다.";
    }

    if (formData.cost < 0) {
      newErrors.cost = "원가는 0 이상이어야 합니다.";
    }

    if (formData.stock < 0) {
      newErrors.stock = "재고는 0 이상이어야 합니다.";
    }

    if (formData.lowStockThreshold < 0) {
      newErrors.lowStockThreshold = "재고 부족 기준은 0 이상이어야 합니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData.id ? "제품 정보 수정" : "새 제품 등록"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="제품명"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              required
              icon={FiBox}
            />

            <Select
              label="카테고리"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              options={categoryOptions}
              error={errors.category}
              required
              icon={FiTag}
            />

            <Input
              label="제품 코드"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              icon={FiInfo}
            />

            <Input
              label="바코드"
              name="barcode"
              value={formData.barcode}
              onChange={handleInputChange}
              icon={FiHash}
            />

            <Input
              label="판매가"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              error={errors.price}
              required
              icon={FiDollarSign}
            />

            <Input
              label="원가"
              name="cost"
              type="number"
              value={formData.cost}
              onChange={handleInputChange}
              error={errors.cost}
              icon={FiDollarSign}
            />

            <Input
              label="재고"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleInputChange}
              error={errors.stock}
              icon={FiPackage}
            />

            <Input
              label="재고 부족 기준"
              name="lowStockThreshold"
              type="number"
              value={formData.lowStockThreshold}
              onChange={handleInputChange}
              error={errors.lowStockThreshold}
              icon={FiPackage}
            />

            <Input
              label="단위"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
            />

            <Input
              label="제조사"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleInputChange}
            />

            <Select
              label="상태"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              options={statusOptions}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">제품 설명</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            ></textarea>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : initialData.id ? "수정" : "등록"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProductForm;
