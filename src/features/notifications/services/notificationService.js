import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "../firebase/config"

// 알림 유형
export const NOTIFICATION_TYPES = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
}

// 알림 생성
export const createNotification = async (userId, title, message, options = {}) => {
  try {
    const notificationData = {
      userId,
      title,
      message,
      type: options.type || NOTIFICATION_TYPES.INFO,
      read: false,
      createdAt: serverTimestamp(),
      link: options.link || null,
      relatedId: options.relatedId || null,
      category: options.category || "general",
    }

    const docRef = await addDoc(collection(db, "notifications"), notificationData)
    return docRef.id
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

// 사용자의 알림 가져오기
export const getUserNotifications = async (userId, limit = 50) => {
  try {
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limit),
    )

    const querySnapshot = await getDocs(notificationsQuery)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }))
  } catch (error) {
    console.error("Error fetching user notifications:", error)
    throw error
  }
}

// 재고 부족 알림 생성
export const createLowStockNotification = async (userId, product) => {
  const title = "재고 부족 알림"
  const message = `${product.name} 제품의 재고가 부족합니다. 현재 재고: ${product.stock}개`

  return createNotification(userId, title, message, {
    type: NOTIFICATION_TYPES.WARNING,
    link: `/products?id=${product.id}`,
    relatedId: product.id,
    category: "inventory",
  })
}

// 재고 소진 알림 생성
export const createOutOfStockNotification = async (userId, product) => {
  const title = "재고 소진 알림"
  const message = `${product.name} 제품의 재고가 소진되었습니다.`

  return createNotification(userId, title, message, {
    type: NOTIFICATION_TYPES.ERROR,
    link: `/products?id=${product.id}`,
    relatedId: product.id,
    category: "inventory",
  })
}

// 매출 생성 알림
export const createSaleNotification = async (userId, sale) => {
  const title = "새로운 매출 등록"
  const message = `${sale.customer}에 대한 ${new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(sale.total)} 매출이 등록되었습니다.`

  return createNotification(userId, title, message, {
    type: NOTIFICATION_TYPES.SUCCESS,
    link: `/sales-invoice?id=${sale.id}`,
    relatedId: sale.id,
    category: "sales",
  })
}

// 시스템 알림 생성 (모든 관리자에게)
export const createSystemNotification = async (title, message, options = {}) => {
  try {
    // 관리자 역할을 가진 사용자 찾기
    const usersQuery = query(collection(db, "users"), where("roles", "array-contains", "admin"))

    const querySnapshot = await getDocs(usersQuery)
    const adminUsers = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // 각 관리자에게 알림 생성
    const notificationPromises = adminUsers.map((user) =>
      createNotification(user.id, title, message, {
        ...options,
        category: options.category || "system",
      }),
    )

    await Promise.all(notificationPromises)
    return true
  } catch (error) {
    console.error("Error creating system notification:", error)
    throw error
  }
}
