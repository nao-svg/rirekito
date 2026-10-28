import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { SITE } from "@/data/site";

export const alt = `${SITE.brand}｜${SITE.catchcopy}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const fontData = readFileSync(join(process.cwd(), "public", "NotoSansJP-Regular.otf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #EDE9FE 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Noto Sans JP', sans-serif",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: -80, right: -80, width: 360, height: 360, borderRadius: "50%", background: "rgba(147,197,253,0.3)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(196,181,253,0.3)", display: "flex" }} />

        <div style={{ fontSize: 28, fontWeight: 700, color: "#3B82F6", letterSpacing: "0.05em", marginBottom: 24, display: "flex" }}>
          {SITE.brand}
        </div>

        <div style={{ fontSize: 64, fontWeight: 900, color: "#1E3A5F", textAlign: "center", lineHeight: 1.3, marginBottom: 28, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span>誰でもビジネスマンに</span>
          <span style={{ color: "#2563EB" }}>なれる。</span>
        </div>

        <div style={{ fontSize: 26, color: "#475569", textAlign: "center", marginBottom: 48, display: "flex" }}>
          12問で無料診断。学歴・職歴は関係なし。
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {["登録なしで診断", "AI自己PR", "履歴書・職務経歴書"].map((label) => (
            <div key={label} style={{ background: "white", borderRadius: 999, padding: "10px 24px", fontSize: 20, color: "#2563EB", fontWeight: 700, boxShadow: "0 2px 12px rgba(37,99,235,0.15)", display: "flex" }}>
              {label}
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", bottom: 36, right: 48, fontSize: 18, color: "#94A3B8", display: "flex" }}>
          rirekito.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Noto Sans JP", data: fontData, style: "normal" }],
    }
  );
}
