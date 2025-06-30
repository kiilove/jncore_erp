import { useState, useCallback } from "react";
import { useSales } from "../context/SalesContext";
import { validateSaleForm } from "../utils/salesUtils";

export const useSalesForm = () => {
  const { state, dispatch } = useSales();
  const [errors, setErrors] = useState({});

  const handleInputChange = useCallback(
    (field, value) => {
      dispatch({
        type: "SET_FORM_DATA",
        payload: { [field]: value },
      });
    },
    [dispatch]
  );

  const handleItemChange = useCallback(
    (index, field, value) => {
      const updatedItems = [...state.formData.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };

      dispatch({
        type: "SET_FORM_DATA",
        payload: { items: updatedItems },
      });
    },
    [dispatch, state.formData.items]
  );

  const addItem = useCallback(() => {
    const newItem = {
      product: "",
      quantity: 1,
      price: 0,
      total: 0,
    };

    dispatch({
      type: "SET_FORM_DATA",
      payload: {
        items: [...state.formData.items, newItem],
      },
    });
  }, [dispatch, state.formData.items]);

  const removeItem = useCallback(
    (index) => {
      const updatedItems = state.formData.items.filter((_, i) => i !== index);
      dispatch({
        type: "SET_FORM_DATA",
        payload: { items: updatedItems },
      });
    },
    [dispatch, state.formData.items]
  );

  const validateForm = useCallback(() => {
    const formErrors = validateSaleForm(state.formData);
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  }, [state.formData]);

  return {
    formData: state.formData,
    errors,
    handleInputChange,
    handleItemChange,
    addItem,
    removeItem,
    validateForm,
  };
};
