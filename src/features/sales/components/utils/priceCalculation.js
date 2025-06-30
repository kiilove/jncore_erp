export const calculateItemTotals = (item, includeTax) => {
  const quantity = Number(item.quantity) || 0;
  const price = Number(item.price) || 0;

  let netPrice, tax, total;

  if (includeTax) {
    // 부가세 포함 가격
    netPrice = Math.round(price / 1.1);
    tax = price - netPrice;
    total = price * quantity;
  } else {
    // 부가세 별도 가격
    netPrice = price;
    tax = Math.round(price * 0.1);
    total = (netPrice + tax) * quantity;
  }

  return {
    netPrice,
    tax,
    total,
  };
};

export const calculateFormTotals = (items, includeTax) => {
  const totals = items.reduce(
    (acc, item) => {
      const { netPrice, tax, total } = calculateItemTotals(item, includeTax);

      return {
        netAmount: acc.netAmount + netPrice * item.quantity,
        taxAmount: acc.taxAmount + tax * item.quantity,
        totalAmount: acc.totalAmount + total,
      };
    },
    { netAmount: 0, taxAmount: 0, totalAmount: 0 }
  );

  // 소수점 반올림
  return {
    netAmount: Math.round(totals.netAmount),
    taxAmount: Math.round(totals.taxAmount),
    totalAmount: Math.round(totals.totalAmount),
  };
};
