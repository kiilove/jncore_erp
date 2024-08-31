import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Checkbox,
  InputNumber,
  message,
  Card,
  Row,
  Col,
  Modal,
  List,
} from "antd";
import { useLocation } from "react-router-dom";
import { useFirestoreQuery } from "../hooks/useFirestore";
import { estimateTemplates } from "../commons/QuoteTemplate";

const { Option } = Select;

const CreateQuote = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const searchStandardQuote = useFirestoreQuery();

  const [products, setProducts] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [manualInput, setManualInput] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [standardQuotes, setStandardQuotes] = useState([]);
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [quoteItems, setQuoteItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [checkTax, setCheckTax] = useState(false);

  // 제품 초기화
  useEffect(() => {
    const initialProduct = location.state?.product;
    if (initialProduct) {
      setProducts([initialProduct]);
      setTotalAmount(initialProduct.quantity * initialProduct.unitPrice);
    }
  }, [location.state]);

  // 표준 견적 데이터 불러오기
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        await searchStandardQuote.getDocuments("standard_quote", (data) => {
          setStandardQuotes(data);
        });
      } catch (error) {
        message.error("데이터를 불러오는데 오류가 발생했습니다.");
      }
    };
    fetchQuotes();
  }, [searchStandardQuote]);

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

  // 제품 추가 핸들러
  const handleAddProduct = (values) => {
    const newProduct = {
      ...values,
      totalPrice: values.quantity * values.unitPrice,
    };
    setProducts((prev) => [...prev, newProduct]);
    setTotalAmount((prev) => prev + newProduct.totalPrice);
    form.resetFields(["productName", "productType", "quantity", "unitPrice"]);
  };

  // 제품 제거 핸들러
  const handleRemoveProduct = (index) => {
    setProducts((prev) =>
      prev.filter((_, i) => i !== index).map((product) => product)
    );
    setTotalAmount((prev) =>
      products.reduce((acc, product) => acc + product.totalPrice, 0)
    );
  };

  // 제품 검색
  const searchProducts = (keyword) => {
    const upperKeyword = keyword.toUpperCase();
    return standardQuotes.filter((data) =>
      data.searchKeyword.toUpperCase().includes(upperKeyword)
    );
  };

  // 제품 선택 핸들러
  const handleProductSelect = (product) => {
    setQuoteItems((prev) => [...prev, product]);
    setIsModalVisible(false);
  };

  // 폼 제출 핸들러
  const handleSubmit = (values) => {
    message.success("견적서가 성공적으로 제출되었습니다.");
    console.log("제출 데이터:", { ...values, products, totalAmount });
  };

  const handleProductSearch = (searchValue) => {
    // 대문자로 변환된 검색어로 검색
    const upperKeyword = searchValue.toUpperCase();

    const searchResult = standardQuotes.filter((data) =>
      data.searchKeyword.toUpperCase().includes(upperKeyword)
    );

    setProductSearchResults(searchResult);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>견적서 입력 폼</h2>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Card
              title="고객사 정보"
              bordered={false}
              style={{ marginBottom: 16 }}
            >
              <Form.Item
                label="고객명"
                name="customerName"
                rules={[{ required: true, message: "고객명을 입력하세요." }]}
              >
                <Input placeholder="고객명을 입력하세요" />
              </Form.Item>
              <Form.Item
                label="연락처"
                name="contact"
                rules={[{ required: true, message: "연락처를 입력하세요." }]}
              >
                <Input placeholder="연락처를 입력하세요" />
              </Form.Item>
              <Form.Item
                label="이메일"
                name="email"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "유효한 이메일을 입력하세요.",
                  },
                ]}
              >
                <Input placeholder="이메일을 입력하세요" />
              </Form.Item>
            </Card>
          </Col>

          <Col span={12}>
            <Card
              title="제품 추가"
              bordered={false}
              style={{ marginBottom: 16 }}
            >
              <Form.Item>
                <Checkbox
                  checked={manualInput}
                  onChange={(e) => setManualInput(e.target.checked)}
                >
                  제품 수동 입력
                </Checkbox>
              </Form.Item>

              {!manualInput ? (
                <Form.Item label="제품 검색" name="productName">
                  <Input
                    placeholder="제품을 검색하세요"
                    onClick={() => setIsModalVisible(true)}
                  />
                </Form.Item>
              ) : (
                <>
                  <Form.Item
                    label="제품명"
                    name="productName"
                    rules={[
                      { required: true, message: "제품명을 입력하세요." },
                    ]}
                  >
                    <Input placeholder="제품명을 입력하세요" />
                  </Form.Item>
                  <Form.Item
                    label="제품 종류"
                    name="productType"
                    rules={[
                      { required: true, message: "제품 종류를 선택하세요." },
                    ]}
                  >
                    <Select placeholder="제품 종류를 선택하세요">
                      <Option value="laptop">노트북</Option>
                      <Option value="desktop">데스크탑</Option>
                      <Option value="server">서버</Option>
                      <Option value="other">기타</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label="수량"
                    name="quantity"
                    rules={[{ required: true, message: "수량을 입력하세요." }]}
                  >
                    <InputNumber min={1} placeholder="수량을 입력하세요" />
                  </Form.Item>
                  <Form.Item
                    label="단가"
                    name="unitPrice"
                    rules={[{ required: true, message: "단가를 입력하세요." }]}
                  >
                    <InputNumber min={0} placeholder="단가를 입력하세요" />
                  </Form.Item>
                </>
              )}

              <Button type="dashed" onClick={form.submit} block>
                제품 추가
              </Button>
            </Card>
          </Col>
        </Row>

        <Card
          title="선택된 제품 목록"
          bordered={false}
          style={{ marginBottom: 16 }}
        >
          <List
            itemLayout="vertical"
            dataSource={quoteItems}
            renderItem={(product, index) => (
              <List.Item key={index}>
                <Card title={product?.model?.value}>
                  {Object.keys(product)
                    .filter((key) => product[key]?.value !== undefined)
                    .sort((a, b) => product[a].order - product[b].order)
                    .map((key, kIdx) => {
                      const { value } = product[key];
                      const label =
                        estimateTemplates[product.타입][key]?.ko || key;

                      if (key === "model" || key === "price") return null;

                      return (
                        <Row gutter={16} className="px-5 mb-2" key={kIdx}>
                          <Col span={6}>
                            <strong>{label}:</strong>
                          </Col>
                          <Col span={18}>
                            <p>{value}</p>
                          </Col>
                        </Row>
                      );
                    })}
                  <Row gutter={16} className="px-5 mt-5 mb-3">
                    <Col span={6}>
                      <strong>수량:</strong>
                    </Col>
                    <Col span={18}>
                      <Input
                        style={{ width: "200px" }}
                        defaultValue={1}
                        onChange={(e) => {
                          const newProduct = { ...quoteItems[index] };
                          newProduct.amount = e.target.value;

                          const newQuoteItems = [...quoteItems];
                          newQuoteItems.splice(index, 1, newProduct);
                          setQuoteItems([...newQuoteItems]);
                        }}
                      />
                    </Col>
                  </Row>
                  <Row gutter={16} className="px-5">
                    <Col span={6}>
                      <strong>금액:</strong>
                    </Col>
                    <Col span={18}>
                      <Input
                        style={{ width: "200px" }}
                        defaultValue={product.price.value}
                        onChange={(e) => {
                          const newProduct = { ...quoteItems[index] };
                          newProduct.price.value = e.target.value;

                          const newQuoteItems = [...quoteItems];
                          newQuoteItems.splice(index, 1, newProduct);
                          setQuoteItems([...newQuoteItems]);
                        }}
                      />
                    </Col>
                  </Row>
                </Card>
              </List.Item>
            )}
          />
        </Card>

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
        visible={isModalVisible}
        onCancel={() => {
          if (searchInputRef?.current) {
            searchInputRef.current.input.value = "";
          }
          setProductSearchResults([]);
          setIsModalVisible(false);
        }}
        footer={null}
      >
        <Input.Search
          placeholder="제품명을 입력하세요"
          ref={searchInputRef}
          onSearch={handleProductSearch}
          style={{ marginBottom: 8 }}
        />
        <List
          bordered
          dataSource={productSearchResults}
          renderItem={(product) => (
            <List.Item onClick={() => handleProductSelect(product)}>
              {product?.model?.value}
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default CreateQuote;
