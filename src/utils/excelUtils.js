import * as XLSX from "xlsx"

// 데이터를 엑셀 파일로 내보내기
export const exportToExcel = (data, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

// 제품 데이터를 엑셀 파일로 내보내기
export const exportProductsToExcel = (products) => {
  // 내보낼 데이터 형식 변환
  const data = products.map((product) => ({
    제품명: product.name,
    카테고리: product.category,
    "제품 코드": product.code || "",
    바코드: product.barcode || "",
    판매가: product.price,
    원가: product.cost || 0,
    재고: product.stock || 0,
    "재고 부족 기준": product.lowStockThreshold || 10,
    단위: product.unit || "개",
    제조사: product.manufacturer || "",
    상태: product.status === "active" ? "판매중" : product.status === "inactive" ? "판매중지" : "단종",
    설명: product.description || "",
  }))

  exportToExcel(data, "제품목록")
}

// 매출 데이터를 엑셀 파일로 내보내기
export const exportSalesToExcel = (sales) => {
  // 내보낼 데이터 형식 변환
  const data = sales.map((sale) => ({
    날짜: new Date(sale.date).toLocaleDateString(),
    거래처: sale.customer,
    총액: sale.total,
    "결제 방법": sale.paymentMethod,
    상태: sale.status,
    비고: sale.notes || "",
  }))

  exportToExcel(data, "매출목록")
}

// 매입 데이터를 엑셀 파일로 내보내기
export const exportPurchasesToExcel = (purchases) => {
  // 내보낼 데이터 형식 변환
  const data = purchases.map((purchase) => ({
    날짜: new Date(purchase.date).toLocaleDateString(),
    공급업체: purchase.supplier,
    총액: purchase.total,
    "결제 방법": purchase.paymentMethod,
    상태: purchase.status,
    비고: purchase.notes || "",
  }))

  exportToExcel(data, "매입목록")
}

// 거래처 데이터를 엑셀 파일로 내보내기
export const exportCustomersToExcel = (customers) => {
  // 내보낼 데이터 형식 변환
  const data = customers.map((customer) => ({
    거래처명: customer.name,
    유형: customer.type,
    사업자번호: customer.businessNumber || "",
    담당자: customer.contactName || "",
    연락처: customer.phone || "",
    이메일: customer.email || "",
    주소: customer.address || "",
    비고: customer.notes || "",
  }))

  exportToExcel(data, "거래처목록")
}

// 엑셀 파일에서 데이터 가져오기
export const importFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: "array" })

        // 첫 번째 시트의 데이터 가져오기
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // 시트 데이터를 JSON으로 변환
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = (error) => {
      reject(error)
    }

    reader.readAsArrayBuffer(file)
  })
}

// 엑셀 데이터를 제품 데이터로 변환
export const convertExcelToProducts = (excelData) => {
  return excelData.map((row) => {
    // 엑셀 열 이름과 제품 속성 매핑
    let status = "active"
    if (row["상태"] === "판매중지") status = "inactive"
    else if (row["상태"] === "단종") status = "discontinued"

    return {
      name: row["제품명"],
      category: row["카테고리"],
      code: row["제품 코드"],
      barcode: row["바코드"],
      price: Number(row["판매가"]) || 0,
      cost: Number(row["원가"]) || 0,
      stock: Number(row["재고"]) || 0,
      lowStockThreshold: Number(row["재고 부족 기준"]) || 10,
      unit: row["단위"] || "개",
      manufacturer: row["제조사"],
      status: status,
      description: row["설명"],
    }
  })
}
