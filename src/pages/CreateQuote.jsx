import React, { useState, useEffect } from "react";
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
  DatePicker,
} from "antd";
import dayjs from "dayjs";
import { useFirestoreAddData, useFirestoreQuery } from "../hooks/useFirestore";
import ProductAddSection from "../components/createQuote/ProductAddSection";
import SelectedProductsList from "../components/createQuote/SelectedProductsList";
import ClientAddSection from "../components/createQuote/ClientAddSection";
import ProductSearchContent from "../components/createQuote/ProductSearchContent";
import ClientSearchContent from "../components/createQuote/ClientSearchContent";

const CreateQuote = () => {
  const [form] = Form.useForm();
  const searchStandardQuote = useFirestoreQuery();
  const addQuote = useFirestoreAddData();
  const [standardQuotes, setStandardQuotes] = useState([]);
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [quoteItems, setQuoteItems] = useState([]); // 추가된 제품들
  const [clientItem, setClientItem] = useState({}); // 선택된 고객사
  const [totalPrice, setTotalPrice] = useState(0); // 총 가격
  const [checkTax, setCheckTax] = useState(false); // 부가세 포함 여부
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [isClientModalVisible, setIsClientModalVisible] = useState(false);
  const [quoteDate, setQuoteDate] = useState(dayjs()); // 작성일자 (DatePicker용 dayjs 객체)
  const [quoteNumber, setQuoteNumber] = useState(""); // 문서번호

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
    generateQuoteNumber(dayjs()); // 처음 렌더링 시 오늘 날짜로 문서번호 생성
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
    const addAmountProduct = { ...product, amount: 1 };
    setQuoteItems((prev) => [...prev, addAmountProduct]); // 기존 제품에 새 제품 추가
    setIsProductModalVisible(false); // 제품 모달 닫기
  };

  // 고객사 선택 핸들러 (선택된 고객사를 clientItem에 저장)
  const handleClientSelect = (client) => {
    setClientItem(() => ({ ...client })); // 선택된 고객사 저장
    setIsClientModalVisible(false); // 고객사 모달 닫기
  };

  // 문서번호 생성 함수
  const generateQuoteNumber = async (date) => {
    const formattedDate = dayjs(date).format("YYYYMMDD"); // yyyymmdd 형식으로 날짜 포맷
    let count = 0;

    try {
      // getDocuments를 사용하여 quotes 컬렉션의 문서들을 불러옴
      await searchStandardQuote.getDocuments("quotes", (data) => {
        // 문서번호가 Q-yyyymmdd로 시작하는 항목들 필터링
        const filteredQuotes = data.filter((doc) =>
          doc.quoteNumber?.startsWith(`Q-${formattedDate}`)
        );
        count = filteredQuotes.length + 1; // 같은 날짜의 문서 개수 + 1 (새로운 순번)
      });
    } catch (error) {
      message.error("문서번호를 생성하는데 오류가 발생했습니다.");
    }

    const newQuoteNumber = `Q-${formattedDate}-${String(count).padStart(
      3,
      "0"
    )}`; // Q-yyyymmdd-순번 형태로 문서번호 생성
    setQuoteNumber(newQuoteNumber); // 문서번호 설정
    return newQuoteNumber;
  };

  // 작성일자 변경 시 문서번호 재생성
  const handleDateChange = async (date) => {
    setQuoteDate(date);
    await generateQuoteNumber(date); // 새로운 작성일에 맞춰 문서번호 생성
  };

  // 폼 제출 핸들러
  const handleSubmit = async (values) => {
    const newQuoteNumber = await generateQuoteNumber(quoteDate); // 문서번호 생성

    const submitData = {
      ...values,
      quoteNumber: newQuoteNumber, // 문서번호 포함
      quoteDate: dayjs(quoteDate).format("YYYY-MM-DD"), // 작성일자 포함
      quoteItems, // 추가된 제품 정보
      totalPrice, // 총 가격
      client: clientItem, // 선택된 고객사 정보
    };

    addData(submitData);
  };

  const addData = async (value) => {
    try {
      await addQuote.addData("quotes", value, () => {
        message.success("견적서가 성공적으로 제출되었습니다.");
        console.log("제출 데이터:", value);
      });
    } catch (error) {
      message.success("견적서 제출에 실패했습니다.");
      console.log(error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Row gutter={16}>
          {/* 작성일자 및 문서번호 */}
          <Col span={24}>
            <Form.Item label="작성일자">
              <DatePicker
                value={quoteDate}
                onChange={(date) => handleDateChange(date)}
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item label="문서번호">
              <Input value={quoteNumber} readOnly />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          {/* 고객사 정보 추가 섹션 */}
          <Col span={12}>
            <ClientAddSection
              form={form}
              clientItem={clientItem}
              showClientSearchModal={() => setIsClientModalVisible(true)}
            />
          </Col>
          <Col span={12}>
            {/* 제품 추가 섹션 */}
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
