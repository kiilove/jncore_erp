import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "../../../firebase/config"

const COLLECTION_NAME = "products"

// 모든 제품 데이터 가져오기
export const getAllProducts = async () => {
  try {
    const productsQuery = query(collection(db, COLLECTION_NAME), orderBy("name"))
    const querySnapshot = await getDocs(productsQuery)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error fetching products:", error)
    throw error
  }
}

// 특정 카테고리의 제품 데이터 가져오기
export const getProductsByCategory = async (category) => {
  try {
    const productsQuery = query(collection(db, COLLECTION_NAME), where("category", "==", category), orderBy("name"))
    const querySnapshot = await getDocs(productsQuery)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error fetching products by category:", error)
    throw error
  }
}

// 특정 제품 데이터 가져오기
export const getProductById = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      }
    } else {
      throw new Error("Product not found")
    }
  } catch (error) {
    console.error("Error fetching product:", error)
    throw error
  }
}

// 제품 데이터 추가
export const addProduct = async (productData, userId) => {
  try {
    const dataToAdd = {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToAdd)
    return docRef.id
  } catch (error) {
    console.error("Error adding product:", error)
    throw error
  }
}

// 제품 데이터 수정
export const updateProduct = async (id, productData, userId) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const dataToUpdate = {
      ...productData,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    }

    await updateDoc(docRef, dataToUpdate)
    return id
  } catch (error) {
    console.error("Error updating product:", error)
    throw error
  }
}

// 제품 데이터 삭제
export const deleteProduct = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
    return id
  } catch (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}

// 재고 업데이트
export const updateStock = async (id, quantity, userId) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error("Product not found")
    }

    const currentStock = docSnap.data().stock || 0
    const newStock = currentStock + quantity

    if (newStock < 0) {
      throw new Error("Stock cannot be negative")
    }

    await updateDoc(docRef, {
      stock: newStock,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    })

    return {
      id,
      stock: newStock,
    }
  } catch (error) {
    console.error("Error updating stock:", error)
    throw error
  }
}
