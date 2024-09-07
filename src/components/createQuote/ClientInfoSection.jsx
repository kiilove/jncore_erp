import { Col, Row } from "antd";
import React from "react";

const ClientInfoSection = ({ clientItem }) => {
  console.log(clientItem);
  return (
    <>
      <Row gutter={16}>
        <Col span={4}>
          <span>고객사</span>
        </Col>
        <Col span={20}>{clientItem?.company?.거래처상호}</Col>
      </Row>
      <Row gutter={16}>
        <Col span={4}>
          <span>담당자</span>
        </Col>
        <Col span={20}>{clientItem?.person?.성명}</Col>
      </Row>
      <Row gutter={16}>
        <Col span={4}>
          <span>연락처</span>
        </Col>
        <Col span={20}>{clientItem?.person?.전화번호}</Col>
      </Row>
      <Row gutter={16}>
        <Col span={4}>
          <span>이메일</span>
        </Col>
        <Col span={20}>{clientItem?.person?.이메일}</Col>
      </Row>
    </>
  );
};

export default ClientInfoSection;
