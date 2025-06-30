import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../firebase/config";

// 판매 데이터 타입 정의
export interface SaleData {
  id?: string;
  documentNumber: string;
  issueDate: string;
  customer: {
    name: string;
    businessNumber: string;
    representative: string;
    address: string;
    businessType: string;
    businessCategory: string;
  } | null;
  contact: {
    name: string;
    phone: string;
    email: string;
  } | null;
  items: Array<{
    id: number | null;
    itemName: string;
    specification: string;
    quantity: number;
    unitPrice: number;
    supplyAmount: number;
    taxAmount: number;
    totalAmount: number;
    notes: string;
  }>;
  payment: {
    method: string;
    methodText: string;
  };
  tax: {
    method: string;
    methodText: string;
  };
  amounts: {
    supplyAmount: number;
    taxAmount: number;
    totalAmount: number;
  };
  notes: string;
  status?: string;
  memo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 판매 데이터 추가
export async function addSale(data: SaleData): Promise<{ id: string }> {
  try {
    // 타임스탬프 추가
    const saleData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Firestore에 데이터 추가
    const docRef = await addDoc(collection(db, "sales"), saleData);

    return { id: docRef.id };
  } catch (error) {
    console.error("Error adding sale:", error);
    throw new Error("판매 데이터 추가 중 오류가 발생했습니다.");
  }
}

// 판매 데이터 수정
export async function updateSale(
  id: string,
  data: Partial<SaleData>
): Promise<void> {
  try {
    // 타임스탬프 업데이트
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    // Firestore 문서 업데이트
    const saleRef = doc(db, "sales", id);
    await updateDoc(saleRef, updateData);
  } catch (error) {
    console.error("Error updating sale:", error);
    throw new Error("판매 데이터 수정 중 오류가 발생했습니다.");
  }
}

// 판매 데이터 조회
export async function getSale(id: string): Promise<SaleData> {
  try {
    const saleRef = doc(db, "sales", id);
    const saleSnap = await getDoc(saleRef);

    if (!saleSnap.exists()) {
      throw new Error("판매 데이터를 찾을 수 없습니다.");
    }

    const saleData = saleSnap.data() as SaleData;
    return { ...saleData, id: saleSnap.id };
  } catch (error) {
    console.error("Error getting sale:", error);
    throw new Error("판매 데이터 조회 중 오류가 발생했습니다.");
  }
}

// 판매 목록 조회
export async function getSales(filters?: any): Promise<SaleData[]> {
  try {
    let salesQuery = query(collection(db, "sales"));

    // 필터 적용 (예시)
    if (filters) {
      if (filters.customerName) {
        salesQuery = query(
          salesQuery,
          where("customer.name", "==", filters.customerName)
        );
      }
      if (filters.startDate && filters.endDate) {
        salesQuery = query(
          salesQuery,
          where("issueDate", ">=", filters.startDate),
          where("issueDate", "<=", filters.endDate)
        );
      }
    }

    // 기본 정렬: 날짜 내림차순
    salesQuery = query(salesQuery, orderBy("issueDate", "desc"));

    const salesSnap = await getDocs(salesQuery);
    const salesData: SaleData[] = [];

    salesSnap.forEach((doc) => {
      salesData.push({ ...(doc.data() as SaleData), id: doc.id });
    });

    return salesData;
  } catch (error) {
    console.error("Error getting sales:", error);
    throw new Error("판매 목록 조회 중 오류가 발생했습니다.");
  }
}

// 판매 데이터 삭제
export async function deleteSale(id: string): Promise<void> {
  try {
    const saleRef = doc(db, "sales", id);
    await deleteDoc(saleRef);
  } catch (error) {
    console.error("Error deleting sale:", error);
    throw new Error("판매 데이터 삭제 중 오류가 발생했습니다.");
  }
}
