// utils/utils.js

export const removeQuotes = (value) => {
  if (
    typeof value === "string" &&
    value.startsWith('"') &&
    value.endsWith('"')
  ) {
    return value.slice(1, -1);
  }
  return value;
};

export const adjustModelName = (searchModelName, realModelName) => {
  if (typeof searchModelName === "string") {
    let parts = searchModelName.trim().split(" ");
    let brand = "";

    if (parts.length > 0) {
      brand = parts[0]; // 첫 번째 항목을 brand로 저장
      parts[parts.length - 1] = realModelName; // 마지막 항목을 realModelName으로 변경
    }

    return {
      brand,
      model: parts.join(" "), // 나머지 부분을 모델명으로 반환
    };
  }
  return { brand: "", model: searchModelName };
};
