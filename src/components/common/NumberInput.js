"use client";

import { useState, useEffect } from "react";

const NumberInput = ({
  value,
  onChange,
  className = "",
  placeholder = "",
  disabled = false,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState("");

  // 숫자와 소수점만 허용하는 정규식
  const numberRegex = /^[0-9]*\.?[0-9]*$/;

  // 숫자에 콤마를 추가하는 함수
  const formatNumber = (num) => {
    if (!num) return "";
    const parts = num.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  // 콤마를 제거하는 함수
  const removeCommas = (str) => {
    return str.replace(/,/g, "");
  };

  // 초기값 설정
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setDisplayValue(formatNumber(value));
    }
  }, [value]);

  const handleChange = (e) => {
    const inputValue = e.target.value;

    // 입력값이 유효한 숫자 형식인지 확인
    if (inputValue === "" || numberRegex.test(removeCommas(inputValue))) {
      // 입력 중에도 콤마 표시
      const formattedValue =
        inputValue === "" ? "" : formatNumber(removeCommas(inputValue));
      setDisplayValue(formattedValue);

      // 콤마를 제거한 값을 부모 컴포넌트에 전달
      const numericValue = inputValue === "" ? "" : removeCommas(inputValue);
      onChange(numericValue);
    }
  };

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      className={`w-full h-7 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-xs px-3 text-right pr-4 ${className}`}
      placeholder={placeholder}
      disabled={disabled}
      {...props}
    />
  );
};

export default NumberInput;
