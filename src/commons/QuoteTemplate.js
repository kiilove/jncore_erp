// 공통 항목 (모든 제품에 공통적으로 적용)
const commonFields = {
  brand: { ko: "제조사", en: "Brand" },
  model: { ko: "모델명", en: "Model" },
  price: { ko: "입고가", en: "Price" },
  os: { ko: "운영체제", en: "Operating System" },
  warranty: { ko: "보증기간", en: "Warranty" },
};

// 노트북 견적 기본값 설정
const laptopTemplate = {
  ...commonFields,
  display: { ko: "디스플레이", en: "Display" }, // 예: 15.6인치
  cpu: { ko: "프로세서", en: "CPU" }, // 예: Intel i7, AMD Ryzen 7
  gpu: { ko: "그래픽프로세서", en: "GPU" }, // 예: NVIDIA RTX 3060
  ram: { ko: "메모리", en: "RAM" }, // 예: 16GB
  storage: { ko: "스토리지", en: "Storage" }, // 예: 512GB SSD
  battery: { ko: "배터리", en: "Battery" }, // 예: 8시간
  weight: { ko: "무게", en: "Weight" }, // 예: 1.3kg
  resolution: { ko: "해상도", en: "Resolution" }, // 예: 1920x1080
};

// 데스크탑 견적 기본값 설정
const desktopTemplate = {
  ...commonFields,
  cpu: { ko: "CPU", en: "CPU" }, // 예: Intel i9, AMD Ryzen 9
  gpu: { ko: "그래픽 카드", en: "GPU" }, // 예: NVIDIA RTX 3080
  ram: { ko: "램 용량", en: "RAM" }, // 예: 32GB
  storage: { ko: "저장 공간", en: "Storage" }, // 예: 1TB SSD + 2TB HDD
  powerSupply: { ko: "파워 서플라이", en: "PSU" }, // 예: 750W
  coolingSystem: { ko: "쿨링 시스템", en: "Cooling System" }, // 예: 수냉식 쿨러
  motherboard: { ko: "메인보드", en: "Motherboard" }, // 예: ATX
  case: { ko: "케이스 크기", en: "Case Size" }, // 예: 미들 타워
};

// 서버 견적 기본값 설정
const serverTemplate = {
  ...commonFields,
  cpu: { ko: "서버 CPU", en: "Server CPU" }, // 예: Intel Xeon, AMD EPYC
  ram: { ko: "램 용량", en: "RAM" }, // 예: 64GB ECC
  storage: { ko: "저장 공간", en: "Storage" }, // 예: 2TB SSD (RAID 지원)
  networkCard: { ko: "네트워크 카드", en: "NIC" }, // 예: 듀얼 10Gbps
  powerSupply: { ko: "파워 서플라이", en: "PSU" }, // 예: 1200W
  rackMount: { ko: "랙 장착 가능 여부", en: "Rack Mountable" }, // 예: 1U, 2U
  coolingSystem: { ko: "쿨링 시스템", en: "Cooling System" }, // 예: 공냉식
  raidController: { ko: "RAID 컨트롤러", en: "RAID Controller" }, // 예: RAID 1, 5, 10 지원
};

// 견적 템플릿을 불러오도록 내보내기
export const estimateTemplates = {
  laptop: laptopTemplate,
  desktop: desktopTemplate,
  server: serverTemplate,
};
