"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getSale } from "../services/SalesService";
import type { SaleData } from "../services/SalesService";
import { ArrowLeft, Printer, Download, Mail, Stamp } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useReactToPrint } from "react-to-print";
import InvoiceTemplate from "../components/InvoiceTemplate";
import SimpleInvoiceTemplate from "../components/SimpleInvoiceTemplate";
import BasicInvoiceTemplate from "../components/BasicInvoiceTemplate";
import MinimalInvoiceTemplate from "../components/MinimalInvoiceTemplate";
import TemplateSelector from "../components/TemplateSelector";
import { useSettings } from "../../../contexts/SettingsContext";

// jsPDF에 autoTable 타입 추가
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export default function SalesInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sale, setSale] = useState<SaleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [templateType, setTemplateType] = useState("modern"); // modern, simple, basic, minimal
  const [showStamp, setShowStamp] = useState(true); // 인감 표시 여부 상태 추가
  const printRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();
  const [companyInfo, setCompanyInfo] = useState({
    name: settings.company.name,
    address: settings.company.address,
    phone: settings.company.phone,
    email: settings.company.email,
    businessNumber: settings.company.businessNumber,
    url: "https://www.jncore.com",
    stampUrl: settings.stamp.url,
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

  useEffect(() => {
    setCompanyInfo({
      name: settings.company.name,
      address: settings.company.address,
      phone: settings.company.phone,
      email: settings.company.email,
      businessNumber: settings.company.businessNumber,
      url: "https://www.jncore.com",
      stampUrl: settings.stamp.url,
    });
  }, [settings]);

  // 템플릿 변경 핸들러
  const handleTemplateChange = (template: string) => {
    setTemplateType(template);
  };

  // 인감 표시 토글 핸들러
  const toggleStamp = () => {
    setShowStamp((prev) => !prev);
  };

  // 선택된 템플릿에 따라 다른 템플릿 컴포넌트 렌더링
  const renderTemplate = () => {
    if (!sale) return null;

    // 공통 props
    const commonProps = {
      sale,
      companyInfo,
      showStamp, // 인감 표시 여부 prop 추가
    };

    switch (templateType) {
      case "modern":
        return <InvoiceTemplate ref={printRef} {...commonProps} />;
      case "simple":
        return <SimpleInvoiceTemplate ref={printRef} {...commonProps} />;
      case "basic":
        return <BasicInvoiceTemplate ref={printRef} {...commonProps} />;
      case "minimal":
        return <MinimalInvoiceTemplate ref={printRef} {...commonProps} />;
      default:
        return <InvoiceTemplate ref={printRef} {...commonProps} />;
    }
  };

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

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}.${String(date.getDate()).padStart(2, "0")}`;
  };

  // 숫자 포맷 함수
  const formatNumber = (number: number) => {
    return new Intl.NumberFormat("ko-KR").format(number);
  };

  // 통화 포맷 함수
  const formatCurrency = (number: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      currencyDisplay: "symbol",
    })
      .format(number)
      .replace("₩", "");
  };

  // 기존 PDF 생성 기능 (html2canvas 사용)
  const handleGeneratePDF = async () => {
    if (!printRef.current || !sale) return;

    setIsPdfGenerating(true);
    try {
      // PDF 생성 전 텍스트 정렬 문제 해결을 위한 스타일 조정
      const element = printRef.current;

      // 해상도를 높이고 위치 조정을 위해 scale 값 조정
      const canvas = await html2canvas(element, {
        scale: 2, // 해상도 증가
        logging: false,
        useCORS: true,
        imageTimeout: 0,
        allowTaint: true,
        backgroundColor: "#ffffff",
        // 테이블 헤더 밀림 현상 개선을 위한 설정
        onclone: (clonedDoc) => {
          // 클론된 document의 스타일 조정
          const style = clonedDoc.createElement("style");
          style.innerHTML = `
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; min-height: 24px; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          th, td { 
            vertical-align: middle !important; 
            padding-top: 4px !important; 
            padding-bottom: 4px !important; 
            line-height: 1.2 !important; 
            position: relative !important;
            height: auto !important;
            min-height: 24px !important;
          }
          .border { border-width: 1px !important; }
        `;
          clonedDoc.head.appendChild(style);

          // 모든 테이블 셀에 높이 조정 적용
          const cells = clonedDoc.querySelectorAll("td, th");
          cells.forEach((cell) => {
            (cell as HTMLElement).style.minHeight = "34px";
            (cell as HTMLElement).style.height = "auto";
          });

          return clonedDoc;
        },
      });

      // 캔버스를 JPEG로 변환 (용량 최적화)
      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      // PDF 객체 생성
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      // 이미지 비율 계산 및 조정
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // 상단 여백 조정 (테이블 헤더 밀림 현상 보정)
      const topMargin = 0; // 여백 조정 제거

      pdf.addImage(imgData, "JPEG", 0, topMargin, imgWidth, imgHeight);
      pdf.save(`거래명세서_${sale.documentNumber}.pdf`);
    } catch (error) {
      console.error("PDF 생성 중 오류 발생:", error);
      alert(
        `PDF 생성 중 오류가 발생했습니다: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
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
        <div className="flex flex-wrap gap-2">
          <TemplateSelector
            selectedTemplate={templateType}
            onTemplateChange={handleTemplateChange}
          />

          {/* 인감 표시 토글 스위치 */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md">
            <Stamp className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">인감 표시</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showStamp}
                onChange={toggleStamp}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

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

      {/* 템플릿 정보 표시 */}
      <div className="mb-4 bg-gray-50 border border-gray-200 rounded-md p-3">
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium mr-2">현재 템플릿:</span>
          {templateType === "modern" &&
            "모던 템플릿 (그라데이션과 현대적인 디자인)"}
          {templateType === "simple" &&
            "심플 템플릿 (깔끔한 디자인으로 토너 절약)"}
          {templateType === "basic" && "기본 템플릿 (기본적인 테이블 형태)"}
          {templateType === "minimal" &&
            "미니멀 템플릿 (최소한의 디자인으로 최대 토너 절약)"}

          {templateType !== "modern" && (
            <span className="ml-2 text-green-600 text-xs">
              토너 절약 모드{" "}
              {templateType === "minimal"
                ? "++++"
                : templateType === "basic"
                ? "+++"
                : "++"}
            </span>
          )}
        </div>
      </div>

      {/* 인쇄 템플릿 */}
      <div className="invoice-container">
        <div className="invoice-wrapper">{renderTemplate()}</div>
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
