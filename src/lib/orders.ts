import { promises as fs } from "fs";
import path from "path";
import type { OrderRecord, OrderStatus } from "@/lib/orderTypes";

export type { OrderRecord, OrderStatus } from "@/lib/orderTypes";
export { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/orderTypes";

// ─── 受注ストア(MVP: ファイルベース) ─────────────────
// 本番ではDBに置き換える前提。data/ は .gitignore 済み。

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

async function readAll(): Promise<OrderRecord[]> {
  try {
    const raw = await fs.readFile(ORDERS_FILE, "utf-8");
    return JSON.parse(raw) as OrderRecord[];
  } catch {
    return [];
  }
}

async function writeAll(orders: OrderRecord[]) {
  await ensureDataDir();
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
}

export function generateOrderId(): string {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `OK-${t}${r}`;
}

export async function listOrders(): Promise<OrderRecord[]> {
  const orders = await readAll();
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrderById(id: string): Promise<OrderRecord | null> {
  const orders = await readAll();
  return orders.find((o) => o.id === id) ?? null;
}

export async function saveOrder(order: OrderRecord): Promise<void> {
  const orders = await readAll();
  orders.push(order);
  await writeAll(orders);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<OrderRecord | null> {
  const orders = await readAll();
  const order = orders.find((o) => o.id === id);
  if (!order) return null;
  order.status = status;
  order.updatedAt = new Date().toISOString();
  await writeAll(orders);
  return order;
}

export async function setOrderNotionPageId(
  id: string,
  notionPageId: string
): Promise<void> {
  const orders = await readAll();
  const order = orders.find((o) => o.id === id);
  if (!order) return;
  order.notionPageId = notionPageId;
  await writeAll(orders);
}

export async function saveUploadedFile(
  orderId: string,
  file: File
): Promise<{ storedPath: string }> {
  await ensureDataDir();
  const dir = path.join(UPLOADS_DIR, orderId);
  await fs.mkdir(dir, { recursive: true });
  // パストラバーサル対策: ベース名のみ使い、危険文字を除去
  const safeName = path.basename(file.name).replace(/[^\w.\-()（）ぁ-んァ-ン一-龥]/g, "_");
  const dest = path.join(dir, safeName || "model");
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(dest, buf);
  return { storedPath: path.relative(process.cwd(), dest) };
}
