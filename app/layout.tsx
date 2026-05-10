import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpaceMiao's Lesezimmer",
  description: "学德语，一页一页来。一个可以点击翻译的德语绘本阅读平台。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
