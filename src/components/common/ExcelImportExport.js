"use client";

import { useState } from "react";
import { FiUpload, FiDownload } from "react-icons/fi";
import {
  exportProductsToExcel,
  importFromExcel,
  convertExcelToProducts,
} from "../utils/excelUtils";

const ExcelImportExport = ({ data, onImport }) => {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const handleExport = async () => {
    try {
      setExporting(true);
      setError("");

      exportProductsToExcel(data);

      setExporting(false);
    } catch (error) {
      console.error("Error exporting data:", error);
      setError("데이터 내보내기 중 오류가 발생했습니다.");
      setExporting(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setImporting(true);
      setError("");

      const excelData = await importFromExcel(file);
      const products = convertExcelToProducts(excelData);

      onImport(products);
      setImporting(false);
    } catch (error) {
      console.error("Error importing data:", error);
      setError("데이터 가져오기 중 오류가 발생했습니다.");
      setImporting(false);
    }

    // 파일 입력 초기화
    e.target.value = null;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <button
        onClick={handleExport}
        disabled={exporting || data.length === 0}
        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
      >
        <FiDownload className="mr-2" />
        {exporting ? "내보내는 중..." : "엑셀로 내보내기"}
      </button>

      <label className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer disabled:opacity-50">
        <FiUpload className="mr-2" />
        {importing ? "가져오는 중..." : "엑셀에서 가져오기"}
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleImport}
          disabled={importing}
          className="hidden"
        />
      </label>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default ExcelImportExport;
