import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/orders";
import { getPresignedFileUrl } from "@/lib/s3";

export const runtime = "nodejs";

// 管理画面用: 注文の3Dデータをダウンロードするための署名付きURLをその場で発行する。
// S3の署名付きURLは有効期限があるため、Notionに貼ったリンクが切れても
// ここから常に新しいURLを取得できるようにしている。
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = process.env.ADMIN_TOKEN;
  if (token && req.headers.get("x-admin-token") !== token) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "注文が見つかりません" }, { status: 404 });
  }
  if (!order.file.s3Key) {
    return NextResponse.json({ error: "この注文にはS3上のファイルがありません" }, { status: 404 });
  }

  const url = await getPresignedFileUrl(order.file.s3Key, 60 * 15);
  if (!url) {
    return NextResponse.json({ error: "ダウンロードURLの発行に失敗しました" }, { status: 500 });
  }
  return NextResponse.json({ url });
}
