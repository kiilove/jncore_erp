import { toast } from "react-toastify";
import { calculateFormTotals } from "./priceCalculation";
import { validateForm } from "./formValidation";

export const handleKeyDown = (e, formData, setFormData) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const activeElement = document.activeElement;
    if (
      activeElement.tagName === "INPUT" ||
      activeElement.tagName === "SELECT"
    ) {
      const nextElement = activeElement.nextElementSibling;
      if (nextElement) {
        nextElement.focus();
      }
    }
  }
};

export const handleSubmit = async (e, formData, customers, onSubmit) => {
  e.preventDefault();

  // 폼 데이터 검증
  const { isValid, errors } = validateForm(formData);

  if (!isValid) {
    // 검증 실패 시 에러 메시지 표시
    Object.values(errors).forEach((error) => {
      toast.error(error);
    });
    return;
  }

  try {
    // 고객 정보 가져오기
    const selectedCustomer = customers.find(
      (customer) => customer.id === formData.customerId
    );

    if (!selectedCustomer) {
      toast.error("선택된 거래처 정보를 찾을 수 없습니다.");
      return;
    }

    // 품목 데이터 검증 및 계산
    const validatedItems = formData.items.map((item) => {
      if (!item.product || !item.quantity || !item.price) {
        throw new Error("품목 정보가 올바르지 않습니다.");
      }

      const quantity = Number(item.quantity);
      const price = Number(item.price);
      const netPrice = formData.includeTax ? Math.round(price / 1.1) : price;
      const tax = formData.includeTax
        ? price - netPrice
        : Math.round(price * 0.1);
      const total = (netPrice + tax) * quantity;

      return {
        ...item,
        quantity,
        price,
        netPrice,
        tax,
        total,
      };
    });

    // 전체 금액 계산
    const { netAmount, taxAmount, totalAmount } = calculateFormTotals(
      validatedItems,
      formData.includeTax
    );

    // 최종 제출 데이터 구성
    const submitData = {
      ...formData,
      items: validatedItems,
      netAmount,
      taxAmount,
      totalAmount,
      customerInfo: {
        name: selectedCustomer.name,
        businessNumber: selectedCustomer.businessNumber || "",
        businessType: selectedCustomer.businessType || "",
        businessCategory: selectedCustomer.businessCategory || "",
        address: selectedCustomer.address || "",
        representative: selectedCustomer.representative || "",
        contacts: selectedCustomer.contacts || [],
      },
    };

    // 데이터 검증
    if (netAmount <= 0 || taxAmount < 0 || totalAmount <= 0) {
      throw new Error("금액 계산에 오류가 있습니다.");
    }

    // 제출 처리
    await onSubmit(submitData);
    toast.success("판매 정보가 등록되었습니다.");
  } catch (error) {
    console.error("판매 정보 등록 실패:", error);
    toast.error(error.message || "판매 정보 등록 중 오류가 발생했습니다.");
  }
};
