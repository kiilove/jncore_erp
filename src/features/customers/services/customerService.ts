import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  where,
  limit,
  getDoc,
  writeBatch,
  startAfter,
  type DocumentData,
  type QuerySnapshot,
  type DocumentReference,
  type DocumentSnapshot,
} from "firebase/firestore";
import type { Customer, PaginatedResult, IndexUpdateResult } from "../types";

// Firebase 설정 파일에서 db 인스턴스 가져오기
import { db } from "../../../firebase/config";

// 거래처 목록 조회 (페이지네이션)
const fetchCustomers = async (
  page = 1,
  pageSize = 10
): Promise<PaginatedResult<Customer>> => {
  try {
    console.log("Fetching customers with page:", page, "pageSize:", pageSize);

    // 전체 레코드 수 조회
    const countQuery = query(collection(db, "customers"));
    const countSnapshot: QuerySnapshot<DocumentData> = await getDocs(
      countQuery
    );
    const totalCount: number = countSnapshot.size;
    const totalPages: number = Math.ceil(totalCount / pageSize);

    console.log("Total count:", totalCount, "Total pages:", totalPages);

    // 페이지 범위 체크
    if (page < 1 || (page > totalPages && totalPages > 0)) {
      console.log("Page out of range, returning empty result");
      return {
        items: [],
        totalCount,
        currentPage: page,
        totalPages,
        hasMore: false,
      };
    }

    // 페이지네이션을 위한 쿼리 구성
    let q;

    if (page === 1) {
      // 첫 페이지는 단순히 limit만 적용
      q = query(collection(db, "customers"), orderBy("name"), limit(pageSize));
      console.log("First page query");
    } else {
      // 첫 페이지가 아닌 경우, 이전 페이지까지의 데이터를 건너뛰기 위해 skip 계산
      // Firestore에서는 직접적인 skip이 없으므로 startAfter를 사용하기 위해
      // 이전 페이지의 마지막 문서를 가져와야 함

      // 먼저 이전 페이지의 마지막 문서 위치를 찾기 위한 쿼리
      const skipCount = (page - 1) * pageSize;
      console.log(`Skipping ${skipCount} documents for page ${page}`);

      // 방법 1: 이전 페이지의 마지막 문서를 찾아 startAfter 사용
      const lastVisibleQuery = query(
        collection(db, "customers"),
        orderBy("name"),
        limit(skipCount)
      );

      const lastVisibleSnapshot = await getDocs(lastVisibleQuery);
      const lastVisibleDoc =
        lastVisibleSnapshot.docs[lastVisibleSnapshot.docs.length - 1];

      if (lastVisibleDoc) {
        // 마지막 문서가 있으면 그 이후부터 조회
        q = query(
          collection(db, "customers"),
          orderBy("name"),
          startAfter(lastVisibleDoc),
          limit(pageSize)
        );
        console.log("Using startAfter for pagination");
      } else {
        // 마지막 문서를 찾을 수 없는 경우 (데이터가 부족한 경우)
        console.log(
          "Could not find last document for pagination, returning empty result"
        );
        return {
          items: [],
          totalCount,
          currentPage: page,
          totalPages,
          hasMore: false,
        };
      }
    }

    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
    const customers: Customer[] = [];
    querySnapshot.forEach((doc) => {
      customers.push({ id: doc.id, ...doc.data() } as Customer);
    });

    console.log(`Fetched ${customers.length} customers for page ${page}`);

    return {
      items: customers,
      totalCount,
      currentPage: page,
      totalPages,
      hasMore: page < totalPages,
    };
  } catch (error) {
    console.error("거래처 목록 조회 실패:", error);
    throw error;
  }
};

// 거래처 상세 조회
export const fetchCustomer = async (id: string): Promise<Customer> => {
  try {
    console.log(`Fetching customer with ID: ${id}`);
    const docRef: DocumentReference<DocumentData> = doc(db, "customers", id);
    const docSnap: DocumentSnapshot<DocumentData> = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Customer found:", docSnap.id);
      return { id: docSnap.id, ...docSnap.data() } as Customer;
    } else {
      console.log("No customer found with ID:", id);
      throw new Error("거래처를 찾을 수 없습니다.");
    }
  } catch (error) {
    console.error("거래처 상세 조회 실패:", error);
    throw error;
  }
};

// 거래처 등록
export const createCustomer = async (
  customerData: Omit<Customer, "id">
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "customers"), {
      ...customerData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("Customer created with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("거래처 등록 실패:", error);
    throw error;
  }
};

// 거래처 수정
export const updateCustomer = async (
  id: string,
  customerData: Partial<Customer>
): Promise<void> => {
  try {
    console.log(`Updating customer with ID: ${id}`);
    const docRef = doc(db, "customers", id);
    await updateDoc(docRef, {
      ...customerData,
      updatedAt: new Date(),
    });
    console.log("Customer updated successfully");
  } catch (error) {
    console.error("거래처 수정 실패:", error);
    throw error;
  }
};

// 거래처 삭제
export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    console.log(`Deleting customer with ID: ${id}`);
    const docRef = doc(db, "customers", id);
    await deleteDoc(docRef);
    console.log("Customer deleted successfully");
  } catch (error) {
    console.error("거래처 삭제 실패:", error);
    throw error;
  }
};

// 거래처 검색
export const searchCustomers = async (
  searchTerm: string
): Promise<Customer[]> => {
  try {
    // 검색어를 소문자로 변환하고 공백 제거
    const term = searchTerm.toLowerCase().trim();
    console.log(`Searching customers with term: "${term}"`);

    // 검색어가 2글자 미만이면 빈 결과 반환
    if (term.length < 2) {
      console.log("Search term too short, returning empty result");
      return [];
    }

    // 검색 인덱스를 사용하여 검색
    const q = query(
      collection(db, "customers"),
      where("searchTerms", "array-contains", term)
    );

    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
    const customers: Customer[] = [];
    querySnapshot.forEach((doc) => {
      customers.push({ id: doc.id, ...doc.data() } as Customer);
    });

    console.log(`Search found ${customers.length} results`);
    return customers;
  } catch (error) {
    console.error("거래처 검색 실패:", error);
    throw error;
  }
};

// 검색어 생성 함수
const generateSearchTerms = (companyName: string): string[] => {
  const terms = new Set<string>();

  // 1. 원본 이름 그대로 추가
  terms.add(companyName);

  // 2. 특수문자 제거한 버전
  const cleanName = companyName.replace(/[()\s]/g, "");
  terms.add(cleanName);

  // 3. 한글만 추출
  const koreanOnly = companyName.replace(/[^가-힣]/g, "");
  if (koreanOnly) terms.add(koreanOnly);

  // 4. 2글자 이상의 모든 연속된 조합
  for (let i = 0; i < koreanOnly.length - 1; i++) {
    for (let j = i + 2; j <= koreanOnly.length; j++) {
      terms.add(koreanOnly.slice(i, j));
    }
  }

  // 5. 영문/숫자가 포함된 경우
  const engNumOnly = companyName.replace(/[^a-zA-Z0-9]/g, "");
  if (engNumOnly) terms.add(engNumOnly);

  return Array.from(terms);
};

// 모든 거래처의 검색 인덱스 업데이트
export const updateCustomerSearchIndex =
  async (): Promise<IndexUpdateResult> => {
    try {
      console.log("Updating customer search index");
      const customersRef = collection(db, "customers");
      const snapshot: QuerySnapshot<DocumentData> = await getDocs(customersRef);
      let batch = writeBatch(db);
      let count = 0;

      snapshot.forEach((doc) => {
        const customerData = doc.data();
        const searchTerms = generateSearchTerms(customerData.name);

        batch.update(doc.ref, {
          searchTerms,
          searchIndex: {
            korean: customerData.name.replace(/[^가-힣]/g, ""),
            clean: customerData.name.replace(/[()\s]/g, ""),
          },
        });

        count++;

        // 배치 크기가 500에 도달하면 커밋하고 새 배치 시작
        if (count % 500 === 0) {
          batch.commit();
          batch = writeBatch(db);
        }
      });

      // 남은 배치 커밋
      if (count % 500 !== 0) {
        await batch.commit();
      }

      console.log(`Updated search index for ${count} customers`);
      return { count };
    } catch (error) {
      console.error("Error updating customer search index:", error);
      throw error;
    }
  };
export { fetchCustomers };
