import { NextRequest, NextResponse } from "next/server";
import { findMaterial } from "@/data/materials";
import {
  HANDLING_FEE,
  SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
  unitPriceFor,
  checkSizeIssues,
  deliveryWindow,
  type MeshStats,
} from "@/lib/quote";
import {
  generateOrderId,
  saveOrder,
  saveUploadedFile,
  setOrderNotionPageId,
  listOrders,
  type OrderRecord,
} from "@/lib/orders";
import { createNotionOrderPage } from "@/lib/notion";
import { uploadOrderFileToS3, getPresignedFileUrl } from "@/lib/s3";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_QUANTITY = 100;

interface OrderPayload {
  materialId: string;
  colorName: string;
  quantity: number;
  stats: MeshStats;
  customer: {
    lastName: string;
    firstName: string;
    email: string;
    phone: string;
    zip: string;
    prefecture: string;
    city: string;
    address: string;
  };
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return bad("リクエスト形式が不正です");
  }

  const file = form.get("file");
  const payloadRaw = form.get("payload");
  if (!(file instanceof File)) return bad("3Dデータファイルがありません");
  if (file.size === 0 || file.size > MAX_FILE_SIZE)
    return bad("ファイルサイズが不正です(最大100MB)");
  if (typeof payloadRaw !== "string") return bad("注文内容がありません");

  let payload: OrderPayload;
  try {
    payload = JSON.parse(payloadRaw);
  } catch {
    return bad("注文内容の形式が不正です");
  }

  const material = findMaterial(payload.materialId);
  if (!material) return bad("素材の指定が不正です");

  const colorName = String(payload.colorName ?? "");
  if (!material.colors.some((c) => c.name === colorName))
    return bad("カラーの指定が不正です");

  const quantity = Number(payload.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY)
    return bad("数量が不正です");

  const stats = payload.stats;
  if (
    !stats ||
    typeof stats.volumeCm3 !== "number" ||
    !isFinite(stats.volumeCm3) ||
    stats.volumeCm3 <= 0 ||
    !stats.bboxMm
  )
    return bad("モデル情報が不正です");

  // 価格はクライアントの申告値を信用せずサーバー側で再計算する
  if (checkSizeIssues(material, stats).some((i) => i.blocking))
    return bad("この素材で造形できないサイズです");

  const c = payload.customer ?? ({} as OrderPayload["customer"]);
  const required: [keyof OrderPayload["customer"], string][] = [
    ["lastName", "姓"],
    ["firstName", "名"],
    ["email", "メールアドレス"],
    ["phone", "電話番号"],
    ["zip", "郵便番号"],
    ["prefecture", "都道府県"],
    ["city", "市区町村"],
    ["address", "番地・建物名"],
  ];
  for (const [key, label] of required) {
    if (!c[key] || typeof c[key] !== "string" || !c[key].trim())
      return bad(`${label}を入力してください`);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email))
    return bad("メールアドレスの形式が正しくありません");

  const unitPrice = unitPriceFor(material, stats);
  const printSubtotal = unitPrice * quantity;
  const shippingFee =
    printSubtotal + HANDLING_FEE >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  const id = generateOrderId();
  const { storedPath } = await saveUploadedFile(id, file);
  // S3に保存されていれば以後Notionリンク等で使う(未設定/失敗時は undefined のまま)
  const s3Result = await uploadOrderFileToS3(id, file);
  const now = new Date().toISOString();

  const order: OrderRecord = {
    id,
    createdAt: now,
    updatedAt: now,
    status: "received",
    file: { name: file.name, size: file.size, storedPath, s3Key: s3Result?.key },
    item: {
      materialId: material.id,
      materialName: material.nameJa,
      colorName,
      quantity,
      volumeCm3: stats.volumeCm3,
      bboxMm: stats.bboxMm,
    },
    quote: {
      unitPrice,
      printSubtotal,
      handlingFee: HANDLING_FEE,
      shippingFee,
      total: printSubtotal + HANDLING_FEE + shippingFee,
    },
    customer: {
      lastName: c.lastName.trim(),
      firstName: c.firstName.trim(),
      email: c.email.trim(),
      phone: c.phone.trim(),
      zip: c.zip.trim(),
      prefecture: c.prefecture.trim(),
      city: c.city.trim(),
      address: c.address.trim(),
    },
    deliveryEstimate: deliveryWindow().label,
    payment: { method: "card_mock", status: "authorized_mock" },
  };

  await saveOrder(order);

  // Notion側に受注DBを持つ場合は同期する(未設定/失敗でも注文自体は成立させる)
  const fileUrl = s3Result ? await getPresignedFileUrl(s3Result.key) : null;
  const notionPageId = await createNotionOrderPage(order, fileUrl);
  if (notionPageId) await setOrderNotionPageId(order.id, notionPageId);

  // TODO(Phase1残): 注文確認メール送信(Resend等)、Stripe決済への置き換え
  return NextResponse.json({
    id: order.id,
    total: order.quote.total,
    deliveryEstimate: order.deliveryEstimate,
  });
}

// 受注一覧(管理用)。MVP: ADMIN_TOKEN が設定されていればヘッダで簡易認証。
export async function GET(req: NextRequest) {
  const token = process.env.ADMIN_TOKEN;
  if (token && req.headers.get("x-admin-token") !== token) {
    return bad("認証が必要です", 401);
  }
  const orders = await listOrders();
  return NextResponse.json({ orders });
}
