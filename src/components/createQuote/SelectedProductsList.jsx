// SelectedProductsList.jsx
import React from "react";
import { Card, List, Row, Col, Input } from "antd";

const SelectedProductsList = ({
  quoteItems,
  setQuoteItems,
  estimateTemplates,
}) => (
  <Card title="선택된 제품 목록" bordered={false} style={{ marginBottom: 16 }}>
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
                const label = estimateTemplates[product.타입][key]?.ko || key;

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
);

export default SelectedProductsList;
