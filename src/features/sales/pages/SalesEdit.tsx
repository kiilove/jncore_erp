"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SalesForm from "../components/SalesForm";
import { getSale, updateSale } from "../services/SalesService";
import type { SaleData } from "../services/SalesService";

export default function SalesEdit() {
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [saleData, setSaleData] = useState<SaleData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 판매 데이터 조회
  useEffect(() => {
    const fetchSale = async () => {
      try {
        setIsLoading(true);
        if (!id) throw new Error("판매 ID가 없습니다.");
        const data = await getSale(id);
        setSaleData(data);
      } catch (error) {
        console.error("판매 정보 조회 중 오류 발생:", error);
        setError("판매 정보를 불러오는 중 오류가 발생했습니다.");
        alert("판매 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchSale();
    }
  }, [id]);

  // 판매 데이터 수정 처리
  const handleSubmit = async (data: SaleData) => {
    try {
      setIsSubmitting(true);
      if (!id) throw new Error("판매 ID가 없습니다.");
      // 판매 데이터 수정
      await updateSale(id, data);

      // 성공 후 상세 페이지로 이동
      navigate(`/sales`);
    } catch (error) {
      console.error("판매 수정 중 오류 발생:", error);
      alert("판매 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 취소 처리
  const handleCancel = () => {
    navigate(`/sales`);
  };

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-muted-foreground">판매 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 오류 표시
  if (error || !saleData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md max-w-md">
          <h2 className="text-lg font-semibold mb-2">오류 발생</h2>
          <p>{error || "판매 정보를 찾을 수 없습니다."}</p>
          <button
            onClick={() => navigate("/sales")}
            className="mt-4 px-4 py-2 bg-card border border-input rounded-md text-sm"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <SalesForm
      initialValues={saleData}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isSubmitting={isSubmitting}
      isEdit={true}
    />
  );
}
