export const formatCurrency = (value) => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(value);
};

export const formatNumber = (value) => {
  return new Intl.NumberFormat("ko-KR").format(value);
};
