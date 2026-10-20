"use client";

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  PDFViewer,
  BlobProvider,
  Font,
} from "@react-pdf/renderer";
import { useEffect, useRef, useState } from "react";
import { BasicInfo, DiagnosisResult } from "@/types";
import { SITE } from "@/data/site";

Font.register({
  family: "SawarabiMincho",
  fonts: [{ src: "/SawarabiMincho.ttf" }],
});

// react-pdfのデフォルトハイフネーションを無効化（日本語に「-」が入るのを防ぐ）
Font.registerHyphenationCallback((word) => [word]);

const BORDER = "1px solid #000";
const THIN = "1px solid #000";

const s = StyleSheet.create({
  page: {
    fontFamily: "SawarabiMincho",
    fontSize: 9,
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 32,
    backgroundColor: "#ffffff",
    color: "#000",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 8,
  },
  dateText: {
    fontSize: 9,
  },
  // 上段（基本情報＋写真）
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoCol: {
    border: BORDER,
    boxSizing: "border-box",
  },
  rightCol: {
    width: 110,
    boxSizing: "border-box",
  },
  photoSlot: {
    height: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  photoImg: {
    width: 105,
    height: 108,
    objectFit: "cover",
  },
  photoPlaceholder: {
    fontSize: 7,
    color: "#999",
    textAlign: "center",
    lineHeight: 1.4,
    width: 105,
    height: 108,
    border: "1px dashed #bbb",
    paddingTop: 40,
  },
  rightCell: {
    borderRight: BORDER,
    borderBottom: BORDER,
    borderTop: BORDER,
    paddingHorizontal: 5,
    paddingVertical: 4,
  },
  rightLabel: {
    fontSize: 7,
    color: "#333",
  },
  rightValue: {
    fontSize: 9,
    textAlign: "center",
    flex: 1,
    width: "100%",
    justifyContent: "center",
  },
  // 行
  row: {
    flexDirection: "row",
    borderBottom: THIN,
    minHeight: 26,
  },
  rowLast: {
    flexDirection: "row",
    minHeight: 26,
  },
  labelCell: {
    width: 60,
    borderRight: THIN,
    backgroundColor: "#f5f5f5",
    padding: 4,
    fontSize: 8,
    justifyContent: "center",
  },
  labelCellNarrow: {
    width: 60,
    borderRight: THIN,
    backgroundColor: "#f5f5f5",
    padding: 4,
    fontSize: 7,
    justifyContent: "center",
  },
  valueCell: {
    flex: 1,
    padding: 4,
    justifyContent: "center",
  },
  splitRow: {
    flexDirection: "row",
    borderBottom: THIN,
    minHeight: 22,
  },
  // 学歴・職歴テーブル
  sectionTable: {
    border: BORDER,
    borderTop: 0,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderBottom: THIN,
  },
  thYear: {
    width: 36,
    borderRight: THIN,
    padding: 3,
    fontSize: 8,
    textAlign: "center",
  },
  thMonth: {
    width: 28,
    borderRight: THIN,
    padding: 3,
    fontSize: 8,
    textAlign: "center",
  },
  thContent: {
    flex: 1,
    padding: 3,
    fontSize: 8,
    textAlign: "center",
  },
  tdRow: {
    flexDirection: "row",
    borderBottom: THIN,
    height: 24,
  },
  tdRowTall: {
    flexDirection: "row",
    borderBottom: THIN,
    height: 34,
  },
  tdYear: {
    width: 36,
    borderRight: THIN,
    padding: 3,
    fontSize: 9,
    textAlign: "center",
  },
  tdMonth: {
    width: 28,
    borderRight: THIN,
    padding: 3,
    fontSize: 9,
    textAlign: "center",
  },
  tdContent: {
    flex: 1,
    padding: 3,
    fontSize: 9,
  },
  centerHeader: {
    padding: 3,
    fontSize: 9,
    textAlign: "center",
    fontWeight: "bold",
  },
  // PR欄
  prSection: {
    border: BORDER,
    borderTop: 0,
  },
  prHeader: {
    backgroundColor: "#f5f5f5",
    padding: 4,
    fontSize: 8,
    borderBottom: THIN,
  },
  prBody: {
    padding: 8,
    height: 185,
    fontSize: 9,
    lineHeight: 1.6,
    // 日本語の改行で「-」が入るのを防ぐ
    hyphens: "none",
  },
  typeBadge: {
    fontSize: 7,
    color: "#666",
    marginBottom: 4,
  },
  wishHeader: {
    backgroundColor: "#f5f5f5",
    padding: 4,
    fontSize: 8,
    borderBottom: THIN,
  },
  wishBody: {
    padding: 8,
    height: 60,
    fontSize: 9,
  },
});

function formatPhone(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length === 11 && /^0[789]0/.test(d)) return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`;
  if (d.length === 10 && /^0[3-9]/.test(d)) return `${d.slice(0,2)}-${d.slice(2,6)}-${d.slice(6)}`;
  if (d.length === 10) return `${d.slice(0,3)}-${d.slice(3,6)}-${d.slice(6)}`;
  return d;
}

interface Props {
  basicInfo: BasicInfo;
  diagnosisResult: DiagnosisResult;
}

// 日本語テキストの改行を自然にするため、各文字間にゼロ幅スペースを挿入
// これによりreact-pdfのテキストエンジンが任意の文字位置で改行でき、
// ハイフン挿入や不自然な改行を防ぐ
// ソフトハイフン・各種ハイフン類も除去（AI出力に混入することがある）
function injectBreakPoints(text: string): string {
  return text
    .replace(/[­‐‑‒–—―]/g, "")
    .split("")
    .join("​");
}

// 自己PR枠の6割を満たすフォントサイズを文字数から算出（9〜15ptでクランプ）
function calcPRFontSize(charCount: number): number {
  if (charCount === 0) return 11;
  // 枠サイズ：内寸 約 513 × 169 pt、目標面積 = 60%
  // 1文字 ≈ fontSize × fontSize、行高 1.6 を考慮
  // fontSize ≈ sqrt(0.6 * 513 * 169 / (N * 1.6)) ≈ sqrt(32510 / N)
  const calc = Math.sqrt(32510 / charCount);
  return Math.max(9, Math.min(15, Math.round(calc * 10) / 10));
}

function fmtBirth(birthDate: string) {
  if (!birthDate) return "";
  const d = new Date(birthDate);
  const age = Math.floor(
    (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日生（満${age}歳）`;
}

// 基本情報セクションの行高さ定数（左右の整合性を保証）
const H = {
  title: 25,
  furigana1: 18,   // 行1 ふりがな（氏名用）
  name: 75,        // 行2 氏名
  birth: 30,       // 行3 生年月日
  furigana2: 18,   // 行4 ふりがな（住所用）
  address: 40,     // 行5 現住所
  furigana3: 18,   // 行6 ふりがな（連絡先用）
  contact: 30,     // 行7 連絡先
} as const;
// 右列セル高さ（左列と一致するよう自動算出）
const PHOTO_H = H.title + H.furigana1 + H.name; // 写真：タイトル+行1+行2
const GENDER_H = H.birth;                         // 性別：行3
const TEL_H = H.furigana2 + H.address;            // 電話：行4+行5
const EMAIL_H = H.furigana3 + H.contact;          // メール：行6+行7

// 固定スロット数：レイアウトを崩さないため、入力データに関わらず常にこの行数で出力
const HISTORY_PAGE1_SLOTS = 14;
const HISTORY_PAGE2_SLOTS = 6;
const HISTORY_TOTAL = HISTORY_PAGE1_SLOTS + HISTORY_PAGE2_SLOTS;
const CERT_SLOTS = 5;

type HistoryRow = { year: string; month: string; content: string; isHeader?: boolean; isClose?: boolean };

function buildHistoryRows(basicInfo: BasicInfo): HistoryRow[] {
  const rows: HistoryRow[] = [];
  const eduRows = basicInfo.education.filter((e) => e.description);
  const workRows = basicInfo.workHistory.filter((w) => w.description);
  if (eduRows.length > 0) {
    rows.push({ year: "", month: "", content: "学　歴", isHeader: true });
    eduRows.forEach((e) =>
      rows.push({
        year: e.year,
        month: e.month,
        content: `${e.description}${e.label !== "──" ? `　${e.label}` : ""}`,
      })
    );
  }
  if (workRows.length > 0) {
    rows.push({ year: "", month: "", content: "職　歴", isHeader: true });
    workRows.forEach((w) =>
      rows.push({
        year: w.year,
        month: w.month,
        content: `${w.description}${w.label !== "──" ? `　${w.label}` : ""}`,
      })
    );
    rows.push({ year: "", month: "", content: "以　上", isClose: true });
  }
  while (rows.length < HISTORY_TOTAL) rows.push({ year: "", month: "", content: "" });
  return rows.slice(0, HISTORY_TOTAL);
}

function HistoryRowView({ r }: { r: HistoryRow }) {
  return (
    <View style={s.tdRowTall}>
      <View style={[s.tdYear, { justifyContent: "center" }]}><Text style={{ fontSize: 11 }}>{r.year}</Text></View>
      <View style={[s.tdMonth, { justifyContent: "center" }]}><Text style={{ fontSize: 11 }}>{r.month}</Text></View>
      <View style={[s.tdContent, { justifyContent: "center" }]}>
        {r.isHeader ? (
          <Text style={{ textAlign: "center", fontWeight: "bold", fontSize: 11 }}>{r.content}</Text>
        ) : r.isClose ? (
          <Text style={{ textAlign: "right", fontSize: 11 }}>{r.content}</Text>
        ) : (
          <Text style={{ fontSize: 11 }}>{r.content}</Text>
        )}
      </View>
    </View>
  );
}

function HistoryHeader() {
  return (
    <View style={s.tableHeader}>
      <View style={s.thYear}><Text>年</Text></View>
      <View style={s.thMonth}><Text>月</Text></View>
      <View style={s.thContent}><Text>学　歴・職　歴</Text></View>
    </View>
  );
}

// 文字を1つずつ独立した<Text>として描画することで、
// react-pdfの自動ハイフン挿入を完全に回避する。
// 改行はFlex wrapで自然に行われる。
function PerCharText({ text, fontSize }: { text: string; fontSize: number }) {
  const cleaned = text.replace(/[­‐‑‒–—―]/g, "");
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {Array.from(cleaned).map((ch, i) => (
        <Text key={i} style={{ fontSize, lineHeight: 1.6 }}>
          {ch}
        </Text>
      ))}
    </View>
  );
}

function ResumeDocument({ basicInfo, diagnosisResult }: Props) {
  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日現在`;

  const allHistory = buildHistoryRows(basicInfo);
  const page1History = allHistory.slice(0, HISTORY_PAGE1_SLOTS);
  const page2History = allHistory.slice(HISTORY_PAGE1_SLOTS);

  const certRows = basicInfo.certifications.filter((c) => c.name);
  const certDisplay = [...certRows];
  while (certDisplay.length < CERT_SLOTS) certDisplay.push({ name: "", year: "", month: "" });
  const certSlice = certDisplay.slice(0, CERT_SLOTS);

  return (
    <Document>
      {/* ===== Page 1 ===== */}
      <Page size="A4" style={s.page}>
        {/* 上半分：タイトル+セクション1（左） | 写真（右、タイトル含む全高） */}
        <View style={{ flexDirection: "row" }} wrap={false}>
          <View style={{ flex: 1 }}>
            {/* タイトル行 */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: H.title, paddingRight: 8 }}>
              <Text style={s.title}>履　歴　書</Text>
              <Text style={s.dateText}>{dateStr}</Text>
            </View>
            {/* セクション1：ふりがな + 氏名 */}
            <View style={{ borderLeft: BORDER, borderTop: BORDER, borderRight: BORDER, borderBottom: BORDER }}>
              {/* 行1 ふりがな */}
              <View style={{ flexDirection: "row", height: H.furigana1, borderBottom: THIN }}>
                <View style={{ width: 60, paddingHorizontal: 4, justifyContent: "center" }}>
                  <Text style={{ fontSize: 7 }}>ふりがな</Text>
                </View>
                <View style={{ width: 1, height: H.furigana1, backgroundColor: "#000" }} />
                <View style={{ flex: 1, paddingHorizontal: 4, justifyContent: "center" }}>
                  <Text style={{ fontSize: 9 }}>{basicInfo.nameKana}</Text>
                </View>
              </View>
              {/* 行2 氏名 */}
              <View style={{ flexDirection: "row", height: H.name }}>
                <View style={{ width: 60, paddingHorizontal: 4, justifyContent: "center" }}>
                  <Text style={{ fontSize: 9 }}>氏　名</Text>
                </View>
                <View style={{ width: 1, height: H.name, backgroundColor: "#000" }} />
                <View style={{ flex: 1, paddingHorizontal: 8, justifyContent: "center" }}>
                  <Text style={{ fontSize: 14 }}>{basicInfo.name}</Text>
                </View>
              </View>
            </View>
          </View>
          {/* 写真：タイトル + セクション1 の全高さ、枠線なし */}
          <View style={{ width: 110, alignItems: "center", justifyContent: "center" }}>
            {basicInfo.photo ? (
              <Image src={basicInfo.photo} style={{ width: 105, height: 118, objectFit: "cover" }} />
            ) : (
              <View style={{ width: 105, height: 118, border: "1px dashed #bbb", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 7, color: "#999", textAlign: "center" }}>
                  写真貼付欄{"\n"}縦36-40mm{"\n"}横24-30mm
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* セクション2-4：基本情報の下半分 */}
        <View style={{ borderLeft: BORDER }} wrap={false}>

          {/* セクション2：生年月日 + 性別（他セクションと同じ構造） */}
          <View style={{ flexDirection: "row", height: H.birth }}>
            <View style={{ flex: 1, borderRight: BORDER, borderBottom: BORDER, flexDirection: "row" }}>
              <View style={{ width: 60, paddingHorizontal: 4, justifyContent: "center" }}>
                <Text style={{ fontSize: 9 }}>生年月日</Text>
              </View>
              <View style={{ width: 1, height: H.birth, backgroundColor: "#000" }} />
              <View style={{ flex: 1, paddingHorizontal: 4, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ fontSize: 10 }}>{fmtBirth(basicInfo.birthDate)}</Text>
              </View>
            </View>
            <View style={{ width: 109, paddingHorizontal: 5, paddingTop: 2, borderTop: BORDER, borderRight: BORDER, borderBottom: BORDER }}>
              <Text style={{ fontSize: 7 }}>性別</Text>
              <Text style={{ fontSize: 10, textAlign: "center", marginTop: 1 }}>{basicInfo.gender}</Text>
            </View>
          </View>

          {/* セクション3：住所 + 電話 */}
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1, borderRight: BORDER, borderBottom: BORDER }}>
              {/* 行4 ふりがな */}
              <View style={{ flexDirection: "row", height: H.furigana2, borderBottom: THIN }}>
                <View style={{ width: 60, paddingHorizontal: 4, justifyContent: "center" }}>
                  <Text style={{ fontSize: 7 }}>ふりがな</Text>
                </View>
                <View style={{ width: 1, height: H.furigana2, backgroundColor: "#000" }} />
                <View style={{ flex: 1, paddingHorizontal: 4, justifyContent: "center" }}>
                  <Text style={{ fontSize: 9 }}>{basicInfo.addressKana}</Text>
                </View>
              </View>
              {/* 行5 現住所 */}
              <View style={{ flexDirection: "row", height: H.address }}>
                <View style={{ width: 60, paddingHorizontal: 4, justifyContent: "center" }}>
                  <Text style={{ fontSize: 9 }}>現住所</Text>
                </View>
                <View style={{ width: 1, height: H.address, backgroundColor: "#000" }} />
                <View style={{ flex: 1, paddingHorizontal: 4, justifyContent: "center" }}>
                  {basicInfo.postalCode ? (
                    <Text style={{ fontSize: 9 }}>〒{basicInfo.postalCode}</Text>
                  ) : null}
                  <Text style={{ fontSize: 9 }}>{basicInfo.address}</Text>
                </View>
              </View>
            </View>
            <View style={{ width: 109, paddingHorizontal: 5, paddingTop: 2, borderRight: BORDER, borderBottom: BORDER }}>
              <Text style={{ fontSize: 7 }}>電話</Text>
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text style={{ fontSize: 9, textAlign: "center" }}>{formatPhone(basicInfo.phone)}</Text>
              </View>
            </View>
          </View>

          {/* セクション4：連絡先 + メール */}
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1, borderRight: BORDER, borderBottom: BORDER }}>
              {/* 行6 ふりがな */}
              <View style={{ flexDirection: "row", height: H.furigana3, borderBottom: THIN }}>
                <View style={{ width: 60, paddingHorizontal: 4, justifyContent: "center" }}>
                  <Text style={{ fontSize: 7 }}>ふりがな</Text>
                </View>
                <View style={{ width: 1, height: H.furigana3, backgroundColor: "#000" }} />
                <View style={{ flex: 1, paddingHorizontal: 4 }} />
              </View>
              {/* 行7 連絡先 */}
              <View style={{ flexDirection: "row", height: H.contact }}>
                <View style={{ width: 60, paddingHorizontal: 4, justifyContent: "center" }}>
                  <Text style={{ fontSize: 9 }}>連絡先</Text>
                </View>
                <View style={{ width: 1, height: H.contact, backgroundColor: "#000" }} />
                <View style={{ flex: 1, paddingHorizontal: 4, flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontSize: 9 }}>〒</Text>
                  <Text style={{ fontSize: 8, color: "#666" }}>（現住所以外に連絡を希望する場合のみ記入）</Text>
                </View>
              </View>
            </View>
            <View style={{ width: 109, paddingHorizontal: 5, paddingTop: 2, borderRight: BORDER, borderBottom: BORDER }}>
              <Text style={{ fontSize: 7 }}>メールアドレス</Text>
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text style={{ fontSize: 7, textAlign: "center" }}>{basicInfo.email}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[s.sectionTable, { marginTop: 20, borderTop: BORDER }]} wrap={false}>
          <HistoryHeader />
          {page1History.map((r, i) => <HistoryRowView key={i} r={r} />)}
        </View>
      </Page>

      {/* ===== Page 2 ===== */}
      <Page size="A4" style={s.page}>
        <View style={[s.sectionTable, { borderTop: BORDER }]} wrap={false}>
          <HistoryHeader />
          {page2History.map((r, i) => <HistoryRowView key={i} r={r} />)}
        </View>

        <View style={s.sectionTable} wrap={false}>
          <View style={s.tableHeader}>
            <View style={s.thYear}><Text>年</Text></View>
            <View style={s.thMonth}><Text>月</Text></View>
            <View style={s.thContent}><Text>免　許・資　格</Text></View>
          </View>
          {certSlice.map((c, i) => (
            <View key={i} style={s.tdRowTall}>
              <View style={[s.tdYear, { justifyContent: "center" }]}><Text style={{ fontSize: 11 }}>{c.year}</Text></View>
              <View style={[s.tdMonth, { justifyContent: "center" }]}><Text style={{ fontSize: 11 }}>{c.month}</Text></View>
              <View style={[s.tdContent, { justifyContent: "center" }]}><Text style={{ fontSize: 11 }}>{c.name}</Text></View>
            </View>
          ))}
        </View>

        <View style={s.prSection} wrap={false}>
          <Text style={s.prHeader}>志望の動機、特技、自己PR、アピールポイントなど</Text>
          <View style={s.prBody}>
            <PerCharText
              text={diagnosisResult.selfPR}
              fontSize={calcPRFontSize(diagnosisResult.selfPR.length)}
            />
          </View>
        </View>

        <View style={s.prSection} wrap={false}>
          <Text style={s.wishHeader}>
            本人希望記入欄（特に給料、職種、勤務時間、勤務地、その他についての希望などがあれば記入）
          </Text>
          <View style={s.wishBody}>
            <PerCharText
              text={basicInfo.wishes}
              fontSize={calcPRFontSize(diagnosisResult.selfPR.length)}
            />
          </View>
        </View>
      </Page>
    </Document>
  );
}

interface DownloadProps {
  basicInfo: BasicInfo;
  diagnosisResult: DiagnosisResult;
  disabled?: boolean;
}

type Platform = "ios" | "android" | "other";
type ModalState = "hidden" | "showing";

export default function ResumePDFDownload({ basicInfo, diagnosisResult, disabled }: DownloadProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");
  const [showHelp, setShowHelp] = useState(false);
  const [isLineIAB, setIsLineIAB] = useState(false);

  // メアド登録モーダル
  const [modalState, setModalState] = useState<ModalState>("hidden");
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentPartner, setConsentPartner] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [modalError, setModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  // アンケート
  const [jobChangeTiming, setJobChangeTiming] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");

  // モバイル判定 + OS判定 + LINE IAB判定
  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    check();
    window.addEventListener("resize", check);
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) setPlatform("ios");
    else if (/Android/.test(ua)) setPlatform("android");
    setIsLineIAB(/Line\//i.test(ua));
    return () => window.removeEventListener("resize", check);
  }, []);

  const filename = `履歴書_${basicInfo.name}_${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}.pdf`;

  const performDownload = () => {
    const url = blobUrlRef.current;
    if (!url) return;
    if (isLineIAB) {
      // LINE IABはwindow.open(_blank)が封鎖されているため、現在タブでblobを開く
      window.location.href = url;
    } else if (isMobile) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleModalSubmit = () => {
    setModalError("");
    if (!consentTerms) {
      setModalError("利用規約・プライバシーポリシーへの同意が必要です。");
      return;
    }
    setIsSubmitting(true);
    setModalState("hidden");
    performDownload();
    if (basicInfo.phone || basicInfo.email) {
      const refSource = sessionStorage.getItem("ref_source") || null;
      fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: basicInfo.phone || "",
          email: basicInfo.email || "",
          consentPartnerReferral: consentPartner,
          consentMarketing,
          resumeData: basicInfo,
          diagnosisType: diagnosisResult.type,
          refSource,
          jobChangeTiming: jobChangeTiming || null,
          employmentType: employmentType || null,
          preferredLocation: preferredLocation || null,
        }),
      }).catch(console.error);
    }
  };

  const handleModalSkip = () => {
    setModalState("hidden");
    performDownload();
  };

  if (disabled) {
    return (
      <button
        disabled
        className="w-full bg-gray-200 text-gray-400 py-3 rounded-xl font-medium cursor-not-allowed"
      >
        PDFを準備中...
      </button>
    );
  }

  return (
    <div className="space-y-2">
      {isLineIAB && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 text-xs text-amber-800 leading-relaxed">
          📱 <span className="font-semibold">LINEブラウザをご使用中です。</span><br />
          右上の「…」→「外部ブラウザで開く」でSafari・Chromeから使うと、PDFを簡単に保存できます。<br />
          このままでもダウンロードできますが、画面が切り替わる場合があります。
        </div>
      )}

      <button
        onClick={() => setShowPreview(true)}
        className="block w-full border border-blue-600 text-blue-600 py-2.5 rounded-xl font-medium hover:bg-blue-50 transition text-center text-sm"
      >
        👁 PDFをプレビュー
      </button>

      <BlobProvider document={<ResumeDocument basicInfo={basicInfo} diagnosisResult={diagnosisResult} />}>
        {({ url, loading }) => {
          blobUrlRef.current = url;
          return (
            <button
              onClick={() => setModalState("showing")}
              disabled={loading}
              className="block w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition text-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "PDFを生成中..." : "📄 PDFをダウンロード"}
            </button>
          );
        }}
      </BlobProvider>

      {/* 同意モーダル */}
      {modalState === "showing" && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900">PDFをダウンロードする前に</h3>
              <p className="text-sm text-gray-500 mt-1">
                ご入力の情報（{[basicInfo.phone, basicInfo.email].filter(Boolean).join(" / ")}）を登録します。
              </p>
            </div>

            {/* アンケート（任意） */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-600">📋 転職状況を教えてください（任意・3問）</p>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">転職希望時期</label>
                  <select
                    value={jobChangeTiming}
                    onChange={(e) => setJobChangeTiming(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">未選択</option>
                    <option value="1ヶ月以内">1ヶ月以内</option>
                    <option value="1〜3ヶ月以内">1〜3ヶ月以内</option>
                    <option value="3〜6ヶ月以内">3〜6ヶ月以内</option>
                    <option value="6ヶ月以上">6ヶ月以上先</option>
                    <option value="まだ決めていない">まだ決めていない</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">現在の雇用形態</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">未選択</option>
                    <option value="正社員">正社員</option>
                    <option value="契約社員">契約社員</option>
                    <option value="パート・アルバイト">パート・アルバイト</option>
                    <option value="派遣社員">派遣社員</option>
                    <option value="フリーランス">フリーランス</option>
                    <option value="無職・求職中">無職・求職中</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">希望勤務地</label>
                  <select
                    value={preferredLocation}
                    onChange={(e) => setPreferredLocation(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">未選択</option>
                    <option value="北海道">北海道</option>
                    <option value="東北">東北</option>
                    <option value="首都圏（東京・神奈川・埼玉・千葉）">首都圏（東京・神奈川・埼玉・千葉）</option>
                    <option value="北関東・甲信越">北関東・甲信越</option>
                    <option value="東海">東海</option>
                    <option value="北陸">北陸</option>
                    <option value="関西">関西</option>
                    <option value="中国・四国">中国・四国</option>
                    <option value="九州・沖縄">九州・沖縄</option>
                    <option value="どこでも可">どこでも可</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentTerms}
                  onChange={(e) => setConsentTerms(e.target.checked)}
                  className="mt-0.5 shrink-0"
                />
                <span className="text-xs text-gray-700 leading-relaxed">
                  <a href="/terms" target="_blank" className="text-blue-600 underline">利用規約</a>・
                  <a href="/privacy" target="_blank" className="text-blue-600 underline">プライバシーポリシー</a>
                  に同意する <span className="text-red-500">*必須</span>
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentPartner}
                  onChange={(e) => setConsentPartner(e.target.checked)}
                  className="mt-0.5 shrink-0"
                />
                <span className="text-xs text-gray-700 leading-relaxed">
                  氏名・連絡先・履歴書の内容・アンケート回答を、提携する人材紹介会社（{SITE.partnerName}）に提供し、営業職の求人紹介を受けることに同意する（任意）
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentMarketing}
                  onChange={(e) => setConsentMarketing(e.target.checked)}
                  className="mt-0.5 shrink-0"
                />
                <span className="text-xs text-gray-700 leading-relaxed">
                  転職・キャリアに役立つメールマガジンを受け取る（任意）
                </span>
              </label>
            </div>

            {modalError && (
              <p className="text-xs text-red-600">{modalError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setModalState("hidden")}
                className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                戻る
              </button>
              <button
                onClick={handleModalSubmit}
                disabled={(!basicInfo.phone && !basicInfo.email) || isSubmitting}
                className="flex-[2] bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    処理中...
                  </>
                ) : "同意してダウンロード"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">PDFプレビュー</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
                aria-label="閉じる"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {isMobile ? (
                // モバイル：iframe内のPDFは1ページしか表示されないので、新規タブで開く方式
                <BlobProvider document={<ResumeDocument basicInfo={basicInfo} diagnosisResult={diagnosisResult} />}>
                  {({ url, loading, error }) => (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
                      {loading ? (
                        <p className="text-gray-500 text-sm">PDFを生成中...</p>
                      ) : error ? (
                        <p className="text-red-500 text-sm">プレビューの生成に失敗しました</p>
                      ) : url ? (
                        <>
                          <p className="text-gray-700 text-sm">
                            iPhone・Androidではプレビュー画面で全ページを表示できないため、新しいタブで開いてご確認ください。
                          </p>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
                          >
                            📄 新しいタブでPDFを開く
                          </a>
                          <button
                            onClick={() => setShowHelp((v) => !v)}
                            className="text-xs text-blue-600 underline"
                          >
                            {showHelp ? "閉じる" : "保存方法はこちら"}
                          </button>
                          {showHelp && (
                            <div className="text-left bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-700 leading-relaxed space-y-3 max-w-sm">
                              {platform === "ios" ? (
                                <>
                                  <p className="font-semibold text-gray-900">📱 iOS（iPhone・iPad）の場合</p>
                                  <ol className="list-decimal list-inside space-y-1.5">
                                    <li>「新しいタブでPDFを開く」をタップ</li>
                                    <li>PDF表示中、画面下部の<strong>共有ボタン</strong>（□に↑）をタップ</li>
                                    <li>メニューから<strong>「ファイルに保存」</strong>を選択</li>
                                    <li>保存先（iCloud Drive等）を選んで右上の<strong>「保存」</strong>をタップ</li>
                                  </ol>
                                  <p className="text-gray-500">※「写真」アプリには保存できません（PDFはファイル形式のため）</p>
                                </>
                              ) : platform === "android" ? (
                                <>
                                  <p className="font-semibold text-gray-900">📱 Android の場合</p>
                                  <ol className="list-decimal list-inside space-y-1.5">
                                    <li>「新しいタブでPDFを開く」をタップ</li>
                                    <li>PDF表示中、画面右上の<strong>「⋮」（メニュー）</strong>をタップ</li>
                                    <li><strong>「ダウンロード」</strong>を選択</li>
                                    <li>「Files」アプリの「ダウンロード」フォルダに保存されます</li>
                                  </ol>
                                  <p className="text-gray-500">※または「📄 PDFをダウンロード」ボタンから直接保存も可能</p>
                                </>
                              ) : (
                                <>
                                  <p className="font-semibold text-gray-900">💾 保存方法</p>
                                  <ul className="list-disc list-inside space-y-1.5">
                                    <li>「新しいタブでPDFを開く」後、ブラウザの保存機能を使用</li>
                                    <li>または「📄 PDFをダウンロード」ボタンで直接保存</li>
                                  </ul>
                                </>
                              )}
                            </div>
                          )}
                        </>
                      ) : null}
                    </div>
                  )}
                </BlobProvider>
              ) : (
                <PDFViewer width="100%" height="100%" showToolbar={false} style={{ border: 0 }}>
                  <ResumeDocument basicInfo={basicInfo} diagnosisResult={diagnosisResult} />
                </PDFViewer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
