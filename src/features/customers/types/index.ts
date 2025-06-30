// Firebase Timestamp 타입 정의
export interface Timestamp {
  toDate: () => Date;
  seconds: number;
  nanoseconds: number;
}

// 담당자 정보 타입
export interface Contact {
  name: string;
  phone: string;
  email: string;
}

// 검색 인덱스 타입
export interface SearchIndex {
  clean: string;
  korean: string;
}

// 거래처 기본 정보 타입
export interface Customer {
  id: string;
  name: string;
  businessNumber: string;
  representative: string;
  address: string;
  businessType: string;
  businessCategory: string;
  contacts: Contact[];
  createdAt?: Timestamp;
  createdBy?: string;
  searchIndex?: SearchIndex;
  searchTerms?: string[];
  updatedAt?: Timestamp | Date;
}

// 페이지네이션 결과 타입
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

// 검색 인덱스 업데이트 결과 타입
export interface IndexUpdateResult {
  count: number;
}

// 폼 에러 타입
export interface FormErrors {
  [key: string]: string;
}

// 필터 옵션 타입
export interface FilterOptions {
  businessType: string;
  businessCategory: string;
}

// 페이지네이션 상태 타입
export interface PaginationState {
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

// 폼 데이터 타입 정의
export interface CustomerFormData {
  name: string;
  businessNumber: string;
  representative: string;
  address: string;
  businessType: string;
  businessCategory: string;
  contacts: Contact[];
}
