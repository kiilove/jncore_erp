"use client";

import { Input } from "../../../../components/common/Input";
import { Trash2 } from "lucide-react";
import { formatNumber } from "../../../../utils/numberUtils";

const ItemCard = ({
  item,
  index,
  updateItemField,
  handleProductSearchChange,
  handleQuantityChange,
  handlePriceChange,
  handleNetPriceChange,
  handleTaxChange,
  handleProductSelect,
  removeItem,
  showProductSuggestions,
  setShowProductSuggestions,
  productInputRefs,
  getFilteredProducts,
  productSearchTerms,
}) => {
  return (
    <div
      key={item.id}
      className="border border-gray-200 dark:border-gray-700 rounded-md p-3 bg-white dark:bg-gray-800 shadow-sm"
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium mr-2">
            {index + 1}
          </div>
          <h3 className="font-medium text-sm text-gray-800 dark:text-gray-200">
            거래 품목
          </h3>
        </div>
        <button
          type="button"
          onClick={() => removeItem(index)}
          disabled={false}
          className="p-1 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-gray-400 dark:hover:text-red-400 transition-colors disabled:opacity-30 disabled:hover:text-gray-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          품목
        </label>
        <div className="relative">
          <Input
            value={productSearchTerms[index] || item.productName || ""}
            onChange={(e) => handleProductSearchChange(index, e.target.value)}
            placeholder="품목명 입력 또는 검색"
            className="w-full h-8 text-xs border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            onFocus={() =>
              setShowProductSuggestions((prev) => ({ ...prev, [index]: true }))
            }
            onBlur={() => {
              setTimeout(() => {
                setShowProductSuggestions((prev) => ({
                  ...prev,
                  [index]: false,
                }));
              }, 200);
            }}
            ref={(el) => (productInputRefs.current[index] = el)}
          />
          {showProductSuggestions[index] && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-40 overflow-y-auto">
              {getFilteredProducts(index).length > 0 ? (
                getFilteredProducts(index).map((product) => (
                  <div
                    key={product.id}
                    className="p-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 flex justify-between"
                    onClick={() => handleProductSelect(index, product)}
                  >
                    <div className="font-medium text-xs text-gray-800 dark:text-gray-200">
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatNumber(product.price)} 원
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-2 text-center text-xs text-gray-500 dark:text-gray-400">
                  검색 결과가 없습니다
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          규격
        </label>
        <Input
          value={item.category || ""}
          onChange={(e) => updateItemField(index, "category", e.target.value)}
          placeholder="규격"
          className="w-full h-8 text-xs border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            수량
          </label>
          <input
            type="text"
            value={item.quantity}
            onChange={(e) => handleQuantityChange(index, e.target.value)}
            className="w-full h-8 px-2 text-sm border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            단가
          </label>
          <input
            type="text"
            value={item.price}
            onChange={(e) => handlePriceChange(index, e.target.value)}
            className="w-full h-8 px-2 text-sm border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            세액
          </label>
          <Input
            type="number"
            value={item.tax}
            onChange={(e) => handleTaxChange(index, e.target.value)}
            min="0"
            className="w-full h-8 text-xs border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            공급가액
          </label>
          <Input
            type="number"
            value={item.netPrice}
            onChange={(e) => handleNetPriceChange(index, e.target.value)}
            min="0"
            required
            className="w-full h-8 text-xs border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            금액
          </label>
          <div className="text-right font-medium text-xs h-8 flex items-center justify-end px-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100">
            {formatNumber(item.total)} 원
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            비고
          </label>
          <Input
            value={item.note || ""}
            onChange={(e) => updateItemField(index, "note", e.target.value)}
            placeholder="비고"
            className="w-full h-8 text-xs border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
