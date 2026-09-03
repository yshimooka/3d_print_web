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
  /** カードに出す一言(向いている用途) */
  description: string;
  details: string;
  image: string;
  colors: MaterialColor[];
  /** 税込・1cm³あたりの造形価格 */
  pricePerCm3: number;
  /** 1個あたりの最低造形価格(税込) */
  minPrice: number;
  /** 造形可能な最大サイズ mm(長辺順) */
  maxSizeMm: [number, number, number];
  features: string[];
  icon: string;
  method: string;
  layerHeight: string;
  tolerance: string;
  renderProps: MaterialRenderProps;
}

// 設計書 6.2: 初心者向けに選択肢は3プリセットに絞る。
// スタンダード / 高精細 / タフ の軸で、それぞれ代表的な工法を割り当てる。

export const materials: Material[] = [
  {
    id: "standard",
    name: "Standard Resin",
    nameJa: "スタンダード樹脂",
    description: "試作品や実用品に。いちばん手頃な定番素材。",
    details:
      "光造形(SLA)の標準レジンです。表面がなめらかで、細かい形もきれいに再現できます。小物・試作品・日用品のパーツなど、迷ったらまずこの素材がおすすめです。",
    image: "/materials/pla.png",
    colors: [
      { name: "グレー", hex: "#9CA3AF" },
      { name: "ホワイト", hex: "#F5F5F5" },
      { name: "ブラック", hex: "#1a1a1a" },
    ],
    pricePerCm3: 180,
    minPrice: 800,
    maxSizeMm: [200, 200, 200],
    features: ["いちばん手頃", "なめらかな表面", "迷ったらこれ"],
    icon: "🧩",
    method: "光造形（SLA）",
    layerHeight: "0.05 〜 0.1mm",
    tolerance: "±0.2mm",
    renderProps: {
      roughness: 0.35,
      metalness: 0.0,
      clearcoat: 0.3,
      clearcoatRoughness: 0.4,
      transmission: 0,
      opacity: 1,
      envMapIntensity: 0.6,
      ior: 1.5,
    },
  },
  {
    id: "fine",
    name: "Fine Resin",
    nameJa: "高精細レジン",
    description: "フィギュア・ミニチュアに。積層痕が目立たない美しい仕上がり。",
    details:
      "高解像度の光造形レジンです。髪の毛や布のしわのような微細なディテールまで忠実に再現でき、表面はつるりとなめらか。フィギュア、ミニチュア、アクセサリーの原型に最適です。",
    image: "/materials/resin.png",
    colors: [
      { name: "グレー", hex: "#9CA3AF" },
      { name: "ホワイト", hex: "#F5F5F5" },
      { name: "クリア", hex: "#DBEAFE" },
    ],
    pricePerCm3: 280,
    minPrice: 1200,
    maxSizeMm: [180, 180, 180],
    features: ["超高精細", "フィギュア向き", "塗装しやすい"],
    icon: "✨",
    method: "高解像度光造形（SLA 8K）",
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
    id: "tough",
    name: "Tough Nylon",
    nameJa: "タフナイロン",
    description: "動く部品・力のかかるパーツに。折れにくく実用強度。",
    details:
      "粉末焼結(MJF/SLS)のナイロン素材です。薄くても割れにくく、ヒンジやスナップフィットのような動く構造も作れます。実際に使う部品、屋外で使うもの、強度が必要なパーツにおすすめです。",
    image: "/materials/nylon.png",
    colors: [
      { name: "ナチュラルグレー", hex: "#8A8480" },
      { name: "ブラック（染色）", hex: "#1a1a1a" },
    ],
    pricePerCm3: 350,
    minPrice: 1500,
    maxSizeMm: [280, 280, 280],
    features: ["高強度", "割れにくい", "実用部品向き"],
    icon: "⚙️",
    method: "粉末焼結（MJF / SLS）",
    layerHeight: "0.08 〜 0.1mm",
    tolerance: "±0.3%（最小±0.3mm）",
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
];

export function findMaterial(id: string): Material | undefined {
  return materials.find((m) => m.id === id);
}
