export const validateForm = (formData) => {
  const errors = {};

  // 고객 정보 검증
  if (!formData.customerId) {
    errors.customerId = "거래처를 선택해주세요.";
  }

  // 품목 정보 검증
  if (!formData.items || formData.items.length === 0) {
    errors.items = "최소 하나 이상의 품목을 추가해주세요.";
  } else {
    formData.items.forEach((item, index) => {
      if (!item.product) {
        errors[`items.${index}.product`] = "품목을 선택해주세요.";
      }
      if (!item.quantity || item.quantity <= 0) {
        errors[`items.${index}.quantity`] = "수량을 입력해주세요.";
      }
      if (!item.price || item.price <= 0) {
        errors[`items.${index}.price`] = "가격을 입력해주세요.";
      }
    });
  }

  // 결제 정보 검증
  if (!formData.paymentMethod) {
    errors.paymentMethod = "결제 방법을 선택해주세요.";
  }
  if (!formData.paymentStatus) {
    errors.paymentStatus = "결제 상태를 선택해주세요.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
