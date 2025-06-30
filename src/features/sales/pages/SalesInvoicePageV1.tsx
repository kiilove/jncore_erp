"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getSale } from "../services/SalesService";
import type { SaleData } from "../services/SalesService";
import { ArrowLeft, Printer, Download, Mail } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useReactToPrint } from "react-to-print";
import InvoiceTemplate from "../components/InvoiceTemplate";

export default function SalesInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sale, setSale] = useState<SaleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // 회사 정보 (실제로는 설정에서 가져오거나 DB에서 가져올 수 있음)
  const [companyInfo] = useState({
    name: "제이앤코어",
    address: "경기도 안양시 동안구 엘에스로 142 803호(호계동, 금정역SKV1센터)",
    phone: "070-7555-3695",
    email: "jbkim@jncore.com",
    businessNumber: "854-16-00126",
    url: "https://www.jncore.com",
  });

  useEffect(() => {
    const fetchSale = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await getSale(id);
        setSale(data);
      } catch (error) {
        console.error("판매 정보 조회 중 오류 발생:", error);
        setError("판매 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSale();
  }, [id]);

  // react-to-print를 사용한 인쇄 기능
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `거래명세서_${sale?.documentNumber || ""}`,
    onBeforeGetContent: () => {
      return new Promise<void>((resolve) => {
        resolve();
      });
    },
    onAfterPrint: () => {
      console.log("인쇄가 완료되었습니다.");
    },
    pageStyle: `
      @page {
        size: 210mm 297mm;
        margin: 0;
      }
      @media print {
        html, body {
          width: 210mm;
          height: 297mm;
          margin: 0;
          padding: 0;
        }
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `,
    copyStyles: true,
  });

  // PDF 생성 기능 - 용량 최적화 및 위치 조정
  const handleGeneratePDF = async () => {
    if (!printRef.current || !sale) return;

    setIsPdfGenerating(true);
    try {
      // 해상도를 낮추고 품질 설정을 조정하여 용량 최적화
      const canvas = await html2canvas(printRef.current, {
        scale: 1.5, // 해상도를 낮춤 (2 -> 1.5)
        logging: false,
        useCORS: true,
        imageTimeout: 0,
        allowTaint: true,
        backgroundColor: "#ffffff",
        // 이미지 품질 최적화
        onclone: (document) => {
          const images = document.querySelectorAll("img");
          images.forEach((img) => {
            img.style.imageRendering = "auto";
          });
          return document;
        },
      });

      const imgData = canvas.toDataURL("image/jpeg", 1);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true, // PDF 압축 활성화
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // 상단 여백 조정 (텍스트가 아래로 밀리는 현상 해결)
      const topMargin = 0; // 필요에 따라 조정 (음수 값도 가능)

      pdf.addImage(imgData, "JPEG", 0, topMargin, imgWidth, imgHeight);
      pdf.save(`거래명세서_${sale.documentNumber}.pdf`);
    } catch (error) {
      console.error("PDF 생성 중 오류 발생:", error);
      alert("PDF 생성 중 오류가 발생했습니다.");
    } finally {
      setIsPdfGenerating(false);
    }
  };

  // 이메일 전송 기능 (실제 구현은 백엔드 필요)
  const handleSendEmail = () => {
    alert("이메일 전송 기능은 아직 구현되지 않았습니다.");
  };

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-500">판매 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 오류 표시
  if (error || !sale) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 text-red-700 p-4 rounded-md max-w-md">
          <h2 className="text-lg font-semibold mb-2">오류 발생</h2>
          <p>{error || "판매 정보를 찾을 수 없습니다."}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm"
          >
            이전 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <Link
            to={`/sales/${id}`}
            className="inline-flex items-center px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            상세 페이지로
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">거래 명세서</h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            <Printer className="w-4 h-4 mr-2" />
            인쇄하기
          </button>
          <button
            onClick={handleGeneratePDF}
            disabled={isPdfGenerating}
            className="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            {isPdfGenerating ? "PDF 생성 중..." : "PDF 다운로드"}
          </button>
          <button
            onClick={handleSendEmail}
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Mail className="w-4 h-4 mr-2" />
            이메일 전송
          </button>
        </div>
      </div>

      {/* 인쇄 템플릿 */}
      <div className="invoice-container">
        <div className="invoice-wrapper">
          <InvoiceTemplate
            ref={printRef}
            sale={sale}
            companyInfo={companyInfo}
          />
        </div>
      </div>

      {/* 인쇄 스타일 */}
      <style>{`
        .invoice-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0 auto;
        }
        
        .invoice-wrapper {
          width: 210mm;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border-radius: 0.5rem;
          overflow: hidden;
          background-color: white;
        }
        
        @media print {
          @page {
            size: 210mm 297mm;
            margin: 0;
          }
          
          html, body {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .max-w-5xl {
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .invoice-container {
            display: block;
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
          }
          
          .invoice-wrapper {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
            box-shadow: none;
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  );
}
