import { describe, it, expect } from "vitest";
import { SITE, PARTNER_PLACEHOLDER, PARTNER_READY } from "@/data/site";

describe("SITE", () => {
  it("ブランド名とキャッチコピーが決定どおり", () => {
    expect(SITE.brand).toBe("リレキト for 営業職");
    expect(SITE.catchcopy).toBe("営業への転職書類、5分で完成。");
    expect(SITE.aiPersona).toBe("営業職専門の転職エージェント");
  });

  it("提携先名が空でない", () => {
    expect(SITE.partnerName.length).toBeGreaterThan(0);
  });

  it("PARTNER_READY は提携先名がプレースホルダーでないときだけ true", () => {
    expect(PARTNER_READY).toBe(SITE.partnerName !== PARTNER_PLACEHOLDER);
  });
});
