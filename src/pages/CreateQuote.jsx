import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  message,
  Row,
  Col,
  Modal,
  Input,
  Checkbox,
  Card,
  Button,
} from "antd";
import { useFirestoreQuery } from "../hooks/useFirestore";
import ProductAddSection from "../components/createQuote/ProductAddSection";
import SelectedProductsList from "../components/createQuote/SelectedProductsList";
import ClientAddSection from "../components/createQuote/ClientAddSection";
import ProductSearchContent from "../components/createQuote/ProductSearchContent";
import ClientSearchContent from "../components/createQuote/ClientSearchContent";

const CreateQuote = () => {
  const [form] = Form.useForm();
  const searchStandardQuote = useFirestoreQuery();
  const [standardQuotes, setStandardQuotes] = useState([]);
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [quoteItems, setQuoteItems] = useState([]); // 추가된 제품들
  const [clientItem, setClientItem] = useState({}); // 선택된 고객사
  const [totalPrice, setTotalPrice] = useState(0); // 총 가격
  const [checkTax, setCheckTax] = useState(false); // 부가세 포함 여부
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [isClientModalVisible, setIsClientModalVisible] = useState(false);

  // 기초 데이터 불러오기 함수 (견적 템플릿을 불러옴)
  const fetchQuotes = async () => {
    try {
      await searchStandardQuote.getDocuments("standard_quote", (data) => {
        setStandardQuotes(data);
      });
    } catch (error) {
      message.error("데이터를 불러오는데 오류가 발생했습니다.");
    }
  };

  // 견적 템플릿 데이터 불러오기
  useEffect(() => {
    fetchQuotes();
  }, []);

  // 총 가격 및 부가세 계산 함수
  useEffect(() => {
    const totalValue = quoteItems.reduce((total, item) => {
      const priceValue = Number(item.price?.value) || 0; // 가격이 없으면 0
      const amount = item.amount != null ? Number(item.amount) : 1; // 수량이 없으면 1
      return total + priceValue * amount;
    }, 0);

    const taxPrice = checkTax ? totalValue * 0.1 : 0; // 부가세 포함 여부에 따른 계산
    setTotalPrice(totalValue + taxPrice); // 최종 가격 설정
  }, [quoteItems, checkTax]);

  // 제품 검색 핸들러
  const handleProductSearch = (searchValue) => {
    const upperKeyword = searchValue.toUpperCase();
    const searchResult = standardQuotes.filter((data) =>
      data.searchKeyword.toUpperCase().includes(upperKeyword)
    );
    setProductSearchResults(searchResult); // 검색 결과 업데이트
  };

  // 제품 선택 핸들러 (선택된 제품을 quoteItems에 추가)
  const handleProductSelect = (product) => {
    //console.log(product);
    setQuoteItems((prev) => [...prev, product]); // 기존 제품에 새 제품 추가
    setIsProductModalVisible(false); // 제품 모달 닫기
  };

  // 고객사 선택 핸들러 (선택된 고객사를 clientItem에 저장)
  const handleClientSelect = (client) => {
    setClientItem(() => ({ ...client })); // 선택된 고객사 저장
    setIsClientModalVisible(false); // 고객사 모달 닫기
  };

  // 폼 제출 핸들러
  const handleSubmit = (values) => {
    console.log(values);
    const submitData = {
      ...values,
      quoteItems, // 추가된 제품 정보
      totalPrice, // 총 가격
      client: clientItem, // 선택된 고객사 정보
    };

    message.success("견적서가 성공적으로 제출되었습니다.");
    console.log("제출 데이터:", submitData); // 폼 데이터를 콘솔에 출력
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>견적서 입력 폼</h2>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Row gutter={16}>
          {/* 고객사 정보 추가 섹션 */}
          <Col span={12}>
            <ClientAddSection
              form={form}
              clientItem={clientItem}
              showClientSearchModal={() => setIsClientModalVisible(true)}
            />
          </Col>

          {/* 제품 추가 섹션 */}
          <Col span={12}>
            <ProductAddSection
              form={form}
              handleProductSelect={handleProductSelect}
              showProductSearchModal={() => setIsProductModalVisible(true)}
            />
          </Col>
        </Row>

        {/* 추가된 제품 리스트 */}
        <SelectedProductsList
          quoteItems={quoteItems}
          setQuoteItems={setQuoteItems}
        />

        {/* 결제 정보 섹션 */}
        <Card title="결제 정보" bordered={false}>
          <Form.Item
            name="includeTax"
            valuePropName="checked"
            initialValue={false}
          >
            <Checkbox
              checked={checkTax}
              onChange={(e) => setCheckTax(e.target.checked)}
            >
              부가세 포함
            </Checkbox>
          </Form.Item>
          <h3>총 금액: {totalPrice.toLocaleString()} 원</h3>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              제출
            </Button>
          </Form.Item>
        </Card>
      </Form>

      {/* 제품 검색 모달 */}
      <Modal
        title="제품 검색"
        visible={isProductModalVisible}
        onCancel={() => setIsProductModalVisible(false)}
        footer={null}
      >
        <ProductSearchContent
          onSearch={handleProductSearch}
          onSelect={handleProductSelect}
          searchResults={productSearchResults}
        />
      </Modal>

      {/* 고객사 검색 모달 */}
      <Modal
        title="고객사 검색"
        visible={isClientModalVisible}
        onCancel={() => setIsClientModalVisible(false)}
        footer={null}
      >
        <ClientSearchContent handleClientSelect={handleClientSelect} />
      </Modal>
    </div>
  );
};

export default CreateQuote;
