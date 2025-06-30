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
  startAfter,
  getDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../../firebase/config";

// 거래처 목록 조회 (페이지네이션)
export const fetchCustomers = async (page = 1, pageSize = 10) => {
  try {
    // 전체 레코드 수 조회
    const countQuery = query(collection(db, "customers"));
    const countSnapshot = await getDocs(countQuery);
    const totalCount = countSnapshot.size;
    const totalPages = Math.ceil(totalCount / pageSize);

    // 페이지 범위 체크
    if (page < 1 || page > totalPages) {
      return {
        customers: [],
        totalCount,
        currentPage: page,
        totalPages,
        hasMore: false,
      };
    }

    // 페이지네이션 쿼리
    const q = query(
      collection(db, "customers"),
      orderBy("name"),
      limit(pageSize),
      startAfter((page - 1) * pageSize)
    );

    const querySnapshot = await getDocs(q);
    const customers = [];
    querySnapshot.forEach((doc) => {
      customers.push({ id: doc.id, ...doc.data() });
    });

    return {
      customers,
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
export const fetchCustomer = async (id) => {
  try {
    const docRef = doc(db, "customers", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("거래처를 찾을 수 없습니다.");
    }
  } catch (error) {
    console.error("거래처 상세 조회 실패:", error);
    throw error;
  }
};

// 거래처 등록
export const createCustomer = async (customerData) => {
  try {
    const docRef = await addDoc(collection(db, "customers"), {
      ...customerData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("거래처 등록 실패:", error);
    throw error;
  }
};

// 거래처 수정
export const updateCustomer = async (id, customerData) => {
  try {
    const docRef = doc(db, "customers", id);
    await updateDoc(docRef, {
      ...customerData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("거래처 수정 실패:", error);
    throw error;
  }
};

// 거래처 삭제
export const deleteCustomer = async (id) => {
  try {
    const docRef = doc(db, "customers", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("거래처 삭제 실패:", error);
    throw error;
  }
};

// 거래처 검색
export const searchCustomers = async (searchTerm) => {
  try {
    // 검색어를 소문자로 변환하고 공백 제거
    const term = searchTerm.toLowerCase().trim();

    // 검색어가 2글자 미만이면 빈 결과 반환
    if (term.length < 2) {
      return [];
    }

    // 검색 인덱스를 사용하여 검색
    const q = query(
      collection(db, "customers"),
      where("searchTerms", "array-contains", term)
    );

    const querySnapshot = await getDocs(q);
    const customers = [];
    querySnapshot.forEach((doc) => {
      customers.push({ id: doc.id, ...doc.data() });
    });

    return customers;
  } catch (error) {
    console.error("거래처 검색 실패:", error);
    throw error;
  }
};

// 검색어 생성 함수
const generateSearchTerms = (companyName) => {
  const terms = new Set();

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
export const updateCustomerSearchIndex = async () => {
  try {
    const customersRef = collection(db, "customers");
    const snapshot = await getDocs(customersRef);
    const batch = writeBatch(db);
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

    return { count };
  } catch (error) {
    console.error("Error updating customer search index:", error);
    throw error;
  }
};
