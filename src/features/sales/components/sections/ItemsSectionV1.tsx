"use client";

import { useState, useEffect } from "react";

// 타입 정의
export interface Item {
  id: number | null;
  itemName: string;
  specification: string;
  quantity: number;
  unitPrice: number;
  supplyAmount: number;
  taxAmount: number;
  totalAmount: number;
  notes: string;
}

interface ItemsSectionProps {
  items: Item[];
  onUpdate: (data: any) => void;
}

export default function ItemsSection({ items, onUpdate }: ItemsSectionProps) {
  const [newItem, setNewItem] = useState<Item>({
    id: null,
    itemName: "",
    specification: "",
    quantity: 1,
    unitPrice: 0,
    supplyAmount: 0,
    taxAmount: 0,
    totalAmount: 0,
    notes: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [taxMethod, setTaxMethod] = useState("excluded"); // Default to "excluded" (부가세별도)
  const [activeInput, setActiveInput] = useState("unitPrice"); // "unitPrice", "supply", "tax"

  // 상품 검색 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // 상품 목록 (실제로는 API에서 가져와야 함)
  const [products] = useState([
    {
      id: "1",
      name: "노트북 컴퓨터",
      specification: "15인치, i7, 16GB RAM",
      unitPrice: 1200000,
    },
    {
      id: "2",
      name: "모니터",
      specification: "27인치 4K UHD",
      unitPrice: 450000,
    },
    {
      id: "3",
      name: "키보드",
      specification: "기계식, 텐키리스",
      unitPrice: 120000,
    },
    {
      id: "4",
      name: "마우스",
      specification: "무선, 블루투스",
      unitPrice: 45000,
    },
  ]);

  // 상품 검색 결과
  const searchResults = searchTerm
    ? products.filter(
        (product) =>
          product.name.includes(searchTerm) ||
          product.specification.includes(searchTerm)
      )
    : [];

  // 상품 선택 핸들러
  const handleSelectProduct = (product: any) => {
    const newItem: Item = {
      id: Date.now(),
      itemName: product.name,
      specification: product.specification,
      quantity: 1,
      unitPrice: product.unitPrice,
      supplyAmount: product.unitPrice,
      taxAmount: Math.round(product.unitPrice * 0.1),
      totalAmount: Math.round(product.unitPrice * 1.1),
      notes: "",
    };

    onUpdate({ items: [...items, newItem] });
    setSearchTerm("");
    setIsSearching(false);
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Parse formatted number string back to number
  const parseFormattedNumber = (str: string) => {
    return Number.parseInt(str.replace(/,/g, "")) || 0;
  };

  // Calculate amounts based on the active input and tax method
  const calculateAmounts = (
    quantity: number,
    unitPrice: number,
    supplyAmount: number,
    taxAmount: number,
    activeField: string,
    currentTaxMethod: string
  ) => {
    const result = {
      unitPrice,
      supplyAmount,
      taxAmount,
      totalAmount: 0,
    };

    // Calculate based on which field was changed
    if (activeField === "unitPrice") {
      // User entered unit price
      if (currentTaxMethod === "included") {
        // Tax included: unit price includes tax
        result.unitPrice = unitPrice;
        result.supplyAmount = Math.round(unitPrice / 1.1); // 10% VAT
        result.taxAmount = unitPrice - result.supplyAmount;
      } else {
        // Tax excluded: unit price is supply amount
        result.unitPrice = unitPrice;
        result.supplyAmount = unitPrice;
        result.taxAmount = Math.round(unitPrice * 0.1);
      }
    } else if (activeField === "supply") {
      // User entered supply amount - don't change unit price
      result.supplyAmount = supplyAmount;

      if (currentTaxMethod === "included") {
        result.taxAmount = Math.round(supplyAmount * 0.1);
      } else {
        result.taxAmount = Math.round(supplyAmount * 0.1);
      }
      // Unit price remains unchanged
    } else if (activeField === "tax") {
      // User entered tax amount - don't change unit price
      result.taxAmount = taxAmount;

      // Unit price remains unchanged
      // We don't recalculate supply amount based on tax to avoid circular changes
    }

    // Total amount is always the sum of supply amount and tax amount
    result.totalAmount = result.supplyAmount + result.taxAmount;

    // Multiply by quantity for final values
    if (quantity > 1) {
      result.supplyAmount = result.supplyAmount * quantity;
      result.taxAmount = result.taxAmount * quantity;
      result.totalAmount = result.totalAmount * quantity;
    }

    return result;
  };

  // Update total amount whenever supply amount or tax amount changes
  useEffect(() => {
    const totalAmount = newItem.supplyAmount + newItem.taxAmount;
    if (totalAmount !== newItem.totalAmount) {
      setNewItem((prev) => ({
        ...prev,
        totalAmount,
      }));
    }
  }, [newItem.supplyAmount, newItem.taxAmount]);

  const handleInputChange = (field: string, value: string | number) => {
    // If value is a string with commas, parse it to a number
    const numericValue =
      typeof value === "string" ? parseFormattedNumber(value) : value;

    setActiveInput(field);

    if (field === "unitPrice") {
      // When unit price changes, recalculate supply and tax
      const { supplyAmount, taxAmount, totalAmount } = calculateAmounts(
        newItem.quantity,
        numericValue as number,
        newItem.supplyAmount,
        newItem.taxAmount,
        field,
        taxMethod
      );

      setNewItem({
        ...newItem,
        unitPrice: numericValue as number,
        supplyAmount: supplyAmount / newItem.quantity, // Store per-unit values
        taxAmount: taxAmount / newItem.quantity,
        totalAmount: totalAmount / newItem.quantity,
      });
    } else if (field === "supply") {
      // When supply amount changes, update tax but keep unit price
      setNewItem({
        ...newItem,
        supplyAmount: numericValue as number,
        taxAmount: Math.round((numericValue as number) * 0.1), // Calculate tax based on supply
        // Unit price remains unchanged
      });
    } else if (field === "tax") {
      // When tax amount changes, just update the tax value
      setNewItem({
        ...newItem,
        taxAmount: numericValue as number,
        // Unit price and supply amount remain unchanged
      });
    } else if (field === "quantity") {
      const quantity = Math.max(1, numericValue as number); // Ensure quantity is at least 1

      // When quantity changes, we don't need to recalculate per-unit values
      // Just update the quantity
      setNewItem({
        ...newItem,
        quantity,
      });
    } else {
      // For other fields, just update the value
      setNewItem({
        ...newItem,
        [field]: value,
      });
    }
  };

  const handleAddOrUpdateItem = () => {
    if (!newItem.itemName || newItem.quantity <= 0) {
      return;
    }

    // Calculate final amounts with quantity
    const supplyAmount = newItem.supplyAmount * newItem.quantity;
    const taxAmount = newItem.taxAmount * newItem.quantity;
    const totalAmount = supplyAmount + taxAmount; // Ensure total is sum of supply and tax

    if (isEditing && newItem.id) {
      // Update existing item
      const updatedItems = items.map((item) =>
        item.id === newItem.id
          ? {
              ...newItem,
              supplyAmount,
              taxAmount,
              totalAmount,
            }
          : item
      );

      onUpdate({
        items: updatedItems,
        taxMethod,
      });

      // Reset form and editing state
      setIsEditing(false);
    } else {
      // Add new item
      const itemToAdd = {
        ...newItem,
        id: Date.now(),
        supplyAmount,
        taxAmount,
        totalAmount,
      };

      onUpdate({
        items: [...items, itemToAdd],
        taxMethod,
      });
    }

    // Reset form
    setNewItem({
      id: null,
      itemName: "",
      specification: "",
      quantity: 1,
      unitPrice: 0,
      supplyAmount: 0,
      taxAmount: 0,
      totalAmount: 0,
      notes: "",
    });
  };

  const handleEditItem = (item: Item) => {
    // Set form to edit mode and populate with item data
    setIsEditing(true);

    // Calculate per-unit values for editing
    const perUnitSupplyAmount =
      item.quantity > 0 ? item.supplyAmount / item.quantity : item.supplyAmount;
    const perUnitTaxAmount =
      item.quantity > 0 ? item.taxAmount / item.quantity : item.taxAmount;

    setNewItem({
      id: item.id,
      itemName: item.itemName,
      specification: item.specification,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      supplyAmount: perUnitSupplyAmount,
      taxAmount: perUnitTaxAmount,
      totalAmount: perUnitSupplyAmount + perUnitTaxAmount,
      notes: item.notes,
    });
  };

  const handleCancelEdit = () => {
    // Reset form and exit edit mode
    setIsEditing(false);
    setNewItem({
      id: null,
      itemName: "",
      specification: "",
      quantity: 1,
      unitPrice: 0,
      supplyAmount: 0,
      taxAmount: 0,
      totalAmount: 0,
      notes: "",
    });
  };

  const handleRemoveItem = (itemId: number | null) => {
    if (itemId === null) return;
    onUpdate({ items: items.filter((item) => item.id !== itemId) });
  };

  const handleTaxMethodChange = (method: string) => {
    // Immediately update the tax method state
    setTaxMethod(method);

    // If unit price is set, recalculate based on the new tax method
    if (newItem.unitPrice > 0) {
      let newSupplyAmount, newTaxAmount;

      if (method === "included") {
        // Tax included: calculate supply from unit price
        newSupplyAmount = Math.round(newItem.unitPrice / 1.1);
        newTaxAmount = newItem.unitPrice - newSupplyAmount;
      } else {
        // Tax excluded: unit price is supply amount
        newSupplyAmount = newItem.unitPrice;
        newTaxAmount = Math.round(newItem.unitPrice * 0.1);
      }

      // Update the form with new values
      setNewItem({
        ...newItem,
        supplyAmount: newSupplyAmount,
        taxAmount: newTaxAmount,
        totalAmount: newSupplyAmount + newTaxAmount,
      });
    }

    // Recalculate all items with the new tax method
    if (items.length > 0) {
      const updatedItems = items.map((item) => {
        let newSupplyAmount, newTaxAmount;

        if (method === "included") {
          // Tax included: calculate supply from unit price
          newSupplyAmount = Math.round((item.unitPrice * item.quantity) / 1.1);
          newTaxAmount = item.unitPrice * item.quantity - newSupplyAmount;
        } else {
          // Tax excluded: unit price is supply amount
          newSupplyAmount = item.unitPrice * item.quantity;
          newTaxAmount = Math.round(newSupplyAmount * 0.1);
        }

        return {
          ...item,
          supplyAmount: newSupplyAmount,
          taxAmount: newTaxAmount,
          totalAmount: newSupplyAmount + newTaxAmount,
        };
      });

      // Update the items with the new calculations
      onUpdate({
        items: updatedItems,
        taxMethod: method,
      });
    } else {
      // Just update the tax method if there are no items
      onUpdate({
        taxMethod: method,
      });
    }
  };

  return (
    <section className="bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden border border-border">
      <div className="bg-gradient-to-r from-blue-50 to-card dark:from-blue-950/20 dark:to-card border-b border-border py-4 px-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-foreground flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-blue-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            거래품목
          </h2>

          <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1 text-sm shadow-sm">
            <button
              type="button"
              className={`px-3 py-1 rounded-full transition-colors duration-200 ${
                taxMethod === "included"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-foreground hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              onClick={() => handleTaxMethodChange("included")}
            >
              부가세포함
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded-full transition-colors duration-200 ${
                taxMethod === "excluded"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-foreground hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              onClick={() => handleTaxMethodChange("excluded")}
            >
              부가세별도
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-4">
          <div className="flex items-end -mx-1">
            <div className="px-1 w-[30%]">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                품목
              </label>
              <input
                type="text"
                value={newItem.itemName}
                onChange={(e) =>
                  setNewItem({ ...newItem, itemName: e.target.value })
                }
                className="h-9 w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/20 focus:ring-opacity-50 pl-3 text-xs"
              />
            </div>
            <div className="px-1 w-[7%]">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                규격
              </label>
              <input
                type="text"
                value={newItem.specification}
                onChange={(e) =>
                  setNewItem({ ...newItem, specification: e.target.value })
                }
                className="h-9 w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/20 focus:ring-opacity-50 pl-3 text-xs"
              />
            </div>
            <div className="px-1 w-[5%]">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                수량
              </label>
              <input
                type="text"
                value={formatNumber(newItem.quantity)}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/20 focus:ring-opacity-50 pl-3 pr-3 text-center text-xs"
              />
            </div>
            <div className="px-1 w-[12%]">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                단가
              </label>
              <input
                type="text"
                value={formatNumber(newItem.unitPrice)}
                onChange={(e) => handleInputChange("unitPrice", e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/20 focus:ring-opacity-50 pl-3 pr-3 text-right text-xs"
              />
            </div>
            <div className="px-1 w-[12%]">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                공급가액
              </label>
              <input
                type="text"
                value={formatNumber(newItem.supplyAmount)}
                onChange={(e) => handleInputChange("supply", e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/20 focus:ring-opacity-50 pl-3 pr-3 text-right text-xs"
              />
            </div>
            <div className="px-1 w-[12%]">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                세액
              </label>
              <input
                type="text"
                value={formatNumber(newItem.taxAmount)}
                onChange={(e) => handleInputChange("tax", e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/20 focus:ring-opacity-50 pl-3 pr-3 text-right text-xs"
              />
            </div>
            <div className="px-1 w-[12%]">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                금액
              </label>
              <input
                type="text"
                value={formatNumber(newItem.supplyAmount + newItem.taxAmount)}
                readOnly
                className="h-9 w-full rounded-md border border-input bg-muted text-muted-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/20 focus:ring-opacity-50 pl-3 pr-3 text-right text-xs"
              />
            </div>
            <div className="px-1 w-[7%]">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                비고
              </label>
              <input
                type="text"
                value={newItem.notes}
                onChange={(e) =>
                  setNewItem({ ...newItem, notes: e.target.value })
                }
                className="h-9 w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/20 focus:ring-opacity-50 pl-3 text-xs"
              />
            </div>
            <div className="px-1 w-[5%]">
              <label className="block text-xs font-medium text-muted-foreground mb-1 opacity-0">
                작업
              </label>
              {isEditing ? (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={handleAddOrUpdateItem}
                    className="h-9 w-9 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="h-9 w-9 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAddOrUpdateItem}
                  className="h-9 w-9 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {items.length > 0 ? (
            <div className="overflow-x-auto border border-border rounded-lg shadow-sm mt-3">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-12"
                    >
                      순번
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      품목
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-16"
                    >
                      규격
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-16"
                    >
                      수량
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-28"
                    >
                      공급가액
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-24"
                    >
                      세액
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-28"
                    >
                      금액
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-24"
                    >
                      비고
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-16"
                    >
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {items.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-accent/10 cursor-pointer"
                      onClick={() => handleEditItem(item)}
                    >
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-foreground text-center">
                        {index + 1}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-foreground">
                        {item.itemName}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-foreground">
                        {item.specification}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-foreground text-center">
                        {formatNumber(item.quantity)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-foreground text-right">
                        {formatNumber(item.supplyAmount)}원
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-foreground text-right">
                        {formatNumber(item.taxAmount)}원
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-foreground text-right">
                        {formatNumber(item.totalAmount)}원
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-foreground">
                        {item.notes}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleRemoveItem(item.id);
                          }}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center bg-muted/50 rounded-md p-8 border border-dashed border-border mt-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-muted-foreground mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <p className="text-foreground font-medium text-center">
                거래품목이 없습니다
              </p>
              <p className="text-muted-foreground text-sm text-center mt-2">
                위 양식을 통해 거래품목을 추가해주세요
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 상품 검색 */}
      <div className="mb-4">
        <div className="relative">
          <div className="flex">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsSearching(true);
                }}
                onFocus={() => setIsSearching(true)}
                placeholder="품목명 또는 규격 검색"
                className="h-10 w-full rounded-l-md border border-input bg-background text-foreground shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 pl-3 pr-10 text-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setIsSearching(false);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-r-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* 검색 결과 드롭다운 */}
          {isSearching && searchTerm && (
            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
              {searchResults.length > 0 ? (
                <ul className="py-1">
                  {searchResults.map((product) => (
                    <li
                      key={product.id}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => handleSelectProduct(product)}
                    >
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {product.specification} |{" "}
                        {formatNumber(product.unitPrice)}원
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                  검색 결과가 없습니다. 새 품목을 등록하세요.
                </div>
              )}
              <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  className="w-full text-left text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  + 새 품목 등록
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
