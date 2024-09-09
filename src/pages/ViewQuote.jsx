import React, { useRef } from "react";
import { useLocation } from "react-router-dom";
import { Card, Button } from "antd";
import html2pdf from "html2pdf.js";

const ViewQuote = () => {
  const location = useLocation();
  const { quote } = location.state || {};
  const quoteRef = useRef();
  console.log(quote);

  if (!quote) {
    return <div>No data available</div>;
  }

  // PDF 생성 함수
  const handleExportPDF = () => {
    const element = quoteRef.current;
    const opt = {
      margin: 1,
      filename: `${quote.quoteNumber}.pdf`,
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    // html2pdf 사용
    html2pdf()
      .from(element)
      .set(opt)
      .toPdf()
      .get("pdf")
      .then((pdf) => {
        pdf.save();
      });
  };

  return (
    <div>
      <div ref={quoteRef}>
        <Card title={`견적서 번호: ${quote.quoteNumber}`} bordered={false}>
          <p>
            <strong>작성일자:</strong> {quote.quoteDate}
          </p>
          <p>
            <strong>거래처명:</strong> {quote.businessName}
          </p>
          <p>
            <strong>담당자:</strong> {quote.personName}
          </p>
          <p>
            <strong>총 금액:</strong> {quote.totalPrice.toLocaleString()} 원
          </p>

          <h3>제품 리스트:</h3>
          {quote.quoteItems.map((item, index) => (
            <Card key={index} style={{ marginBottom: 20 }}>
              <p>
                <strong>모델명:</strong> {item.model.value}
              </p>
              <p>
                <strong>수량:</strong> {item.amount}
              </p>
              <p>
                <strong>가격:</strong> {item.price.value.toLocaleString()} 원
              </p>
            </Card>
          ))}
        </Card>
      </div>

      <Button type="primary" onClick={handleExportPDF}>
        PDF로 변환
      </Button>
    </div>
  );
};

export default ViewQuote;
