import React, { useEffect, useState } from "react";
import { Row, Col, Card, Spin, message, Button } from "antd";
import { useNavigate } from "react-router-dom"; // 페이지 이동을 위한 useNavigate 사용
import { useFirestoreQuery } from "../hooks/useFirestore"; // Firestore 커스텀 훅

const { Meta } = Card;

const ProductList = () => {
  const fetchProducts = useFirestoreQuery(); // Firestore 훅을 사용해 데이터 함수 불러오기
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅 사용

  const fetchData = async () => {
    setLoading(true);
    try {
      await fetchProducts.getDocuments("products", (data) => {
        setProducts(data);
        setError(null);
      });
    } catch (err) {
      message.error("데이터를 불러오는 중 오류가 발생했습니다.");
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Firestore에서 데이터를 가져오는 함수
  }, []);

  // 페이지 이동 함수
  const handleNavigate = (product) => {
    navigate("/estimate", {
      state: { id: product.id, modelName: product.모델명 }, // ID와 모델명 같이 전달
    });
  };

  if (loading) {
    return <Spin tip="Loading products..." />;
  }

  if (error) {
    return <p>데이터를 불러오는 중 오류가 발생했습니다.</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={[16, 16]}>
        {products.map((product) => (
          <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              cover={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "300px", // 이미지 영역 높이
                  }}
                >
                  <img
                    alt={product.모델명}
                    src={
                      product.검색모델img || "https://via.placeholder.com/300"
                    }
                    style={{
                      maxHeight: "100%",
                      maxWidth: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              }
              actions={[
                <Button onClick={() => handleNavigate(product)}>
                  대표견적 만들기
                </Button>, // 버튼 추가
              ]}
            >
              <Meta
                title={product.모델명}
                description={`입고가: ${product.입고가} / 재고: ${product.재고}`}
              />
              <p>CPU: {product.CPU}</p>
              <p>스토리지: {product.스토리지}</p>
              <p>메모리: {product.메모리}</p>
              <p>GPU: {product.GPU}</p>
              <p>Display: {product.Display}</p>
              <p>OS: {product.OS}</p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProductList;
