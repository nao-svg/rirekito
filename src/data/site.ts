// 職種ごとに変わる文言をまとめる（将来「for 施工管理」を追加するときはここを差し替える）
// string 型にしておく（社名が入ると literal 同士の比較になり型エラーになるため）
export const PARTNER_PLACEHOLDER: string = "〇〇株式会社";

export const SITE = {
  brand: "リレキト for 営業職",
  catchcopy: "営業への転職書類、5分で完成。",
  aiPersona: "営業職専門の転職エージェント",
  // 提携エージェントの正式な社名（PARTNER_PLACEHOLDER に戻すと送客の同意・案内が非表示になる）
  partnerName: "株式会社BEPRIDE",
} as const;

// 提携先の正式な社名が入るまで、送客の同意・案内を出さない
export const PARTNER_READY: boolean = SITE.partnerName !== PARTNER_PLACEHOLDER;
