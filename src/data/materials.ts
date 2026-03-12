export interface MaterialColor {
  name: string;
  hex: string;
}

export interface MaterialRenderProps {
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  transmission: number; // 0 = opaque, 1 = fully transparent
  opacity: number;
  envMapIntensity: number;
  ior: number; // index of refraction (glass ~1.5)
}

export interface Material {
  id: string;
  name: string;
  nameJa: string;
  description: string;
  details: string;
  image: string;
  colors: MaterialColor[];
  pricePerCm3: number;
  features: string[];
  icon: string;
  method: string;
  layerHeight: string;
  tolerance: string;
  renderProps: MaterialRenderProps;
}

export const materials: Material[] = [
  {
    id: "pla",
    name: "PLA",
    nameJa: "PLA樹脂",
    description: "最もポピュラーな素材。環境にやさしく、精度の高い仕上がり。",
    details: "植物由来のバイオプラスチック。寸法精度が高く、表面も滑らかに仕上がります。プロトタイプや装飾品、建築模型に最適です。",
    image: "/materials/pla.png",
    colors: [
      { name: "ホワイト", hex: "#F5F5F5" },
      { name: "ブラック", hex: "#1a1a1a" },
      { name: "レッド", hex: "#EF4444" },
      { name: "ブルー", hex: "#3B82F6" },
      { name: "グリーン", hex: "#22C55E" },
      { name: "イエロー", hex: "#EAB308" },
      { name: "オレンジ", hex: "#F97316" },
      { name: "グレー", hex: "#6B7280" },
    ],
    pricePerCm3: 30,
    features: ["高精度", "環境にやさしい", "初心者向け"],
    icon: "🌿",
    method: "FDM（熱溶解積層）",
    layerHeight: "0.1 〜 0.3mm",
    tolerance: "±0.3mm",
    renderProps: {
      roughness: 0.55,
      metalness: 0.0,
      clearcoat: 0.1,
      clearcoatRoughness: 0.8,
      transmission: 0,
      opacity: 1,
      envMapIntensity: 0.5,
      ior: 1.45,
    },
  },
  {
    id: "abs",
    name: "ABS",
    nameJa: "ABS樹脂",
    description: "耐衝撃性・耐熱性に優れた汎用プラスチック。",
    details: "自動車部品やLEGOにも使われる高強度素材。後加工（研磨・塗装・アセトン処理）で表面を滑らかに仕上げることも可能です。",
    image: "/materials/abs.png",
    colors: [
      { name: "ホワイト", hex: "#F5F5F5" },
      { name: "ブラック", hex: "#1a1a1a" },
      { name: "レッド", hex: "#DC2626" },
      { name: "ブルー", hex: "#2563EB" },
      { name: "グレー", hex: "#6B7280" },
    ],
    pricePerCm3: 35,
    features: ["高耐久", "耐熱性", "後加工しやすい"],
    icon: "🔧",
    method: "FDM（熱溶解積層）",
    layerHeight: "0.1 〜 0.3mm",
    tolerance: "±0.3mm",
    renderProps: {
      roughness: 0.45,
      metalness: 0.0,
      clearcoat: 0.2,
      clearcoatRoughness: 0.6,
      transmission: 0,
      opacity: 1,
      envMapIntensity: 0.6,
      ior: 1.45,
    },
  },
  {
    id: "petg",
    name: "PETG",
    nameJa: "PETG樹脂",
    description: "透明性が高く、食品安全基準にも対応。",
    details: "PETボトルと同系統の素材で、透明性と耐薬品性に優れます。食品容器や医療器具のプロトタイプ、透明カバーなどに適しています。",
    image: "/materials/petg.png",
    colors: [
      { name: "クリア", hex: "#E0F2FE" },
      { name: "ホワイト", hex: "#F5F5F5" },
      { name: "ブラック", hex: "#1a1a1a" },
      { name: "ブルー", hex: "#60A5FA" },
      { name: "グリーン", hex: "#4ADE80" },
    ],
    pricePerCm3: 40,
    features: ["透明性", "耐薬品性", "食品安全"],
    icon: "💎",
    method: "FDM（熱溶解積層）",
    layerHeight: "0.1 〜 0.3mm",
    tolerance: "±0.3mm",
    renderProps: {
      roughness: 0.15,
      metalness: 0.0,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      transmission: 0.6,
      opacity: 0.85,
      envMapIntensity: 1.0,
      ior: 1.57,
    },
  },
  {
    id: "nylon",
    name: "Nylon",
    nameJa: "ナイロン",
    description: "高い強度と柔軟性を持つエンジニアリング素材。",
    details: "SLS（選択的レーザー焼結）方式で造形。サポート材不要で複雑な機構パーツや可動部品、スナップフィットの製作に最適です。",
    image: "/materials/nylon.png",
    colors: [
      { name: "ナチュラル", hex: "#FEF3C7" },
      { name: "ホワイト", hex: "#F5F5F5" },
      { name: "ブラック", hex: "#1a1a1a" },
    ],
    pricePerCm3: 80,
    features: ["高強度", "柔軟性", "耐摩耗性"],
    icon: "⚡",
    method: "SLS（選択的レーザー焼結）",
    layerHeight: "0.1mm",
    tolerance: "±0.2mm",
    renderProps: {
      roughness: 0.7,
      metalness: 0.0,
      clearcoat: 0.0,
      clearcoatRoughness: 1.0,
      transmission: 0,
      opacity: 1,
      envMapIntensity: 0.4,
      ior: 1.45,
    },
  },
  {
    id: "resin",
    name: "Resin",
    nameJa: "レジン（光造形）",
    description: "超高精度。フィギュアやジュエリー原型に。",
    details: "SLA/DLP方式による光造形。層の厚みが25〜50μmと極めて薄く、微細なディテールまで再現。フィギュアやジュエリー原型に最適です。",
    image: "/materials/resin.png",
    colors: [
      { name: "グレー", hex: "#9CA3AF" },
      { name: "ホワイト", hex: "#F5F5F5" },
      { name: "クリア", hex: "#DBEAFE" },
      { name: "ブラック", hex: "#1a1a1a" },
    ],
    pricePerCm3: 100,
    features: ["超高精度", "滑らかな表面", "微細造形"],
    icon: "✨",
    method: "SLA / DLP（光造形）",
    layerHeight: "0.025 〜 0.05mm",
    tolerance: "±0.1mm",
    renderProps: {
      roughness: 0.08,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      transmission: 0,
      opacity: 1,
      envMapIntensity: 0.8,
      ior: 1.5,
    },
  },
  {
    id: "metal",
    name: "Metal",
    nameJa: "メタル（チタン合金）",
    description: "航空宇宙・医療グレードの金属素材。",
    details: "DMLS（直接金属レーザー焼結）方式で造形。チタン合金Ti-6Al-4Vを使用し、航空宇宙や医療インプラントレベルの強度と精度を実現します。",
    image: "/materials/metal.png",
    colors: [
      { name: "シルバー", hex: "#C0C0C0" },
      { name: "チタングレー", hex: "#8B8B8B" },
    ],
    pricePerCm3: 500,
    features: ["最高強度", "耐腐食性", "軽量"],
    icon: "🛡️",
    method: "DMLS（金属レーザー焼結）",
    layerHeight: "0.02 〜 0.06mm",
    tolerance: "±0.1mm",
    renderProps: {
      roughness: 0.25,
      metalness: 0.95,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2,
      transmission: 0,
      opacity: 1,
      envMapIntensity: 1.5,
      ior: 2.5,
    },
  },
];
