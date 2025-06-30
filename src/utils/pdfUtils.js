import jsPDF from "jspdf"
import html2canvas from "html2canvas"

// HTML 요소를 PDF로 변환하여 다운로드
export const generatePDF = async (element, fileName = "document.pdf", options = {}) => {
  try {
    // 기본 옵션
    const defaultOptions = {
      scale: 2, // 고해상도를 위한 스케일
      useCORS: true, // 외부 이미지 허용
      logging: false,
      letterRendering: true,
      allowTaint: false,
    }

    // 사용자 옵션과 기본 옵션 병합
    const htmlOptions = { ...defaultOptions, ...options }

    // HTML 요소를 캔버스로 변환
    const canvas = await html2canvas(element, htmlOptions)

    // 캔버스 크기 가져오기
    const imgWidth = 210 // A4 너비 (mm)
    const pageHeight = 297 // A4 높이 (mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    // PDF 생성
    const pdf = new jsPDF("p", "mm", "a4")
    const imgData = canvas.toDataURL("image/png")

    // 첫 페이지 추가
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // 필요한 경우 추가 페이지 생성
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // PDF 다운로드
    pdf.save(fileName)
    return true
  } catch (error) {
    console.error("PDF 생성 중 오류 발생:", error)
    return false
  }
}

// 거래명세서 PDF 생성
export const generateInvoicePDF = async (element, invoiceNumber) => {
  const fileName = `거래명세서_${invoiceNumber}.pdf`
  return generatePDF(element, fileName)
}
