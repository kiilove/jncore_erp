// utils/initializeTemplateFields.js

import { estimateTemplates } from "../commons/QuoteTemplate";
import { removeQuotes, adjustModelName } from "./utils";
import { fieldMapping, fieldOrder } from "../commons/fieldConfig";

export const initializeTemplateFields = (
  initialData,
  selectedTemplate,
  language
) => {
  const mappedData = {};
  const additionalFields = { ...initialData };

  if (initialData["검색모델명"]) {
    const adjustedNames = adjustModelName(
      initialData["검색모델명"],
      initialData["모델명"]
    );
    mappedData["brand"] = {
      value: adjustedNames.brand,
      order: fieldOrder.indexOf("brand"),
    };
    mappedData["model"] = {
      value: adjustedNames.model,
      order: fieldOrder.indexOf("model"),
    };
  }

  Object.keys(initialData).forEach((firestoreKey) => {
    // 템플릿에서 필드 매핑을 가져옴

    const templateKey = Object.keys(estimateTemplates[selectedTemplate]).find(
      (key) =>
        estimateTemplates[selectedTemplate][key].ko === firestoreKey ||
        estimateTemplates[selectedTemplate][key].en === firestoreKey
    );

    if (templateKey && initialData[firestoreKey] !== "") {
      if (!(templateKey === "model" && mappedData["model"])) {
        mappedData[templateKey] = {
          value: removeQuotes(initialData[firestoreKey]),
          order: fieldOrder.indexOf(templateKey),
        };
        delete additionalFields[firestoreKey];
      }
    }
  });

  const templateFields = fieldOrder.map((key) => ({
    key,
    label: estimateTemplates[selectedTemplate][key][language],
    value: mappedData[key]?.value || "",
    order: mappedData[key]?.order || fieldOrder.indexOf(key),
  }));

  return { mappedData, additionalFields, templateFields };
};

export const rawDataReduceObject = (product, estimateTemplates) => {
  return Object.keys(product)
    .filter((key) => product[key]?.value !== undefined) // Filters out keys with undefined values
    .sort((a, b) => product[a].order - product[b].order) // Sort by order
    .map((key, idx) => {
      const { value } = product[key];
      const label = estimateTemplates[product.타입]?.[key]?.ko || key; // Use a label from estimateTemplates or fallback to key
      return {
        key,
        label, // The label based on the template
        value, // The actual value of the product attribute
        order: idx,
      };
    });
};
