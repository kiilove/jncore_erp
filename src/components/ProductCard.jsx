import React from "react";
import { Card, Button, Col } from "antd";

const ProductCard = ({ product, onEdit, onCreateQuote }) => (
  <div
    className="goods-item"
    style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}
  >
    <div className="item__thumb" style={{ marginRight: "20px" }}>
      <img
        src={product.검색모델img || "https://via.placeholder.com/150"}
        alt={product.모델명}
        style={{ width: "150px", height: "150px", objectFit: "contain" }}
      />
    </div>
    <div className="item__box">
      <h3 className="item__model">{product.모델명}</h3>
      <div className="item__attr">
        <p>운영체제: {product.OS}</p>
        <p>CPU: {product.CPU}</p>
        <p>스토리지: {product.스토리지}</p>
        <p>메모리: {product.메모리}</p>
        <p>GPU: {product.GPU}</p>
        <p>Display: {product.Display}</p>
      </div>
      <div>
        <Button onClick={onEdit}>대표견적 수정</Button>
        <Button onClick={onCreateQuote} style={{ marginLeft: "10px" }}>
          견적서 만들기
        </Button>
      </div>
    </div>
  </div>
);

export default ProductCard;
