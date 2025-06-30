"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase/config";

let unsubscribe = null;
let subscribers = 0;

export const useProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    subscribers++;

    if (!unsubscribe) {
      const productsRef = collection(db, "products");
      const q = query(productsRef);

      unsubscribe = onSnapshot(q, (snapshot) => {
        const newProducts = [];
        snapshot.forEach((doc) => {
          newProducts.push({ id: doc.id, ...doc.data() });
        });

        // LocalStorage 업데이트
        try {
          localStorage.setItem("products", JSON.stringify(newProducts));
        } catch (error) {
          console.error("Error updating products in localStorage:", error);
        }

        setProducts(newProducts);
      });
    }

    return () => {
      subscribers--;
      if (subscribers === 0 && unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
    };
  }, []);

  return products;
};
