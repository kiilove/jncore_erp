"use client";

import type React from "react";
import type { ReactNode } from "react";
import { useEffect } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // 인쇄 스타일을 위한 전역 스타일 추가
  useEffect(() => {
    // 기존 스타일 요소가 있는지 확인
    const existingStyle = document.getElementById("print-styles");

    if (!existingStyle) {
      // 새 스타일 요소 생성
      const style = document.createElement("style");
      style.id = "print-styles";
      style.innerHTML = `
        @media print {
          header, aside, nav {
            display: none !important;
          }
          main {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `;
      // head에 스타일 요소 추가
      document.head.appendChild(style);
    }

    // 컴포넌트 언마운트 시 스타일 제거
    return () => {
      const styleToRemove = document.getElementById("print-styles");
      if (styleToRemove) {
        document.head.removeChild(styleToRemove);
      }
    };
  }, []);

  return (
    <>
      <header>{/* Header content here */}</header>
      <aside>{/* Sidebar content here */}</aside>
      <nav>{/* Navigation content here */}</nav>
      <main>{children}</main>
      <footer>{/* Footer content here */}</footer>
    </>
  );
};

export default Layout;
