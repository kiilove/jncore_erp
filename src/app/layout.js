"use client";

import { useProducts } from "../hooks/useProducts";

export default function RootLayout({ children }) {
  // 앱 시작 시 제품 구독 시작
  useProducts();

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
