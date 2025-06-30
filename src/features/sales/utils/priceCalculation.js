// 품목별 금액 계산
export const calculateItemTotals = (item, includeTax) => {
  const quantity = Number(item.quantity) || 0;
  const price = Number(item.price) || 0;
  const netPrice = quantity * price;
  const tax = includeTax ? Math.round(netPrice * 0.1) : 0;
  const total = netPrice + tax;

  return {
    netPrice,
    tax,
    total,
  };
};

// 전체 금액 계산
export const calculateFormTotals = (items, includeTax) => {
  const totals = items.reduce(
    (acc, item) => {
      const { netPrice, tax, total } = calculateItemTotals(item, includeTax);
      acc.netAmount += netPrice;
      acc.taxAmount += tax;
      acc.totalAmount += total;
      return acc;
    },
    { netAmount: 0, taxAmount: 0, totalAmount: 0 }
  );

  return totals;
};
