import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { SITE } from "@/data/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const TITLE = `${SITE.brand}｜${SITE.catchcopy}`;
const OG_DESCRIPTION = "学歴・職歴は関係なし。選ぶだけの診断で、あなたの営業マン適性と強みがわかります。履歴書・職務経歴書まで無料で作れます。";

export const metadata: Metadata = {
  title: TITLE,
  description:
    "リレキト for 営業職は、学歴・職歴に関係なく営業職をめざす人のための無料ツール。12問の診断で営業マン適性と強みがわかり、履歴書・職務経歴書まで作れます。",
  openGraph: {
    title: TITLE,
    description: OG_DESCRIPTION,
    url: "https://rirekito.vercel.app/",
    siteName: SITE.brand,
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: OG_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
