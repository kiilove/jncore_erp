import { collection, getDocs, addDoc, query, where, orderBy, limit, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase/config"

const COLLECTION_NAME = "stockHistory"

// 재고 이력 추가
export const addStockHistory = async (historyData) => {
  try {
    const dataToAdd = {
      ...historyData,
      timestamp: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToAdd)
    return docRef.id
  } catch (error) {
    console.error("Error adding stock history:", error)
    throw error
  }
}

// 특정 제품의 재고 이력 가져오기
export const getProductStockHistory = async (productId, limitCount = 50) => {
  try {
    const historyQuery = query(
      collection(db, COLLECTION_NAME),
      where("productId", "==", productId),
      orderBy("timestamp", "desc"),
      limit(limitCount),
    )
    const querySnapshot = await getDocs(historyQuery)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    }))
  } catch (error) {
    console.error("Error fetching stock history:", error)
    throw error
  }
}

// 최근 재고 이력 가져오기
export const getRecentStockHistory = async (limitCount = 20) => {
  try {
    const historyQuery = query(collection(db, COLLECTION_NAME), orderBy("timestamp", "desc"), limit(limitCount))
    const querySnapshot = await getDocs(historyQuery)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    }))
  } catch (error) {
    console.error("Error fetching recent stock history:", error)
    throw error
  }
}

// 특정 기간 동안의 재고 이력 가져오기
export const getStockHistoryByDateRange = async (startDate, endDate) => {
  try {
    const historyQuery = query(
      collection(db, COLLECTION_NAME),
      where("timestamp", ">=", startDate),
      where("timestamp", "<=", endDate),
      orderBy("timestamp", "desc"),
    )
    const querySnapshot = await getDocs(historyQuery)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    }))
  } catch (error) {
    console.error("Error fetching stock history by date range:", error)
    throw error
  }
}
