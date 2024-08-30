import React, { useState } from "react";
import { Upload, Button, Table, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import {
  useFirestoreQuery,
  useFirestoreAddData,
  useFirestoreUpdateData,
} from "../hooks/useFirestore"; // Firestore 커스텀 훅
import { where } from "firebase/firestore";

const ProductExcelUpload = () => {
  const [data, setData] = useState([]); // 실제 전체 데이터
  const [tableData, setTableData] = useState([]); // 테이블에 보여줄 데이터
  const [columns, setColumns] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const findProducts = useFirestoreQuery();
  const { addData } = useFirestoreAddData();
  const { updateData } = useFirestoreUpdateData();

  // 테이블에 표시할 필터링할 컬럼들
  const allowedColumns = [
    "제품종류",
    "제품제조사",
    "모델명",
    "price",
    "stock",
    "cpu",
    "storage",
    "ram",
    "gpu",
    "display",
    "os",
  ];

  const handleFileUpload = ({ file }) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0]; // 첫 번째 시트 선택
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (jsonData.length > 0) {
        const headers = jsonData[0]; // 첫 번째 row는 헤더
        const rows = jsonData.slice(1); // 그 이후는 데이터

        // 전체 데이터를 변환
        const fullData = rows.map((row, index) => {
          const rowData = {};
          headers.forEach((header, i) => {
            rowData[header] = row[i];
          });
          return { key: index, ...rowData };
        });

        // 테이블에 표시할 데이터 생성 (필터링된 컬럼만 사용)
        const tableFilteredData = fullData.map((row) => {
          const filteredRow = {};
          allowedColumns.forEach((col) => {
            if (row[col]) {
              filteredRow[col] = row[col];
            }
          });
          return { ...filteredRow, key: row.key, uuid: row.uuid }; // uuid는 추가로 저장에 사용되므로 포함
        });

        // 테이블 컬럼 생성 (필터링된 컬럼만)
        const tableColumns = headers
          .filter((header) => allowedColumns.includes(header))
          .map((header) => ({
            title: header,
            dataIndex: header,
            key: header,
          }));

        setColumns(tableColumns);
        setTableData(tableFilteredData); // 테이블에 보여줄 데이터
        setData(fullData); // 전체 데이터를 저장할 때 사용
      }
    };

    reader.readAsBinaryString(file);
  };

  // 테이블에서 선택된 행을 관리
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys) => {
      setSelectedRowKeys(selectedRowKeys);
    },
  };

  const handleSaveToFirestore = async () => {
    if (selectedRowKeys.length === 0) {
      message.error("저장할 항목을 선택하세요.");
      return;
    }

    for (let index of selectedRowKeys) {
      const selectedProduct = data.find((item) => item.key === index); // 실제 전체 데이터에서 선택된 항목 가져옴

      try {
        // Firestore에서 해당 uuid가 있는지 확인 (where 조건 사용)
        const existingProduct = await findProducts.getDocuments(
          "products",
          () => {},
          [where("uuid", "==", selectedProduct.UUID)]
        );

        // undefined 값들을 ""로 대체
        const sanitizedProduct = Object.keys(selectedProduct).reduce(
          (acc, key) => {
            acc[key] =
              selectedProduct[key] !== undefined ? selectedProduct[key] : "";
            return acc;
          },
          {}
        );

        if (existingProduct?.length > 0) {
          // 이미 존재하는 제품이 있으면 입고가와 재고만 업데이트
          const productId = existingProduct[0].id;
          await updateData("products", productId, {
            price: selectedProduct["price"],
            stock: selectedProduct["price"],
          });
          message.success(`${selectedProduct["모델명"]} 업데이트 완료`);
        } else {
          // 존재하지 않으면 전체 데이터를 Firestore에 추가
          await addData("products", sanitizedProduct, (data, err) => {
            message.success(`${sanitizedProduct["모델명"]} 추가 완료`);
          }); // 선택된 전체 데이터 저장
        }
      } catch (error) {
        message.error("저장 중 오류가 발생했습니다.");
        console.error("Error saving product:", error);
      }
    }
  };

  return (
    <div>
      <Upload
        beforeUpload={() => false} // 파일을 서버로 업로드하지 않음
        onChange={handleFileUpload}
        accept=".xlsx, .xls"
      >
        <Button icon={<UploadOutlined />}>엑셀 파일 업로드</Button>
      </Upload>

      {tableData.length > 0 && (
        <>
          <Table
            rowSelection={{
              type: "checkbox",
              ...rowSelection,
            }}
            columns={columns}
            dataSource={tableData} // 필터링된 데이터를 테이블에 표시
            pagination={false}
            style={{ marginTop: 20 }}
          />
          <Button
            type="primary"
            onClick={handleSaveToFirestore}
            style={{ marginTop: 20 }}
          >
            저장하기
          </Button>
        </>
      )}
    </div>
  );
};

export default ProductExcelUpload;
