import { describe, it, expect } from "vitest";
import { SITE } from "@/data/site";

describe("SITE", () => {
  it("ブランド名とキャッチコピーが決定どおり", () => {
    expect(SITE.brand).toBe("リレキト for 営業職");
    expect(SITE.catchcopy).toBe("誰でもビジネスマンになれる。12問で無料診断");
    expect(SITE.aiPersona).toBe("営業職専門の転職エージェント");
  });

  it("運営会社とお問い合わせ先", () => {
    expect(SITE.operator).toBe("株式会社kanata");
    expect(SITE.contactEmail).toBe("info@kanata.careers");
    expect(SITE.operatorAddress).toBe("神奈川県横浜市南区新川町5-30-2");
    expect(SITE.representative).toBe("代表取締役 土元直");
  });
});
