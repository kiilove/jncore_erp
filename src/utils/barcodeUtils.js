import { collection, query, where, getDocs } from "firebase/firestore";

export const generateBarcode = (productId) => {
  // 간단한 바코드 생성 ��직
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

// 바코드 스캐너 설정 함수 개선
export const setupBarcodeScanner = (onScan) => {
  let barcode = "";
  let lastKeyTime = 0;
  const scannerTimeoutMs = 50; // 스캐너 입력 간격 (밀리초)

  const handleKeyDown = (event) => {
    // Enter 키가 눌리면 바코드 스캔 완료로 간주
    if (event.key === "Enter") {
      if (barcode.length > 3) {
        // 최소 길이 확인
        onScan(barcode);
      }
      barcode = "";
      event.preventDefault();
      return;
    }

    // 현재 시간
    const currentTime = new Date().getTime();

    // 마지막 키 입력 후 일정 시간이 지났으면 새로운 바코드 시작
    if (currentTime - lastKeyTime > scannerTimeoutMs && barcode.length > 0) {
      barcode = "";
    }

    // 일반 문자키만 바코드에 추가
    if (event.key.length === 1) {
      barcode += event.key;
    }

    lastKeyTime = currentTime;
  };

  return {
    start: () => {
      document.addEventListener("keydown", handleKeyDown);
    },
    stop: () => {
      document.removeEventListener("keydown", handleKeyDown);
    },
  };
};

// 바코드로 제품 검색 함수 개선
export const findProductByBarcode = async (db, barcode) => {
  try {
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("barcode", "==", barcode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data(),
    };
  } catch (error) {
    console.error("Error finding product by barcode:", error);
    throw error;
  }
};
