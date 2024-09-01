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
  List,
  Button,
} from "antd";
import { useLocation } from "react-router-dom";
import { useFirestoreQuery } from "../hooks/useFirestore";
import CustomerInfoForm from "../components/createQuote/CustomerInfoForm";
import ProductAddSection from "../components/createQuote/ProductAddSection";
import SelectedProductsList from "../components/createQuote/SelectedProductsList";
import { estimateTemplates } from "../commons/QuoteTemplate";
import ClientAddSection from "../components/createQuote/ClientAddSection";
import ProductSearchContent from "../components/createQuote/ProductSearchContent";
import ClientSearchContent from "../components/createQuote/ClientSearchContent";

const CreateQuote = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const searchStandardQuote = useFirestoreQuery();
  const searchClients = useFirestoreQuery();

  const [standardQuotes, setStandardQuotes] = useState([]);
  const [clients, setClients] = useState([]);
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [clientResults, setClientSearchResults] = useState([]);
  const [quoteItems, setQuoteItems] = useState([]);
  const [clientItem, setClientItem] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [checkTax, setCheckTax] = useState(false);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [isClientModalVisible, setIsClientModalVisible] = useState(false);

  // 고객사 정보 수동 입력 상태
  const [customerManualInput, setCustomerManualInput] = useState(false);
  // 제품 정보 수동 입력 상태
  const [productManualInput, setProductManualInput] = useState(false);

  const fetchQuotes = async () => {
    try {
      await searchStandardQuote.getDocuments("standard_quote", (data) => {
        console.log(data);
        setStandardQuotes(data);
      });
    } catch (error) {
      message.error("데이터를 불러오는데 오류가 발생했습니다.");
    }
  };

  // 기초 데이터 불러오기
  useEffect(() => {
    fetchQuotes();
  }, []);

  // 총 가격 계산
  useEffect(() => {
    const totalValue = quoteItems.reduce((total, item) => {
      const priceValue = Number(item.price?.value) || 0;
      const amount = item.amount != null ? Number(item.amount) : 1;
      return total + priceValue * amount;
    }, 0);

    const taxPrice = checkTax ? 0 : totalValue * 0.1;
    setTotalPrice(totalValue + taxPrice);
  }, [quoteItems, checkTax]);

  // 제품 검색 핸들러
  const handleProductSearch = (searchValue) => {
    const upperKeyword = searchValue.toUpperCase();
    const searchResult = standardQuotes.filter((data) =>
      data.searchKeyword.toUpperCase().includes(upperKeyword)
    );
    setProductSearchResults(searchResult);
  };

  // 제품 선택 핸들러
  const handleProductSelect = (product) => {
    setQuoteItems((prev) => [...prev, product]);
    setIsProductModalVisible(false); // 제품 모달 닫기
  };

  // 제품 선택 핸들러
  const handleClientSelect = (client) => {
    //setQuoteItems((prev) => [...prev, product]);
    setClientItem(() => ({ ...client }));
    setIsClientModalVisible(false); // 제품 모달 닫기
  };

  // 폼 제출 핸들러
  const handleSubmit = (values) => {
    message.success("견적서가 성공적으로 제출되었습니다.");
    console.log("제출 데이터:", { ...values, quoteItems, totalPrice });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>견적서 입력 폼</h2>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <ClientAddSection
              form={form}
            
              manualInput={customerManualInput}
              setManualInput={setCustomerManualInput}
              showClientSearchModal={() => setIsClientModalVisible(true)}
            />
          </Col>

          <Col span={12}>
            <ProductAddSection
              form={form}
              manualInput={productManualInput}
              setManualInput={setProductManualInput}
              showProductSearchModal={() => setIsProductModalVisible(true)}
            />
          </Col>
        </Row>

        <SelectedProductsList
          quoteItems={quoteItems}
          setQuoteItems={setQuoteItems}
          estimateTemplates={estimateTemplates}
        />

        {/* 결제 정보 섹션 */}
        <Card title="결제 정보" bordered={false}>
          <Form.Item name="includeTax" valuePropName="checked">
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
        onCancel={() => {
          setProductSearchResults([]);
          setIsProductModalVisible(false);
        }}
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
        onCancel={() => {
          setIsClientModalVisible(false);
          // 필요한 경우 모달이 닫힐 때의 추가 처리
        }}
        footer={null}
      >
        <ClientSearchContent handleClientSelect={handleClientSelect} />
      </Modal>
    </div>
  );
};

export default CreateQuote;
