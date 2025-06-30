export const formatCurrency = (value) => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(value);
};

export const calculateItemTotal = (item) => {
  const quantity = Number(item.quantity) || 0;
  const price = Number(item.price) || 0;
  return quantity * price;
};

export const calculateSubtotal = (items) => {
  return items.reduce((total, item) => total + calculateItemTotal(item), 0);
};

export const calculateTax = (subtotal, taxRate, taxOption) => {
  if (taxOption === "inclusive") {
    return subtotal - subtotal / (1 + taxRate);
  }
  return subtotal * taxRate;
};

export const calculateTotal = (subtotal, tax, discount) => {
  return subtotal + tax - discount;
};

export const validateSaleForm = (formData) => {
  const errors = {};

  if (!formData.customerId) {
    errors.customerId = "고객을 선택해주세요";
  }

  if (!formData.items || formData.items.length === 0) {
    errors.items = "최소 하나 이상의 상품을 추가해주세요";
  } else {
    formData.items.forEach((item, index) => {
      if (!item.product) {
        errors[`items.${index}.product`] = "상품을 선택해주세요";
      }
      if (!item.quantity || item.quantity <= 0) {
        errors[`items.${index}.quantity`] = "수량을 입력해주세요";
      }
      if (!item.price || item.price <= 0) {
        errors[`items.${index}.price`] = "가격을 입력해주세요";
      }
    });
  }

  return errors;
};
