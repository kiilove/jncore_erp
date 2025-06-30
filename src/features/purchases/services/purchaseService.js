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

// 매입 데이터 가져오기
export const fetchPurchases = async (filters = {}) => {
  try {
    let purchasesQuery = collection(db, "purchases")

    // 필터 적용
    if (filters.startDate && filters.endDate) {
      purchasesQuery = query(
        purchasesQuery,
        where("date", ">=", new Date(filters.startDate)),
        where("date", "<=", new Date(filters.endDate)),
      )
    } else if (filters.supplier) {
      purchasesQuery = query(purchasesQuery, where("supplier", "==", filters.supplier))
    } else if (filters.status) {
      purchasesQuery = query(purchasesQuery, where("status", "==", filters.status))
    } else {
      purchasesQuery = query(purchasesQuery, orderBy("date", "desc"))
    }

    const querySnapshot = await getDocs(purchasesQuery)

    const purchasesList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate().toISOString().split("T")[0],
    }))

    return purchasesList
  } catch (error) {
    console.error("Error fetching purchases: ", error)
    throw error
  }
}

// 단일 매입 데이터 가져오기
export const fetchPurchaseById = async (purchaseId) => {
  try {
    const purchaseDoc = await getDoc(doc(db, "purchases", purchaseId))

    if (purchaseDoc.exists()) {
      const purchaseData = purchaseDoc.data()
      return {
        id: purchaseDoc.id,
        ...purchaseData,
        date: purchaseData.date.toDate().toISOString().split("T")[0],
      }
    } else {
      throw new Error("Purchase not found")
    }
  } catch (error) {
    console.error("Error fetching purchase: ", error)
    throw error
  }
}

// 매입 추가
export const addPurchase = async (purchaseData) => {
  try {
    const dataToSave = {
      ...purchaseData,
      date: new Date(purchaseData.date),
      total: calculateTotal(purchaseData.items),
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentStatus: purchaseData.paymentStatus || "미지급",
      paymentDueDate: purchaseData.paymentDueDate ? new Date(purchaseData.paymentDueDate) : null,
    }

    const docRef = await addDoc(collection(db, "purchases"), dataToSave)

    // 재고 업데이트
    await updateInventoryFromPurchase(purchaseData.items)

    return { id: docRef.id, ...dataToSave }
  } catch (error) {
    console.error("Error adding purchase: ", error)
    throw error
  }
}

// 매입 수정
export const updatePurchase = async (purchaseId, purchaseData) => {
  try {
    // 기존 매입 데이터 가져오기
    const oldPurchaseData = await fetchPurchaseById(purchaseId)

    const dataToUpdate = {
      ...purchaseData,
      date: new Date(purchaseData.date),
      total: calculateTotal(purchaseData.items),
      updatedAt: new Date(),
      paymentDueDate: purchaseData.paymentDueDate ? new Date(purchaseData.paymentDueDate) : null,
    }

    await updateDoc(doc(db, "purchases", purchaseId), dataToUpdate)

    // 재고 업데이트 (기존 항목 취소 후 새 항목 적용)
    await updateInventoryFromPurchaseUpdate(oldPurchaseData.items, purchaseData.items)

    return { id: purchaseId, ...dataToUpdate }
  } catch (error) {
    console.error("Error updating purchase: ", error)
    throw error
  }
}

// 매입 삭제
export const deletePurchase = async (purchaseId) => {
  try {
    // 기존 매입 데이터 가져오기
    const purchaseData = await fetchPurchaseById(purchaseId)

    await deleteDoc(doc(db, "purchases", purchaseId))

    // 재고 업데이트 (매입 취소)
    await cancelInventoryFromPurchase(purchaseData.items)

    return { success: true, id: purchaseId }
  } catch (error) {
    console.error("Error deleting purchase: ", error)
    throw error
  }
}

// 매입금 지불 상태 업데이트
export const updatePaymentStatus = async (purchaseId, paymentStatus, paymentDate = null) => {
  try {
    const dataToUpdate = {
      paymentStatus,
      updatedAt: new Date(),
    }

    if (paymentDate) {
      dataToUpdate.paymentDate = new Date(paymentDate)
    }

    if (paymentStatus === "완료") {
      dataToUpdate.paymentCompletedAt = new Date()
    }

    await updateDoc(doc(db, "purchases", purchaseId), dataToUpdate)

    return { success: true, id: purchaseId }
  } catch (error) {
    console.error("Error updating payment status: ", error)
    throw error
  }
}

// 매입 통계 가져오기
export const fetchPurchaseStats = async (period = "month") => {
  try {
    let startDate
    const now = new Date()

    if (period === "week") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    } else if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    } else if (period === "quarter") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
    } else if (period === "year") {
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    }

    const purchasesQuery = query(collection(db, "purchases"), where("date", ">=", startDate), where("date", "<=", now))

    const querySnapshot = await getDocs(purchasesQuery)

    const purchases = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // 총 매입액
    const totalAmount = purchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0)

    // 공급업체별 매입액
    const supplierStats = purchases.reduce((acc, purchase) => {
      const supplier = purchase.supplier
      if (!acc[supplier]) {
        acc[supplier] = 0
      }
      acc[supplier] += purchase.total || 0
      return acc
    }, {})

    // 결제 상태별 매입액
    const paymentStatusStats = purchases.reduce((acc, purchase) => {
      const status = purchase.paymentStatus || "미지급"
      if (!acc[status]) {
        acc[status] = 0
      }
      acc[status] += purchase.total || 0
      return acc
    }, {})

    return {
      totalAmount,
      purchaseCount: purchases.length,
      supplierStats,
      paymentStatusStats,
    }
  } catch (error) {
    console.error("Error fetching purchase stats: ", error)
    throw error
  }
}

// 미지급 매입금 가져오기
export const fetchUnpaidPurchases = async () => {
  try {
    const purchasesQuery = query(collection(db, "purchases"), where("paymentStatus", "in", ["미지급", "부분지급"]))

    const querySnapshot = await getDocs(purchasesQuery)

    const unpaidPurchases = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate().toISOString().split("T")[0],
      paymentDueDate: doc.data().paymentDueDate ? doc.data().paymentDueDate.toDate().toISOString().split("T")[0] : null,
    }))

    return unpaidPurchases
  } catch (error) {
    console.error("Error fetching unpaid purchases: ", error)
    throw error
  }
}

// 내부 유틸리티 함수
const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    return total + item.quantity * item.price
  }, 0)
}

// 재고 업데이트 함수
const updateInventoryFromPurchase = async (items) => {
  try {
    for (const item of items) {
      if (!item.productId) continue

      const productRef = doc(db, "products", item.productId)
      const productDoc = await getDoc(productRef)

      if (productDoc.exists()) {
        const currentStock = productDoc.data().stock || 0
        const newStock = currentStock + item.quantity

        await updateDoc(productRef, {
          stock: newStock,
          lastUpdated: new Date(),
        })

        // 재고 이력 추가
        await addDoc(collection(db, "stockHistory"), {
          productId: item.productId,
          productName: item.name,
          previousStock: currentStock,
          newStock: newStock,
          change: item.quantity,
          type: "매입",
          date: new Date(),
          notes: `매입을 통한 재고 증가`,
        })
      }
    }
  } catch (error) {
    console.error("Error updating inventory: ", error)
    throw error
  }
}

// 매입 수정 시 재고 업데이트
const updateInventoryFromPurchaseUpdate = async (oldItems, newItems) => {
  try {
    // 기존 항목 재고 취소
    await cancelInventoryFromPurchase(oldItems)

    // 새 항목 재고 추가
    await updateInventoryFromPurchase(newItems)
  } catch (error) {
    console.error("Error updating inventory on purchase update: ", error)
    throw error
  }
}

// 매입 취소 시 재고 업데이트
const cancelInventoryFromPurchase = async (items) => {
  try {
    for (const item of items) {
      if (!item.productId) continue

      const productRef = doc(db, "products", item.productId)
      const productDoc = await getDoc(productRef)

      if (productDoc.exists()) {
        const currentStock = productDoc.data().stock || 0
        const newStock = Math.max(0, currentStock - item.quantity)

        await updateDoc(productRef, {
          stock: newStock,
          lastUpdated: new Date(),
        })

        // 재고 이력 추가
        await addDoc(collection(db, "stockHistory"), {
          productId: item.productId,
          productName: item.name,
          previousStock: currentStock,
          newStock: newStock,
          change: -item.quantity,
          type: "매입취소",
          date: new Date(),
          notes: `매입 취소로 인한 재고 감소`,
        })
      }
    }
  } catch (error) {
    console.error("Error canceling inventory from purchase: ", error)
    throw error
  }
}

export default {
  fetchPurchases,
  fetchPurchaseById,
  addPurchase,
  updatePurchase,
  deletePurchase,
  updatePaymentStatus,
  fetchPurchaseStats,
  fetchUnpaidPurchases,
}
