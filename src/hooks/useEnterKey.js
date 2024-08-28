import { useEffect } from "react";

export const useEnterKeyToNextField = () => {
  useEffect(() => {
    const listener = (e) => {
      // TextArea에서는 엔터키를 눌러도 다음 필드로 넘어가지 않도록 예외 처리
      if (
        (e.code === "Enter" || e.code === "NumpadEnter") &&
        e.target.tagName !== "TEXTAREA" &&
        e.target.tagName !== "BUTTON" &&
        e.target.tagName !== "SELECT"
      ) {
        if (e.target.form) {
          e.preventDefault();
          const form = e.target.form;
          const index = Array.prototype.indexOf.call(form, e.target);
          const nextElement = form.elements[index + 1];
          if (nextElement) {
            nextElement.focus();
          } else {
            form.submit(); // 모든 필드가 완료되었으면 폼 제출
          }
        }
      }
    };

    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, []);
};
