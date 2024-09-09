import React, { useRef } from "react";
import { useLocation } from "react-router-dom";
import { Card, Button, Row, Col } from "antd";
import html2pdf from "html2pdf.js";
import logo from "../assets/logo/jncore_logo.png";
import "../styles/print.css";
import { rawDataReduceObject } from "../utils/initializeTemplateFields";
import { estimateTemplates } from "../commons/QuoteTemplate";

const JncoreQuote = () => {
  const location = useLocation();
  const { quote } = location.state || {};
  const quoteRef = useRef();

  if (!quote) {
    return <div>No data available</div>;
  }

  console.log(quote);
  const values = rawDataReduceObject(quote.quoteItems[0], estimateTemplates);
  console.log(values);

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
    <div className="flex w-full h-full justify-center items-start ">
      <div className="a4-container bg-red-200" ref={quoteRef}>
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
        <Row className="mb-2">
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
        <Row className="mb-0 " style={{ color: "#002060" }}>
          <Col span={1} className=" flex justify-center items-center">
            <p className="font-bold">#</p>
          </Col>
          <Col span={14} className="px-4 flex justify-start items-center">
            <p className="font-bold" style={{ fontSize: "15px" }}>
              제 품 정 보
            </p>
          </Col>
          <Col span={3} className="flex justify-center items-center">
            <p className="font-bold" style={{ fontSize: "15px" }}>
              수량
            </p>
          </Col>{" "}
          <Col span={3} className="px-4 flex justify-end items-center">
            <p className="font-bold" style={{ fontSize: "15px" }}>
              단가
            </p>
          </Col>{" "}
          <Col span={3} className="px-4 flex justify-end items-center">
            <p className="font-bold" style={{ fontSize: "15px" }}>
              금액
            </p>
          </Col>
        </Row>
        {quote?.quoteItems?.length > 0 &&
          quote.quoteItems.map((product, pIdx) => {
            const { model, amount, price } = product;

            const rowPrice = price?.value ? parseInt(price.value) * amount : 0;
            const items = rawDataReduceObject(product, estimateTemplates);

            return (
              <>
                <Row
                  className="py-2"
                  style={{ height: "42px", color: "#002060" }}
                >
                  <Col span={1} className=" flex justify-center items-center">
                    <p>{pIdx + 1}</p>
                  </Col>
                  <Col
                    span={14}
                    style={{ backgroundColor: "#F2F2F2" }}
                    className="px-4 flex justify-start items-center"
                  >
                    <p className="font-semibold">{model.value}</p>
                  </Col>
                  <Col
                    span={3}
                    style={{ backgroundColor: "#F2F2F2" }}
                    className="flex justify-center items-center"
                  >
                    <p>{amount}</p>
                  </Col>
                  <Col
                    span={3}
                    style={{ backgroundColor: "#F2F2F2" }}
                    className="pr-2 flex justify-end items-center"
                  >
                    <p>{price.value?.toLocaleString() || ""}</p>
                  </Col>
                  <Col
                    span={3}
                    style={{ backgroundColor: "#F2F2F2" }}
                    className="pr-2 flex justify-end items-center"
                  >
                    <p>{rowPrice.toLocaleString()}</p>
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
                          className="py-0"
                          style={{
                            height: "22px",
                            backgroundColor: "#fff",
                            color: "#353535",
                          }}
                        >
                          <Col
                            span={1}
                            className=" flex justify-center items-center"
                          ></Col>
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
    </div>
  );
};

export default JncoreQuote;
