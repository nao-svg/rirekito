// 送客先（提携する有料職業紹介事業者）の一覧。/partners ページ・同意文・プライバシーポリシーはここを参照する
export interface Partner {
  name: string;
  licenseNumber: string; // 有料職業紹介事業許可番号
  startDate: string; // 提携開始日（YYYY-MM-DD）。この日より前に同意した人はこの会社に送客しない
  endDate?: string; // 提携終了日（YYYY-MM-DD）。終了しても誰がどのリストに同意したか説明できるよう、行は消さない
  bookingUrl?: string; // リレキト経由と分かる、オンライン面談（面接練習・転職相談）の予約ページ。/consult から案内する
}

export const PARTNERS: Partner[] = [
  { name: "株式会社BEPRIDE", licenseNumber: "14-ユ-302337", startDate: "2026-10-20" },
];

export function activePartners(list: Partner[]): Partner[] {
  return list.filter((p) => !p.endDate);
}

export const ACTIVE_PARTNERS = activePartners(PARTNERS);

// 提携中の会社がないときは、送客の同意・案内を出さない
export const PARTNER_READY = ACTIVE_PARTNERS.length > 0;

// 提携中で、予約ページが用意されている会社。/consult に表示する
export const BOOKABLE_PARTNERS = ACTIVE_PARTNERS.filter((p) => p.bookingUrl);

export function formatJaDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}
