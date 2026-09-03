import * as THREE from "three";
import { materials, type Material } from "@/data/materials";

// ─── モデル計測 ───────────────────────────────────────
// 3Dデータの単位は mm とみなす(STL/OBJ/STEPの慣例)。

export interface MeshStats {
  /** 実体積 (cm³)。閉じていないメッシュでは近似値になる */
  volumeCm3: number;
  /** バウンディングボックス (mm) */
  bboxMm: { x: number; y: number; z: number };
  triangleCount: number;
}

export function computeMeshStats(object: THREE.Object3D): MeshStats {
  let volumeMm3 = 0;
  let triangleCount = 0;
  const bbox = new THREE.Box3();

  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();

  object.updateWorldMatrix(true, true);

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || !child.geometry) return;
    const geo = child.geometry as THREE.BufferGeometry;
    const pos = geo.attributes.position;
    if (!pos) return;

    const matrix = child.matrixWorld;
    bbox.expandByObject(child);

    const index = geo.index;
    const triCount = index ? index.count / 3 : pos.count / 3;
    triangleCount += triCount;

    // 符号付き四面体の総和で実体積を計算
    for (let i = 0; i < triCount; i++) {
      const i0 = index ? index.getX(i * 3) : i * 3;
      const i1 = index ? index.getX(i * 3 + 1) : i * 3 + 1;
      const i2 = index ? index.getX(i * 3 + 2) : i * 3 + 2;

      vA.fromBufferAttribute(pos, i0).applyMatrix4(matrix);
      vB.fromBufferAttribute(pos, i1).applyMatrix4(matrix);
      vC.fromBufferAttribute(pos, i2).applyMatrix4(matrix);

      volumeMm3 += vA.dot(vB.clone().cross(vC)) / 6;
    }
  });

  const size = new THREE.Vector3();
  if (!bbox.isEmpty()) bbox.getSize(size);

  return {
    volumeCm3: Math.abs(volumeMm3) / 1000,
    bboxMm: { x: size.x, y: size.y, z: size.z },
    triangleCount,
  };
}

// ─── 料金計算 ─────────────────────────────────────────
// 設計書 4.2: 造形価格(委託原価×2.5相当) + 基本手数料500円 + 送料一律500円(5,000円以上無料)
// すべて税込表示。

export const HANDLING_FEE = 500;
export const SHIPPING_FEE = 500;
export const FREE_SHIPPING_THRESHOLD = 5000;

/** お届け日数(営業日ではなく暦日): 提携工場製造+輸送+検品のバッファ込み */
export const DELIVERY_DAYS_MIN = 10;
export const DELIVERY_DAYS_MAX = 16;

export interface QuoteIssue {
  type: "oversize" | "too_small";
  message: string;
  blocking: boolean;
}

export interface Quote {
  materialId: string;
  quantity: number;
  /** 1個あたりの造形価格(税込) */
  unitPrice: number;
  /** 造形価格 × 数量 */
  printSubtotal: number;
  handlingFee: number;
  shippingFee: number;
  total: number;
  issues: QuoteIssue[];
  /** 注文可能か(サイズ超過などがない) */
  orderable: boolean;
}

/** 素材ごとの1個あたり造形価格(税込・整数円) */
export function unitPriceFor(material: Material, stats: MeshStats): number {
  const raw = stats.volumeCm3 * material.pricePerCm3;
  return Math.max(material.minPrice, Math.ceil(raw / 10) * 10);
}

export function checkSizeIssues(material: Material, stats: MeshStats): QuoteIssue[] {
  const issues: QuoteIssue[] = [];
  const { x, y, z } = stats.bboxMm;
  const dims = [x, y, z].sort((a, b) => b - a);
  const max = material.maxSizeMm;

  if (dims[0] > max[0] || dims[1] > max[1] || dims[2] > max[2]) {
    issues.push({
      type: "oversize",
      blocking: true,
      message: `モデルが大きすぎます(${x.toFixed(0)}×${y.toFixed(0)}×${z.toFixed(0)}mm)。この素材の最大サイズは ${max[0]}×${max[1]}×${max[2]}mm です。`,
    });
  }

  const minDim = Math.min(x, y, z);
  if (minDim > 0 && minDim < 3) {
    issues.push({
      type: "too_small",
      blocking: false,
      message: `モデル全体がとても小さいため(最小 ${minDim.toFixed(1)}mm)、細部が再現されない場合があります。`,
    });
  }

  return issues;
}

export function computeQuote(
  materialId: string,
  stats: MeshStats,
  quantity: number
): Quote | null {
  const material = materials.find((m) => m.id === materialId);
  if (!material) return null;

  const unitPrice = unitPriceFor(material, stats);
  const printSubtotal = unitPrice * quantity;
  const shippingFee =
    printSubtotal + HANDLING_FEE >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const issues = checkSizeIssues(material, stats);

  return {
    materialId,
    quantity,
    unitPrice,
    printSubtotal,
    handlingFee: HANDLING_FEE,
    shippingFee,
    total: printSubtotal + HANDLING_FEE + shippingFee,
    issues,
    orderable: !issues.some((i) => i.blocking),
  };
}

// ─── お届け予定 ───────────────────────────────────────

export interface DeliveryWindow {
  from: Date;
  to: Date;
  /** 「7月14日〜7月20日」形式 */
  label: string;
}

export function deliveryWindow(base: Date = new Date()): DeliveryWindow {
  const from = new Date(base);
  from.setDate(from.getDate() + DELIVERY_DAYS_MIN);
  const to = new Date(base);
  to.setDate(to.getDate() + DELIVERY_DAYS_MAX);

  const fmt = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`;
  return { from, to, label: `${fmt(from)}〜${fmt(to)}` };
}
