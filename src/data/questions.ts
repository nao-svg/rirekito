export interface Question {
  id: number;
  text: string;
  options: { value: string; label: string }[];
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "友達に好きなお店を勧めるとき、あなたは？",
    options: [
      { value: "A", label: "相手の好みを聞いてから合う店を選ぶ" },
      { value: "B", label: "「一回行ってみて！」と熱量で押す" },
      { value: "C", label: "味・値段・口コミなど根拠を並べる" },
    ],
  },
  {
    id: 2,
    text: "初対面の人が多い場では？",
    options: [
      { value: "A", label: "自分から話しかけて輪を広げる" },
      { value: "B", label: "1人とじっくり話して仲良くなる" },
      { value: "C", label: "場を盛り上げて人と人をつなぐ" },
    ],
  },
  {
    id: 3,
    text: "仕事やバイトで褒められたことに近いのは？",
    options: [
      { value: "A", label: "「常連さんに覚えられてるね」" },
      { value: "B", label: "「困ってることによく気づくね」" },
      { value: "C", label: "「売上・効率を上げてくれた」" },
    ],
  },
  {
    id: 4,
    text: "目標が達成できそうにないとき、どうする？",
    options: [
      { value: "A", label: "行動量を増やして巻き返す" },
      { value: "B", label: "やり方を分析して作戦を立て直す" },
      { value: "C", label: "周りに声をかけてみんなで乗り切る" },
    ],
  },
  {
    id: 5,
    text: "相手に「考えておきます」と言われたら？",
    options: [
      { value: "A", label: "何が引っかかっているのか聞く" },
      { value: "B", label: "気持ちを尊重して、決めやすい時を待つ" },
      { value: "C", label: "時間をおいて連絡し、関係を続ける" },
    ],
  },
  {
    id: 6,
    text: "やりがいを感じる瞬間は？",
    options: [
      { value: "A", label: "「あなたに頼んでよかった」と言われたとき" },
      { value: "B", label: "誰もできなかったことを最初にやり遂げたとき" },
      { value: "C", label: "チームで目標を達成したとき" },
    ],
  },
  {
    id: 7,
    text: "好きな仕事の進め方は？",
    options: [
      { value: "A", label: "計画を立ててコツコツ積み上げる" },
      { value: "B", label: "まず動いて、走りながら考える" },
      { value: "C", label: "相手と話しながら一緒に答えを作る" },
    ],
  },
  {
    id: 8,
    text: "周りからよく言われるのは？",
    options: [
      { value: "A", label: "「話しやすい」「安心する」" },
      { value: "B", label: "「約束を守る」「信頼できる」" },
      { value: "C", label: "「説明がわかりやすい」" },
    ],
  },
  {
    id: 9,
    text: "苦手なのは？",
    options: [
      { value: "A", label: "一人で黙々と作業し続けること" },
      { value: "B", label: "相手の気持ちを置き去りにして進めること" },
      { value: "C", label: "根拠がないまま感覚で進めること" },
    ],
  },
  {
    id: 10,
    text: "チームでの理想の役割は？",
    options: [
      { value: "A", label: "みんなを引っ張るムードメーカー" },
      { value: "B", label: "一人ひとりの相談に乗るサポーター" },
      { value: "C", label: "情報を集めて方針を考える参謀" },
    ],
  },
];
