/**
 * 문서번호 생성 함수
 * 형식: INV-YYMM[랜덤코드 6자리]
 * @param date 거래 날짜
 * @param existingCode 기존 랜덤코드 (있는 경우 재사용)
 * @returns 생성된 문서번호
 */
export function generateInvoiceNumber(
  date: Date | string,
  existingCode?: string
): string {
  // 날짜 객체로 변환
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // 연도와 월 추출 (YY-MM 형식)
  const year = dateObj.getFullYear().toString().slice(2); // 연도의 마지막 2자리
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0"); // 월 (01-12)

  // 날짜 부분 생성 (YYMM)
  const datePart = `${year}${month}`;

  // 기존 코드가 있으면 재사용, 없으면 새로 생성
  const randomCode = existingCode || generateRandomCode(6);

  // 최종 문서번호 생성
  return `INV-${datePart}${randomCode}`;
}

/**
 * 영문 대문자와 숫자로 구성된 랜덤 코드 생성
 * @param length 코드 길이
 * @returns 생성된 랜덤 코드
 */
export function generateRandomCode(length: number): string {
  const characters = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

/**
 * 문서번호에서 랜덤 코드 부분만 추출
 * @param invoiceNumber 문서번호 (INV-YYMMXXXXXX 형식)
 * @returns 추출된 랜덤 코드
 */
export function extractRandomCodeFromInvoiceNumber(
  invoiceNumber: string
): string | null {
  // INV-YYMM 다음의 모든 문자를 추출
  const match = invoiceNumber.match(/^INV-\d{4}(.+)$/);
  return match ? match[1] : null;
}
