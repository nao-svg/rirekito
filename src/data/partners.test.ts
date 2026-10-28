import { describe, it, expect } from "vitest";
import { PARTNERS, activePartners, ACTIVE_PARTNERS, BOOKABLE_PARTNERS, PARTNER_READY, formatJaDate, type Partner } from "@/data/partners";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

describe("提携先一覧", () => {
  it("BEPRIDE が許可番号つきで登録されている", () => {
    expect(PARTNERS).toContainEqual(
      expect.objectContaining({ name: "株式会社BEPRIDE", licenseNumber: "14-ユ-302337" })
    );
  });

  it.each(PARTNERS.map((p) => [p.name, p] as const))("%s の許可番号・日付の形式が正しい", (_, p) => {
    expect(p.licenseNumber).toMatch(/^\d{2}-ユ-\d{6}$/);
    expect(p.startDate).toMatch(ISO_DATE);
    if (p.endDate) {
      expect(p.endDate).toMatch(ISO_DATE);
      expect(p.endDate >= p.startDate).toBe(true);
    }
  });

  it.each(PARTNERS.filter((p) => p.bookingUrl).map((p) => [p.name, p] as const))("%s の予約ページは https の URL", (_, p) => {
    expect(new URL(p.bookingUrl!).protocol).toBe("https:");
  });

  it("社名は重複しない", () => {
    const names = PARTNERS.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("activePartners", () => {
  const list: Partner[] = [
    { name: "A社", licenseNumber: "13-ユ-000001", startDate: "2026-01-01" },
    { name: "B社", licenseNumber: "13-ユ-000002", startDate: "2026-01-01", endDate: "2026-06-30" },
  ];

  it("提携終了日のある会社は除き、一覧の元データからは消さない", () => {
    expect(activePartners(list).map((p) => p.name)).toEqual(["A社"]);
    expect(list).toHaveLength(2);
  });

  it("全社が終了していれば空", () => {
    expect(activePartners([list[1]])).toEqual([]);
  });
});

describe("PARTNER_READY", () => {
  it("提携中の会社が1社以上あるときだけ true", () => {
    expect(PARTNER_READY).toBe(ACTIVE_PARTNERS.length > 0);
    expect(PARTNER_READY).toBe(true);
  });
});

describe("BOOKABLE_PARTNERS", () => {
  it("提携中で予約ページのある会社だけを含む", () => {
    expect(BOOKABLE_PARTNERS).toEqual(ACTIVE_PARTNERS.filter((p) => p.bookingUrl));
    expect(BOOKABLE_PARTNERS.every((p) => !p.endDate && p.bookingUrl)).toBe(true);
  });
});

describe("formatJaDate", () => {
  it("YYYY-MM-DD を「YYYY年M月D日」にする", () => {
    expect(formatJaDate("2026-10-20")).toBe("2026年10月20日");
    expect(formatJaDate("2026-01-05")).toBe("2026年1月5日");
  });
});
