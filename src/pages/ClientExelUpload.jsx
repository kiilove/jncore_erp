import React, { useState } from "react";
import { Upload, Button, Table, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import {
  writeBatch,
  collection,
  doc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase"; // Firestore 인스턴스 가져오기

const ClientExcelUpload = () => {
  const [data, setData] = useState([]); // 전체 데이터를 저장할 상태
  const [tableData, setTableData] = useState([]); // 테이블에 표시할 데이터를 저장할 상태
  const [columns, setColumns] = useState([]); // 테이블의 컬럼 정의 상태
  const [selectedRowKeys, setSelectedRowKeys] = useState([]); // 선택된 행의 키를 관리하는 상태

  // 테이블에 표시할 필터링된 컬럼들
  const allowedColumns = [
    "거래처상호",
    "대표자명",
    "사업자주소",
    "업태",
    "종목",
    "거래처등록번호",
    "성명",
    "전화번호",
    "휴대전화번호",
    "팩스번호",
    "이메일 주소",
  ];

  // undefined 값을 ""로 대체하는 유틸리티 함수
  const sanitizeData = (data) => {
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = data[key] !== undefined && data[key] !== null ? data[key] : "";
      return acc;
    }, {});
  };

  const sanitizeCompanyName = (name) => {
    return name
      .replace(
        /^\s*\(?(주|유|사|합|협|재|재단|비영리|학교|병원|의료법인)\)?/,
        ""
      )
      .trim();
  };

  const handleFileUpload = ({ file }) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0]; // 첫 번째 시트를 선택
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (jsonData.length > 0) {
        const headers = jsonData[0]; // 첫 번째 row는 헤더
        const rows = jsonData.slice(1); // 그 이후는 데이터

        // 전체 데이터를 변환, [폐업] 항목 제거
        const fullData = rows
          .map((row, index) => {
            const rowData = {};
            headers.forEach((header, i) => {
              rowData[header] = row[i];
            });

            // 상호명_간단 필드를 추가하여 저장
            rowData["상호명_간단"] = sanitizeCompanyName(rowData["거래처상호"]);

            return { key: index, ...rowData };
          })
          .filter((row) => !row["거래처상호"]?.includes("[폐업]")); // [폐업]이 포함된 항목 제외

        // 거래처등록번호 기준으로 그룹화 및 담당자 배열로 처리
        const groupedData = fullData.reduce((acc, row) => {
          const existingIndex = acc.findIndex(
            (item) => item["거래처등록번호"] === row["거래처등록번호"]
          );

          const contactInfo = sanitizeData({
            성명: row["성명"],
            전화번호: row["전화번호"],
            휴대전화번호: row["휴대전화번호"],
            팩스번호: row["팩스번호"],
            이메일: row["이메일주소"],
          });

          if (existingIndex !== -1) {
            // 이미 존재하는 거래처등록번호이면 담당자 정보를 배열에 추가
            acc[existingIndex]["담당자"].push(contactInfo);
          } else {
            // 새로운 거래처등록번호이면 데이터 추가
            acc.push({
              ...sanitizeData(row),
              담당자: [contactInfo], // 담당자 정보를 배열로 초기화
            });
          }

          return acc;
        }, []);

        // 테이블에 표시할 데이터 생성 (필터링된 컬럼만 사용)
        const tableFilteredData = groupedData.map((row) => {
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
        setTableData(tableFilteredData); // 테이블에 보여줄 데이터 설정
        setData(groupedData); // 그룹화된 전체 데이터를 저장할 때 사용
      }
    };

    reader.readAsBinaryString(file);
  };

  // 테이블에서 선택된 행을 관리하는 함수
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

    const batch = writeBatch(db); // 배치 쓰기 초기화

    for (let index of selectedRowKeys) {
      const selectedClient = data.find((item) => item.key === index); // 전체 데이터에서 선택된 항목 가져옴

      try {
        const clientsRef = collection(db, "clients");

        // Firestore에서 해당 거래처가 있는지 확인 (where 조건 사용)
        const q = query(
          clientsRef,
          where("거래처등록번호", "==", selectedClient["거래처등록번호"])
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // 이미 존재하는 거래처가 있으면 담당자 배열을 업데이트
          querySnapshot.forEach((doc) => {
            const existingClientData = doc.data();
            const updatedContacts = Array.isArray(existingClientData["담당자"])
              ? [...existingClientData["담당자"], ...selectedClient["담당자"]]
              : selectedClient["담당자"];

            batch.update(doc.ref, {
              담당자: updatedContacts,
            });
          });
        } else {
          // 존재하지 않으면 전체 데이터를 Firestore에 추가
          const newDocRef = doc(clientsRef);
          batch.set(newDocRef, selectedClient);
        }
      } catch (error) {
        message.error("저장 중 오류가 발생했습니다.");
        console.error("Error saving client:", error);
        return;
      }
    }

    // 배치 쓰기 커밋
    try {
      await batch.commit();
      message.success("선택한 항목이 Firestore에 성공적으로 저장되었습니다.");
    } catch (error) {
      message.error("Firestore에 저장하는 중에 오류가 발생했습니다.");
      console.error("Error committing batch:", error);
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

export default ClientExcelUpload;
