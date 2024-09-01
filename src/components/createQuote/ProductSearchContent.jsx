import React, { useRef } from "react";
import { Input, List } from "antd";

const ProductSearchContent = ({ onSearch, onSelect, searchResults }) => {
  const searchInputRef = useRef(null);

  return (
    <div>
      <Input.Search
        placeholder="제품명을 입력하세요"
        ref={searchInputRef}
        onSearch={onSearch}
        style={{ marginBottom: 8 }}
      />
      <List
        bordered
        dataSource={searchResults}
        renderItem={(product) => (
          <List.Item onClick={() => onSelect(product)}>
            {product?.model?.value}
          </List.Item>
        )}
      />
    </div>
  );
};

export default ProductSearchContent;
