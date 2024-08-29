// hooks/useFieldManagement.js

import { useState } from "react";

export const useFieldManagement = (initialFields = [], initialData = {}) => {
  const [templateFields, setTemplateFields] = useState(initialFields);
  const [formData, setFormData] = useState(initialData);

  const handleInputChange = (key, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [key]: { ...prevFormData[key], value },
    }));
  };

  const handleAddField = (key, value) => {
    const nextOrder = templateFields.length;
    const newField = {
      key,
      label: key,
      value,
      order: nextOrder,
    };

    setTemplateFields((prevFields) => [...prevFields, newField]);

    setFormData((prevFormData) => ({
      ...prevFormData,
      [key]: { value: newField.value, order: nextOrder },
    }));
  };

  const handleDeleteField = (key) => {
    setTemplateFields((prevFields) =>
      prevFields.filter((field) => field.key !== key)
    );
    setFormData((prevFormData) => {
      const { [key]: _, ...rest } = prevFormData;
      return rest;
    });
  };

  const moveField = (index, direction) => {
    const updatedFields = [...templateFields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < updatedFields.length) {
      const temp = updatedFields[targetIndex];
      updatedFields[targetIndex] = updatedFields[index];
      updatedFields[index] = temp;
      setTemplateFields(updatedFields);
    }
  };

  return {
    formData,
    setFormData,
    templateFields,
    setTemplateFields,
    handleInputChange,
    handleAddField,
    handleDeleteField,
    moveField,
  };
};
