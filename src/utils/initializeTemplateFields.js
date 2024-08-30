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

  console.log("initialData:", initialData);
  Object.keys(initialData).forEach((firestoreKey) => {
    console.log("firestoreKey:", firestoreKey);

    // 템플릿에서 필드 매핑을 가져옴
    console.log(estimateTemplates[selectedTemplate]);
    const templateKey = Object.keys(estimateTemplates[selectedTemplate]).find(
      (key) =>
        estimateTemplates[selectedTemplate][key].ko === firestoreKey ||
        estimateTemplates[selectedTemplate][key].en === firestoreKey
    );

    console.log("templateKey:", templateKey);

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
