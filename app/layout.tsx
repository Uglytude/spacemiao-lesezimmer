import type { Metadata } from "next";
import "./globals.css";
import CatTrail from "./components/CatTrail";

export const metadata: Metadata = {
  title: "SpaceMiao's Lesezimmer",
  description: "帮助不说德语的妈妈，给小朋友讲德语绘本故事。点击德语文字，即可看到中英文翻译。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        {children}
        <CatTrail />
      </body>
    </html>
  );
}
