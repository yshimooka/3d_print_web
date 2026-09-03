import { NextRequest, NextResponse } from "next/server";
import {
  ORDER_STATUSES,
  updateOrderStatus,
  type OrderStatus,
} from "@/lib/orders";
import { updateNotionOrderStatus } from "@/lib/notion";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = process.env.ADMIN_TOKEN;
  if (token && req.headers.get("x-admin-token") !== token) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { id } = await params;
  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "リクエストが不正です" }, { status: 400 });
  }

  if (!body.status || !ORDER_STATUSES.includes(body.status as OrderStatus)) {
    return NextResponse.json({ error: "ステータスが不正です" }, { status: 400 });
  }

  const order = await updateOrderStatus(id, body.status as OrderStatus);
  if (!order) {
    return NextResponse.json({ error: "注文が見つかりません" }, { status: 404 });
  }

  if (order.notionPageId) {
    await updateNotionOrderStatus(order.notionPageId, order.status);
  }

  return NextResponse.json({ order });
}
