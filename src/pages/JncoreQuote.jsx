import React, { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Row, Col } from "antd";
import html2pdf from "html2pdf.js";
import logo from "../assets/logo/jncore_logo.png";
import "../styles/print.css";
import { rawDataReduceObject } from "../utils/initializeTemplateFields";
import { estimateTemplates } from "../commons/QuoteTemplate";
import ReactToPrint from "react-to-print";
import { useEffect } from "react";

const JncoreQuote = () => {
  const [model, setModel] = useState("UnnamedModel");
  const [originalTitle, setOriginalTitle] = useState(document.title);
  const location = useLocation();
  const { quote } = location.state || {};
  const quoteRef = useRef();

  useEffect(() => {
    if (quote?.quoteItems?.length > 0) {
      const modelValue = quote.quoteItems[0]?.model?.value || "UnnamedModel";
      setModel(modelValue); // 모델명을 상태로 설정
    }
  }, [quote]);
  if (!quote) {
    return <div>No data available</div>;
  }

  const values = rawDataReduceObject(quote.quoteItems[0], estimateTemplates);

  // 파일 이름 생성 함수 (인자값으로 모델명을 받아서 처리)
  const getFileName = (model) => {
    const businessName = quote.businessName || "UnnamedBusiness";
    const personName = quote.personName || "UnknownPerson";
    const quoteDate = quote.quoteDate || "UnknownDate";

    return `${businessName}_${model}_${personName}_${quoteDate}.pdf`;
  };

  // PDF 생성 함수
  const handleExportPDF = () => {
    const element = quoteRef.current;
    const opt = {
      margin: 1,
      filename: getFileName(model), // 모델명을 state에서 가져와서 파일 이름으로 사용
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf()
      .from(element)
      .set(opt)
      .toPdf()
      .get("pdf")
      .then((pdf) => {
        pdf.save(getFileName(model)); // 파일 이름으로 PDF 저장
      });
  };
  // 출력 전에 타이틀을 임시로 변경
  const handleBeforePrint = () => {
    const newTitle = getFileName(model).replace(".pdf", ""); // 확장자 제거
    document.title = newTitle; // 타이틀 변경
  };

  // 출력 후에 원래 타이틀로 복원
  const handleAfterPrint = () => {
    document.title = originalTitle; // 원래 타이틀로 복구
  };

  return (
    <div className="flex w-full h-full justify-center items-start ">
      <div className="a4-container" ref={quoteRef}>
        <Row className="w-full mb-2">
          <Col span={6}>
            <div className="flex w-full h-full justify-center items-center">
              <img src={logo} style={{ width: "110px" }} alt="logo" />
            </div>
          </Col>
          <Col span={2}></Col>
          <Col span={16}>
            <div className="flex flex-col justify-end items-start px-5 gap-y-1">
              <div
                className="flex w-full justify-end items-center font-semibold"
                style={{ fontSize: "14px", color: "#002060" }}
              >
                제이앤코어 | 854-16-00126 | 대표 김 진 배
              </div>
              <div
                className="flex w-full justify-end items-center font-normal"
                style={{ fontSize: "14px", color: "#002060" }}
              >
                경기도 안양시 동안구 엘에스로 142 (호계동, 금정역SKV1) 803호
              </div>
              <div
                className="flex w-full justify-end items-center font-normal"
                style={{ fontSize: "14px", color: "#002060" }}
              >
                T:070-7555-3695 | F:031-454-3695 | www.jncore.com
              </div>
            </div>
          </Col>
        </Row>
        <Row className="mb-2" style={{ height: "6px" }}>
          <Col span={6} style={{ backgroundColor: "#5B9BD5" }}></Col>
          <Col span={18} style={{ backgroundColor: "#002060" }}></Col>
        </Row>
        <Row className="mb-3">
          <Col span={12}>
            <div className="flex flex-col w-full h-full justify-start items-start px-2">
              <div className="flex w-full h-full justify-start items-center">
                <h3
                  className="font-bold"
                  style={{
                    fontSize: "28px",
                    letterSpacing: "10px",
                    color: "#002060",
                  }}
                >
                  견 적 서
                </h3>
              </div>
              <div className="flex w-full h-full justify-start items-center">
                <h5 className="font-normal" style={{ fontSize: "14px" }}>
                  문서번호: {quote?.quoteNumber || ""}
                </h5>
              </div>
              <div className="flex w-full h-full justify-start items-center">
                <h5 className="font-normal" style={{ fontSize: "14px" }}>
                  견적일자: {quote?.quoteDate || ""}
                </h5>
              </div>
              <div className="flex w-full h-full justify-start items-center">
                <h5 className="font-normal" style={{ fontSize: "14px" }}>
                  담당직원: 김진배 팀장 (010-4643-3464)
                </h5>
              </div>
            </div>
          </Col>

          <Col span={12}>
            <div
              className="flex w-full h-full justify-start items-start flex-col px-2"
              style={{ color: "#3A3838" }}
            >
              <div
                className="flex w-full justify-end items-end gap-x-4 "
                style={{ height: "45px" }}
              >
                <h4 className="font-bold" style={{ fontSize: "20px" }}>
                  {quote.businessName}
                </h4>
                <h5 style={{ fontSize: "15px" }}>귀중</h5>
              </div>
              <div
                className="flex w-full justify-end items-end"
                style={{ height: "25px" }}
              >
                <h5
                  className="font-bold"
                  style={{ fontSize: "15px", letterSpacing: "2px" }}
                >
                  {quote?.personName || ""}
                </h5>
              </div>
              <div
                className="flex w-full justify-end items-end "
                style={{ height: "25px" }}
              >
                <h5 className="font-normal" style={{ fontSize: "14px" }}>
                  {quote?.personEmail || ""}
                </h5>
              </div>
              <div
                className="flex w-full justify-end items-end gap-x-4 "
                style={{ height: "25px" }}
              >
                <h5 className="font-normal" style={{ fontSize: "14px" }}>
                  {quote?.personTel || ""}
                </h5>
              </div>
            </div>
          </Col>
        </Row>
        <Row className="mb-1 " style={{ color: "#002060" }}>
          <Col span={1} className=" flex justify-center items-center">
            <p className="font-bold">#</p>
          </Col>
          <Col span={14} className="px-4 flex justify-start items-center">
            <p className="font-bold" style={{ fontSize: "14px" }}>
              제 품 정 보
            </p>
          </Col>
          <Col span={3} className="flex justify-center items-center">
            <p className="font-bold" style={{ fontSize: "14px" }}>
              수량
            </p>
          </Col>{" "}
          <Col span={3} className="px-4 flex justify-end items-center">
            <p className="font-bold" style={{ fontSize: "14px" }}>
              단가
            </p>
          </Col>{" "}
          <Col span={3} className="px-4 flex justify-end items-center">
            <p className="font-bold" style={{ fontSize: "14px" }}>
              금액
            </p>
          </Col>
        </Row>
        {/* 제품 목록 */}
        {quote?.quoteItems?.length > 0 &&
          quote.quoteItems.map((product, pIdx) => {
            const { model, amount, price } = product;
            const rowPrice = price?.value ? parseInt(price.value) * amount : 0;
            const items = rawDataReduceObject(product, estimateTemplates);

            return (
              <>
                <Row
                  className="my-2"
                  style={{
                    height: "35px",
                    color: "#002060",
                    lineHeight: "35px",
                    textAlign: "center",
                  }}
                >
                  <Col span={1}>
                    <p>{pIdx + 1}</p>
                  </Col>
                  <Col
                    span={14}
                    style={{
                      backgroundColor: "#F2F2F2",
                      textAlign: "left",
                      padding: "0 10px",
                    }}
                  >
                    <p className="font-semibold" style={{ margin: 0 }}>
                      {model.value}
                    </p>
                  </Col>
                  <Col span={3} style={{ backgroundColor: "#F2F2F2" }}>
                    <p style={{ margin: 0 }}>{amount}</p>
                  </Col>
                  <Col
                    span={3}
                    style={{
                      backgroundColor: "#F2F2F2",
                      textAlign: "right",
                      paddingRight: "8px",
                    }}
                  >
                    <p style={{ margin: 0 }}>
                      {price.value?.toLocaleString() || ""}
                    </p>
                  </Col>
                  <Col
                    span={3}
                    style={{
                      backgroundColor: "#F2F2F2",
                      textAlign: "right",
                      paddingRight: "8px",
                    }}
                  >
                    <p style={{ margin: 0 }}>{rowPrice.toLocaleString()}</p>
                  </Col>
                </Row>

                {items?.length > 0 &&
                  items
                    .filter(
                      (f) =>
                        f.key !== "brand" &&
                        f.key !== "model" &&
                        f.key !== "price"
                    )
                    .map((item, iIdx) => {
                      const { label, value } = item;
                      return (
                        <Row
                          key={iIdx}
                          className="py-0"
                          style={{
                            height: "22px",
                            backgroundColor: "#fff",
                            color: "#353535",
                            lineHeight: "22px",
                          }}
                        >
                          <Col span={1}></Col>
                          <Col
                            span={23}
                            className="px-4 flex justify-start items-center"
                          >
                            <p className="font-normal" style={{ fontSize: 13 }}>
                              {label}: {value}
                            </p>
                          </Col>
                        </Row>
                      );
                    })}
              </>
            );
          })}
      </div>
      <Button onClick={handleExportPDF}>Export as PDF</Button>
      {/* react-to-print를 사용하여 출력 버튼 추가 */}
      <ReactToPrint
        trigger={() => <Button>Export as PDF/Print</Button>}
        content={() => quoteRef.current}
        pageStyle={`@page { margin: 1cm; }`}
        onBeforePrint={handleBeforePrint} // 출력 전에 타이틀 변경
        onAfterPrint={handleAfterPrint} // 출력 후 타이틀 복구
      />
    </div>
  );
};

export default JncoreQuote;
