export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat("ko-KR").format(number);
};

export const parseCurrency = (currencyString) => {
  return Number(currencyString.replace(/[^0-9.-]+/g, ""));
};
