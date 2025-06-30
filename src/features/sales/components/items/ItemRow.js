"use client";

import { Input } from "../../../../components/common/Input";
import { Trash2 } from "lucide-react";

const ItemRow = ({
  item = {},
  index,
  updateItemField = () => {},
  handleProductSearchChange = () => {},
  handleQuantityChange = () => {},
  handlePriceChange = () => {},
  handleNetPriceChange = () => {},
  handleTaxChange = () => {},
  handleProductSelect = () => {},
  removeItem = () => {},
  showProductSuggestions = {},
  setShowProductSuggestions = () => {},
  productInputRefs = {},
  getFilteredProducts = () => [],
  productSearchTerms = {},
  columnWidths = {},
}) => {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 bg-white dark:bg-gray-800">
      <td className="py-1.5 px-1.5 text-center">
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium mx-auto">
          {index + 1}
        </div>
      </td>
      <td className="py-1.5 px-1.5 relative">
        <Input
          value={item.productName || ""}
          onChange={() => {}}
          placeholder="품목명 입력 또는 검색"
          className="w-full h-8 text-xs border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </td>
      <td className="py-1.5 px-1.5">
        <Input
          value={item.category || ""}
          onChange={() => {}}
          placeholder="규격"
          className="w-full h-8 text-xs border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </td>
      <td className="py-1.5 px-1.5">
        <Input
          type="number"
          value={item.quantity || ""}
          onChange={() => {}}
          min="1"
          required
          className="w-full h-8 text-xs border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </td>
      <td className="py-1.5 px-1.5">
        <Input
          type="number"
          value={item.price || ""}
          onChange={() => {}}
          min="0"
          required
          className="w-full h-8 text-xs border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </td>
      <td className="py-1.5 px-1.5">
        <Input
          type="number"
          value={item.tax || ""}
          onChange={() => {}}
          min="0"
          className="w-full h-8 text-xs border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </td>
      <td className="py-1.5 px-1.5">
        <Input
          type="number"
          value={item.netPrice || ""}
          onChange={() => {}}
          min="0"
          required
          className="w-full h-8 text-xs border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </td>
      <td className="py-1.5 px-1.5">
        <div className="text-right font-medium text-xs h-8 flex items-center justify-end px-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100">
          {item.total || 0} 원
        </div>
      </td>
      <td className="py-1.5 px-1.5">
        <Input
          value={item.note || ""}
          onChange={() => {}}
          placeholder="비고"
          className="w-full h-8 text-xs border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </td>
      <td className="py-1.5 px-1.5 text-center">
        <button
          type="button"
          onClick={() => removeItem(index)}
          className="p-1 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
};

export default ItemRow;
