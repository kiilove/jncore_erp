"use client";

import { useState } from "react";
import { toast } from "react-toastify";

import SalesForm from "../components/SalesForm";
import { addSale } from "../services/SalesService";
import type { SaleData } from "../services/SalesService";
import { useNavigate } from "react-router-dom";

export default function SalesAdd() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 판매 데이터 추가 처리
  const handleSubmit = async (data: SaleData) => {
    try {
      setIsSubmitting(true);

      // 판매 데이터 추가
      const result = await addSale(data);

      // 성공 후 목록 페이지로 이동
      navigate("/sales");
    } catch (error) {
      console.error("판매 등록 중 오류 발생:", error);
      toast.error("판매 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 취소 처리
  const handleCancel = () => {
    toast.info(
      <div>
        <p>작성 중인 내용이 저장되지 않습니다. 취소하시겠습니까?</p>
        <div className="mt-2">
          <button
            onClick={() => {
              toast.dismiss();
              navigate("/sales");
            }}
            className="mr-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            확인
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            취소
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  return (
    <SalesForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isSubmitting={isSubmitting}
    />
  );
}
