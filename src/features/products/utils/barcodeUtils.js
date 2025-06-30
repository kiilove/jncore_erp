export const generateBarcode = (productId) => {
  // 간단한 바코드 생성 로직
  return `PROD-${productId}-${Date.now()}`;
};

export const validateBarcode = (barcode) => {
  // 바코드 유효성 검사 로직
  return /^PROD-\d+-\d+$/.test(barcode);
};

export const formatBarcode = (barcode) => {
  // 바코드 포맷팅 로직
  return barcode.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
};

export const setupBarcodeScanner = (onScan) => {
  // 바코드 스캐너 설정 로직
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      onScan(event.target.value);
      event.target.value = "";
    }
  };

  return {
    start: () => {
      document.addEventListener("keypress", handleKeyPress);
    },
    stop: () => {
      document.removeEventListener("keypress", handleKeyPress);
    },
  };
};
