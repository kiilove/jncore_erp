"use client";

import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";
import {
  FiPrinter,
  FiArrowLeft,
  FiDownload,
  FiMail,
  FiPackage,
} from "react-icons/fi";
import { useReactToPrint } from "react-to-print";
import { generateInvoicePDF } from "../utils/pdfUtils";
import InvoiceTemplate from "../components/InvoiceTemplate";

const SalesInvoice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    name: "JN Core",
    address: "서울특별시 강남구 테헤란로 123",
    phone: "02-1234-5678",
    email: "info@jncore.com",
    businessNumber: "123-45-67890",
  });

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    customerId: "",
    customerName: "",
    contactPerson: null,
    contactPhone: "",
  });

  const printRef = useRef();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const saleId = searchParams.get("id");

    if (saleId) {
      fetchSaleData(saleId);
    } else {
      setLoading(false);
    }
  }, [location]);

  const fetchSaleData = async (id) => {
    try {
      setLoading(true);
      const saleDoc = await getDoc(doc(db, "sales", id));

      if (saleDoc.exists()) {
        const saleData = saleDoc.data();
        let customerData = {};

        // 고객 정보 가져오기
        if (saleData.customerId) {
          const customerDoc = await getDoc(
            doc(db, "customers", saleData.customerId)
          );
          if (customerDoc.exists()) {
            customerData = customerDoc.data();
          }
        }

        setSale({
          id: saleDoc.id,
          ...saleData,
          customerName: saleData.customerName,
          customerBusinessNumber: saleData.customerBusinessNumber || "-",
          customerAddress: saleData.customerAddress || "-",
          invoiceNumber: saleData.invoiceNumber,
          date: saleData.date.toDate().toISOString().split("T")[0],
          deliveryMethod: saleData.deliveryMethod,
          status: saleData.status,
          paymentStatus: saleData.paymentStatus,
          paymentMethod: saleData.paymentMethod,
          notes: saleData.notes,
          contactPerson: {
            name:
              saleData.contactPerson?.name || saleData.contactPersonName || "-",
            phone:
              saleData.contactPerson?.phone ||
              saleData.contactPersonPhone ||
              "-",
            email:
              saleData.contactPerson?.email ||
              saleData.contactPersonEmail ||
              "-",
          },
          bankInfo: {
            bankName: saleData.bankInfo?.bankName || "-",
            accountNumber: saleData.bankInfo?.accountNumber || "-",
            accountHolder: saleData.bankInfo?.accountHolder || "-",
          },
          items: saleData.items.map((item) => ({
            ...item,
            productName: item.productName,
            category: item.category || "-",
            note: item.note || "-",
            quantity: item.quantity,
            price: item.price,
            tax: item.tax,
            netPrice: item.netPrice,
            total: item.total,
          })),
          taxAmount: saleData.taxAmount,
          netAmount: saleData.netAmount,
          totalAmount: saleData.totalAmount,
          includeTax: saleData.includeTax,
          dueDate: saleData.dueDate || "-",
          projectCode: saleData.projectCode || "-",
          contractNumber: saleData.contractNumber || "-",
        });
      }
    } catch (error) {
      console.error("Error fetching sale data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const handleGeneratePDF = async () => {
    if (!printRef.current) return;

    setPdfGenerating(true);
    try {
      await generateInvoicePDF(
        sale,
        printRef.current,
        `INVOICE-${sale.id.substring(0, 8).toUpperCase()}.pdf`
      );
      alert("PDF가 성공적으로 생성되었습니다.");
    } catch (error) {
      console.error("PDF 생성 중 오류 발생:", error);
      alert("PDF 생성 중 오류가 발생했습니다.");
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleSendEmail = () => {
    // 이메일 전송 기능 구현 (실제로는 이메일 서비스 연동 필요)
    alert("이메일 전송 기능은 아직 구현되지 않았습니다.");
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "cash":
        return "현금";
      case "card":
        return "카드";
      case "bank":
        return "계좌이체";
      case "other":
        return "기타";
      default:
        return method;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "완료";
      case "pending":
        return "대기중";
      case "cancelled":
        return "취소";
      default:
        return status;
    }
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setFormData((prev) => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.name,
      contactPerson: customer.contacts?.[0] || null,
      contactPhone: customer.contacts?.[0]?.phone || "",
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          매출 정보를 찾을 수 없습니다
        </h2>
        <button
          onClick={() => navigate("/sales")}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <FiArrowLeft className="mr-2" />
          매출 목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate("/sales")}
          className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          <FiArrowLeft className="mr-2" />
          돌아가기
        </button>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showAdditionalInfo"
              checked={showAdditionalInfo}
              onChange={(e) => setShowAdditionalInfo(e.target.checked)}
              className="h-4 w-4 rounded border-input bg-background text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <label
              htmlFor="showAdditionalInfo"
              className="text-sm font-medium leading-none"
            >
              부가정보 표시
            </label>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <FiPrinter className="mr-2" />
            인쇄하기
          </button>

          <button
            onClick={handleGeneratePDF}
            disabled={pdfGenerating}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
          >
            <FiDownload className="mr-2" />
            {pdfGenerating ? "PDF 생성 중..." : "PDF 다운로드"}
          </button>

          <button
            onClick={handleSendEmail}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            <FiMail className="mr-2" />
            이메일 전송
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-0 print:shadow-none print:p-0">
        <InvoiceTemplate
          ref={printRef}
          sale={sale}
          companyInfo={companyInfo}
          getPaymentMethodText={getPaymentMethodText}
          getStatusText={getStatusText}
          showAdditionalInfo={showAdditionalInfo}
        />
      </div>
    </div>
  );
};

export default SalesInvoice;
