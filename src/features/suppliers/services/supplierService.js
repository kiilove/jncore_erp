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
  getDoc,
} from "firebase/firestore"
import { db } from "../../../firebase/config"

// 공급업체 목록 가져오기
export const fetchSuppliers = async (searchTerm = "") => {
  try {
    let suppliersQuery

    if (searchTerm) {
      // Firebase에서는 LIKE 쿼리를 직접 지원하지 않으므로 클라이언트에서 필터링
      suppliersQuery = query(collection(db, "suppliers"), orderBy("name"))
    } else {
      suppliersQuery = query(collection(db, "suppliers"), orderBy("name"))
    }

    const querySnapshot = await getDocs(suppliersQuery)

    let suppliersList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() || null,
    }))

    // 검색어가 있으면 클라이언트에서 필터링
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      suppliersList = suppliersList.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(lowerSearchTerm) ||
          supplier.contactPerson?.toLowerCase().includes(lowerSearchTerm) ||
          supplier.email?.toLowerCase().includes(lowerSearchTerm) ||
          supplier.phone?.includes(searchTerm),
      )
    }

    return suppliersList
  } catch (error) {
    console.error("Error fetching suppliers: ", error)
    throw error
  }
}

// 단일 공급업체 가져오기
export const fetchSupplierById = async (supplierId) => {
  try {
    const supplierDoc = await getDoc(doc(db, "suppliers", supplierId))

    if (supplierDoc.exists()) {
      const supplierData = supplierDoc.data()
      return {
        id: supplierDoc.id,
        ...supplierData,
        createdAt: supplierData.createdAt?.toDate().toISOString() || null,
      }
    } else {
      throw new Error("Supplier not found")
    }
  } catch (error) {
    console.error("Error fetching supplier: ", error)
    throw error
  }
}

// 공급업체 추가
export const addSupplier = async (supplierData) => {
  try {
    const dataToSave = {
      ...supplierData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const docRef = await addDoc(collection(db, "suppliers"), dataToSave)
    return { id: docRef.id, ...dataToSave }
  } catch (error) {
    console.error("Error adding supplier: ", error)
    throw error
  }
}

// 공급업체 수정
export const updateSupplier = async (supplierId, supplierData) => {
  try {
    const dataToUpdate = {
      ...supplierData,
      updatedAt: new Date(),
    }

    await updateDoc(doc(db, "suppliers", supplierId), dataToUpdate)
    return { id: supplierId, ...dataToUpdate }
  } catch (error) {
    console.error("Error updating supplier: ", error)
    throw error
  }
}

// 공급업체 삭제
export const deleteSupplier = async (supplierId) => {
  try {
    // 공급업체 관련 매입 내역 확인
    const purchasesQuery = query(collection(db, "purchases"), where("supplierId", "==", supplierId))

    const purchasesSnapshot = await getDocs(purchasesQuery)

    if (!purchasesSnapshot.empty) {
      throw new Error("Cannot delete supplier with existing purchase records")
    }

    await deleteDoc(doc(db, "suppliers", supplierId))
    return { success: true, id: supplierId }
  } catch (error) {
    console.error("Error deleting supplier: ", error)
    throw error
  }
}

// 공급업체 거래 내역 가져오기
export const fetchSupplierTransactions = async (supplierId) => {
  try {
    const purchasesQuery = query(
      collection(db, "purchases"),
      where("supplierId", "==", supplierId),
      orderBy("date", "desc"),
    )

    const querySnapshot = await getDocs(purchasesQuery)

    const transactions = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate().toISOString().split("T")[0],
    }))

    return transactions
  } catch (error) {
    console.error("Error fetching supplier transactions: ", error)
    throw error
  }
}

// 공급업체 통계 가져오기
export const fetchSupplierStats = async (supplierId) => {
  try {
    const purchasesQuery = query(collection(db, "purchases"), where("supplierId", "==", supplierId))

    const querySnapshot = await getDocs(purchasesQuery)

    const purchases = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // 총 거래액
    const totalAmount = purchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0)

    // 미지급액
    const unpaidAmount = purchases
      .filter((purchase) => purchase.paymentStatus === "미지급" || purchase.paymentStatus === "부분지급")
      .reduce((sum, purchase) => sum + (purchase.total || 0), 0)

    // 최근 거래일
    const dates = purchases.map((purchase) => purchase.date.toDate())
    const lastTransactionDate = dates.length > 0 ? new Date(Math.max(...dates)) : null

    return {
      totalAmount,
      transactionCount: purchases.length,
      unpaidAmount,
      lastTransactionDate: lastTransactionDate ? lastTransactionDate.toISOString().split("T")[0] : null,
    }
  } catch (error) {
    console.error("Error fetching supplier stats: ", error)
    throw error
  }
}

export default {
  fetchSuppliers,
  fetchSupplierById,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  fetchSupplierTransactions,
  fetchSupplierStats,
}
