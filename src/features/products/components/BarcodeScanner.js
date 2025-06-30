"use client";

import React, { useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { setupBarcodeScanner, validateBarcode } from "../utils/barcodeUtils";

const BarcodeScanner = ({ onScan }) => {
  const scanner = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scanner.current = setupBarcodeScanner((barcode) => {
      if (validateBarcode(barcode)) {
        onScan(barcode);
      }
    });

    scanner.current.start();

    return () => {
      scanner.current.stop();
    };
  }, [onScan]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiSearch className="h-5 w-5 text-gray-400" />
      </div>
      <input
        ref={inputRef}
        type="text"
        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        placeholder="바코드를 스캔하세요"
      />
    </div>
  );
};

export default BarcodeScanner;
