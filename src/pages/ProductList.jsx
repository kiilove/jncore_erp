import React, { useEffect, useState } from "react";
import { Row, Col, Card, Spin, message, Button, Input, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { useFirestoreQuery } from "../hooks/useFirestore";
import ProductCard from "../components/ProductCard";

const { Meta } = Card;
const { Search } = Input;
const { Option } = Select;

const ProductList = () => {
  const fetchProducts = useFirestoreQuery();
  const fetchStandardQuote = useFirestoreQuery();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]); // 필터링된 제품 상태
  const [modelGroups, setModelGroups] = useState([]); // 모델 그룹 상태
  const [standardQuote, setStandardQuote] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const [selectedGroup, setSelectedGroup] = useState(null); // 선택된 그룹

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      await fetchProducts.getDocuments("products", async (data) => {
        setProducts(data);
        setFilteredProducts(data); // 필터링된 제품 초기화

        // 모델명_검색어 필드를 기준으로 그룹 생성 후 이름 역순으로 정렬
        const groups = Array.from(
          new Set(data.map((product) => product.모델명_검색어))
        ).sort((a, b) => b.localeCompare(a));
        setModelGroups(groups);

        await fetchStandardQuote.getDocuments("standard_quote", (quoteData) => {
          setStandardQuote(quoteData);
          setError(null);
        });
      });
    } catch (err) {
      message.error("데이터를 불러오는 중 오류가 발생했습니다.");
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    applyFilters(value, selectedGroup, sortOption);
  };

  const handleSort = (value) => {
    setSortOption(value);
    applyFilters(searchText, selectedGroup, value);
  };

  const handleGroupSelect = (value) => {
    setSelectedGroup(value);
    applyFilters(searchText, value, sortOption);
  };

  // 검색, 그룹 선택, 정렬 필터를 적용하는 함수
  const applyFilters = (search, group, sort) => {
    let filtered = products;

    // 그룹 필터 적용
    if (group) {
      filtered = filtered.filter((product) => product.모델명_검색어 === group);
    }

    // 검색 필터 적용
    if (search) {
      filtered = filtered.filter((product) =>
        product.모델명.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 정렬 필터 적용
    filtered = filtered.sort((a, b) => {
      if (sort === "name") {
        return a.모델명.localeCompare(b.모델명);
      } else if (sort === "priceLowHigh") {
        return a.입고가 - b.입고가;
      } else if (sort === "priceHighLow") {
        return b.입고가 - a.입고가;
      }
      return 0;
    });

    setFilteredProducts(filtered);
  };

  const handleNavigate = (product, isEdit = false, quoteId = null) => {
    navigate("/8e4314e1-ec72-47b5-84e2-114a5e7a697a", {
      state: {
        id: product.id,
        modelName: product.모델명,
        description: products.filter((f) => f.id === product.id),
        isEdit,
        quoteId,
      },
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
      <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
        <Col span={8}>
          <Search
            placeholder="제품명을 검색하세요"
            onSearch={handleSearch}
            enterButton
          />
        </Col>
        <Col span={8}>
          <Select
            placeholder="모델 그룹 선택"
            style={{ width: "100%" }}
            onChange={handleGroupSelect}
            allowClear
          >
            {modelGroups.map((group) => (
              <Option key={group} value={group}>
                {group}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={8}>
          <Select
            defaultValue="name"
            style={{ width: "100%" }}
            onChange={handleSort}
          >
            <Option value="name">이름순 정렬</Option>
            <Option value="priceLowHigh">가격 낮은 순</Option>
            <Option value="priceHighLow">가격 높은 순</Option>
          </Select>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {filteredProducts.map((product) => {
          const existingQuote = standardQuote.find(
            (quote) => quote.refProductId === product.id
          );
          return (
            <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                cover={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "300px",
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
                  existingQuote ? (
                    <>
                      <Button
                        onClick={() =>
                          handleNavigate(product, true, existingQuote.id)
                        }
                      >
                        대표견적 수정
                      </Button>
                      <Button onClick={() => handleNavigate(product, false)}>
                        견적서 만들기
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => handleNavigate(product, false)}>
                      대표견적 만들기
                    </Button>
                  ),
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
          );
        })}
      </Row>
    </div>
  );
};

export default ProductList;
