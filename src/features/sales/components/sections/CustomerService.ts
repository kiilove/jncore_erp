import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  DocumentData,
  QuerySnapshot,
} from "firebase/firestore";
import { db } from "../../../../firebase/config";
import type { Customer } from "./CustomerSection";

// 검색어로 고객 검색
export async function searchCustomers(searchTerm: string): Promise<Customer[]> {
  try {
    const customersRef = collection(db, "customers");
    let customersQuery;

    if (searchTerm) {
      // 검색어가 있는 경우
      const term = searchTerm.toLowerCase().trim();
      customersQuery = query(
        customersRef,
        where("searchTerms", "array-contains", term),
        limit(10)
      );
    } else {
      // 검색어가 없는 경우 최근 문서만 조회
      customersQuery = query(
        customersRef,
        orderBy("createdAt", "desc"),
        limit(10)
      );
    }

    const snapshot = await getDocs(customersQuery);
    return convertSnapshotToCustomers(snapshot);
  } catch (error) {
    console.error("Error searching customers:", error);
    throw new Error("거래처 검색 중 오류가 발생했습니다.");
  }
}

// Firestore 스냅샷을 Customer 배열로 변환
function convertSnapshotToCustomers(
  snapshot: QuerySnapshot<DocumentData>
): Customer[] {
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      name: data.name || "",
      businessNumber: data.businessNumber || "",
      representative: data.representative || "",
      address: data.address || "",
      businessType: data.businessType || "",
      businessCategory: data.businessCategory || "",
      createdAt: data.createdAt?.toDate() || new Date(),
      createdBy: data.createdBy || "",
      contacts: data.contacts || [],
      searchIndex: data.searchIndex || { clean: "", korean: "" },
      searchTerms: data.searchTerms || [],
    };
  });
}
