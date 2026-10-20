import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { SITE } from "@/data/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const TITLE = `${SITE.brand}｜${SITE.catchcopy}`;
const OG_DESCRIPTION = "強みを診断するだけで営業向けの自己PRが完成。完全無料で履歴書PDFを出力できます。";

export const metadata: Metadata = {
  title: TITLE,
  description:
    "リレキト for 営業職は、営業職への転職に特化した履歴書作成ツール。強みを診断するだけで営業向けの自己PRが完成し、そのまま履歴書PDFで出力できます。完全無料。",
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
