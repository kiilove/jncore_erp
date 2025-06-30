"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";

const SalesContext = createContext();

const initialState = {
  // CRUD 작업 상태
  operation: null, // 'create', 'read', 'update', 'delete'
  loading: false,
  error: null,

  // 현재 작업 중인 데이터
  currentSale: {
    // 기본 정보
    id: "",
    date: "",
    invoiceNumber: "",

    // 고객 정보
    customerId: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",

    // 품목 정보
    items: [],

    // 금액 정보
    subtotal: 0,
    tax: 0,
    total: 0,
    taxOption: "exclusive", // exclusive: 부가세 별도, inclusive: 부가세 포함

    // 할인 정보
    discount: 0,
    discountType: "percentage", // percentage: 퍼센트, amount: 금액

    // 결제 정보
    paymentMethod: "cash", // cash: 현금, card: 카드, transfer: 계좌이체
    paymentStatus: "pending", // pending: 미결제, paid: 결제완료

    // 기타 정보
    notes: "",
    status: "draft", // draft: 임시저장, completed: 완료, cancelled: 취소
  },

  // 검증 상태
  errors: {},
  isValid: false,

  // UI 상태
  isEdit: false,
  isDirty: false,
};

const salesReducer = (state, action) => {
  switch (action.type) {
    // CRUD 작업 상태 관리
    case "SET_OPERATION":
      return { ...state, operation: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };

    // 데이터 관리
    case "SET_CURRENT_SALE":
      return {
        ...state,
        currentSale: { ...state.currentSale, ...action.payload },
        isDirty: true,
      };
    case "RESET_CURRENT_SALE":
      return {
        ...state,
        currentSale: initialState.currentSale,
        errors: {},
        isDirty: false,
      };

    // 검증 상태 관리
    case "SET_ERRORS":
      return {
        ...state,
        errors: action.payload,
        isValid: Object.keys(action.payload).length === 0,
      };

    // UI 상태 관리
    case "SET_EDIT_MODE":
      return { ...state, isEdit: action.payload };

    // 품목 관리
    case "ADD_ITEM":
      return {
        ...state,
        currentSale: {
          ...state.currentSale,
          items: [...state.currentSale.items, action.payload],
        },
        isDirty: true,
      };
    case "UPDATE_ITEM":
      return {
        ...state,
        currentSale: {
          ...state.currentSale,
          items: state.currentSale.items.map((item) =>
            item.id === action.payload.id ? action.payload : item
          ),
        },
        isDirty: true,
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        currentSale: {
          ...state.currentSale,
          items: state.currentSale.items.filter(
            (item) => item.id !== action.payload
          ),
        },
        isDirty: true,
      };

    // 금액 계산
    case "CALCULATE_TOTALS":
      const subtotal = state.currentSale.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      const discountAmount =
        state.currentSale.discountType === "percentage"
          ? (subtotal * state.currentSale.discount) / 100
          : state.currentSale.discount;
      const amountAfterDiscount = subtotal - discountAmount;
      const tax =
        state.currentSale.taxOption === "exclusive"
          ? amountAfterDiscount * 0.1
          : 0;
      const total =
        state.currentSale.taxOption === "exclusive"
          ? amountAfterDiscount + tax
          : amountAfterDiscount;

      return {
        ...state,
        currentSale: {
          ...state.currentSale,
          subtotal,
          tax,
          total,
        },
        isDirty: true,
      };

    default:
      return state;
  }
};

export const SalesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(salesReducer, initialState);

  // CRUD 작업 상태 관리
  const setOperation = (operation) => {
    dispatch({ type: "SET_OPERATION", payload: operation });
  };

  const setLoading = (loading) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: "SET_ERROR", payload: error });
  };

  // 데이터 관리
  const updateCurrentSale = (data) => {
    dispatch({ type: "SET_CURRENT_SALE", payload: data });
  };

  const resetCurrentSale = () => {
    dispatch({ type: "RESET_CURRENT_SALE" });
  };

  // 검증 상태 관리
  const setErrors = (errors) => {
    dispatch({ type: "SET_ERRORS", payload: errors });
  };

  // UI 상태 관리
  const setEditMode = (isEdit) => {
    dispatch({ type: "SET_EDIT_MODE", payload: isEdit });
  };

  // 품목 관리
  const addItem = (item) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const updateItem = (item) => {
    dispatch({ type: "UPDATE_ITEM", payload: item });
  };

  const removeItem = (itemId) => {
    dispatch({ type: "REMOVE_ITEM", payload: itemId });
  };

  // 금액 계산
  const calculateTotals = () => {
    dispatch({ type: "CALCULATE_TOTALS" });
  };

  return (
    <SalesContext.Provider
      value={{
        // 상태
        operation: state.operation,
        loading: state.loading,
        error: state.error,
        currentSale: state.currentSale,
        errors: state.errors,
        isValid: state.isValid,
        isEdit: state.isEdit,
        isDirty: state.isDirty,

        // CRUD 작업 상태 관리
        setOperation,
        setLoading,
        setError,

        // 데이터 관리
        updateCurrentSale,
        resetCurrentSale,

        // 검증 상태 관리
        setErrors,

        // UI 상태 관리
        setEditMode,

        // 품목 관리
        addItem,
        updateItem,
        removeItem,

        // 금액 계산
        calculateTotals,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error("useSales must be used within a SalesProvider");
  }
  return context;
};
