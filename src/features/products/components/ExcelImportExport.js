import React from "react";
import { exportToExcel, importFromExcel } from "../../sales/utils/excelUtils";
import Button from "../../../components/common/Button";

const ExcelImportExport = ({ data, onImport }) => {
  const handleExport = () => {
    exportToExcel(data, "products.xlsx");
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const importedData = await importFromExcel(file);
        onImport(importedData);
      } catch (error) {
        console.error("Error importing Excel file:", error);
      }
    }
  };

  return (
    <div className="flex space-x-4">
      <Button onClick={handleExport} variant="success">
        Excel로 내보내기
      </Button>
      <div>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleImport}
          className="hidden"
          id="excel-import"
        />
        <Button
          onClick={() => document.getElementById("excel-import").click()}
          variant="info"
        >
          Excel 가져오기
        </Button>
      </div>
    </div>
  );
};

export default ExcelImportExport;
