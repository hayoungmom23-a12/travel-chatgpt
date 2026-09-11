import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "여정 AI | 맞춤 여행 계획",
  description: "여행 조건으로 일자별 계획을 만드는 도구"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
