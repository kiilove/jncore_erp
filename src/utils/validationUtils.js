// 이메일 유효성 검사
export const isValidEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return re.test(String(email).toLowerCase())
}

// 전화번호 유효성 검사
export const isValidPhone = (phone) => {
  const re = /^[0-9]{2,3}-?[0-9]{3,4}-?[0-9]{4}$/
  return re.test(phone)
}

// 사업자등록번호 유효성 검사
export const isValidBusinessNumber = (number) => {
  const re = /^[0-9]{3}-?[0-9]{2}-?[0-9]{5}$/
  return re.test(number)
}

// 필수 입력값 검사
export const isRequired = (value) => {
  if (value === null || value === undefined) return false
  return String(value).trim() !== ""
}

// 최소 길이 검사
export const minLength = (value, min) => {
  if (!value) return false
  return String(value).length >= min
}

// 최대 길이 검사
export const maxLength = (value, max) => {
  if (!value) return true
  return String(value).length <= max
}

// 숫자 범위 검사
export const isInRange = (value, min, max) => {
  const num = Number(value)
  return num >= min && num <= max
}
