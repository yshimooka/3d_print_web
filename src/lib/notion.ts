// Notion連携(受注管理をNotionデータベースと同期する)。
// 環境変数 NOTION_API_KEY / NOTION_DATABASE_ID が未設定の場合は何もしない(通常の注文フローは阻害しない)。
//
// Notion側で用意するデータベースのプロパティ(名前は下記と一致させること):
//   注文番号     Title
//   ステータス   Select    (選択肢: 受注ステータスラベル。ORDER_STATUS_LABELS を参照)
//   お客様       Text
//   メール       Email
//   電話番号     Phone
//   郵便番号     Text
//   住所         Text
//   ファイル名   Text
//   ファイル     Files & media  (S3の署名付きURLへの外部リンク。7日で失効するため、
//                                 期限切れ後は管理画面からダウンロードし直すこと)
//   素材         Text
//   カラー       Text
//   数量         Number
//   サイズ(mm)   Text
//   体積(cm3)    Number
//   合計金額     Number
//   お届け予定   Text
//   注文日時     Date
//
// integration(NOTION_API_KEY)をそのデータベースに「接続」した上で、
// データベースURL末尾の32桁ID(ハイフン任意)を NOTION_DATABASE_ID に設定する。
//
// ファイル本体はNotionには置かず(容量制限が厳しいため)、S3(src/lib/s3.ts)に保存し
// 署名付きURLをNotionの「ファイル」プロパティにリンクとして貼るだけにしている。

import { ORDER_STATUS_LABELS, type OrderRecord, type OrderStatus } from "@/lib/orderTypes";

const NOTION_VERSION = "2022-06-28";

function isNotionConfigured(): boolean {
  return Boolean(process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID);
}

async function notionRequest(path: string, init: RequestInit): Promise<unknown> {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Notion API error (${res.status}): ${text}`);
  }
  return res.json();
}

function notionJson(path: string, body: unknown, method = "POST"): Promise<unknown> {
  return notionRequest(path, { method, body: JSON.stringify(body) });
}

function richText(content: string) {
  return { rich_text: [{ text: { content: content.slice(0, 2000) } }] };
}

function buildNotionProperties(order: OrderRecord): Record<string, unknown> {
  const { item, quote, customer } = order;
  return {
    "注文番号": { title: [{ text: { content: order.id } }] },
    "ステータス": { select: { name: ORDER_STATUS_LABELS[order.status] } },
    "お客様": richText(`${customer.lastName} ${customer.firstName}`),
    "メール": { email: customer.email },
    "電話番号": { phone_number: customer.phone },
    "郵便番号": richText(customer.zip),
    "住所": richText(`${customer.prefecture}${customer.city}${customer.address}`),
    "ファイル名": richText(order.file.name),
    "素材": richText(item.materialName),
    "カラー": richText(item.colorName),
    "数量": { number: item.quantity },
    "サイズ(mm)": richText(
      `${item.bboxMm.x.toFixed(0)}×${item.bboxMm.y.toFixed(0)}×${item.bboxMm.z.toFixed(0)}`
    ),
    "体積(cm3)": { number: Number(item.volumeCm3.toFixed(2)) },
    "合計金額": { number: quote.total },
    "お届け予定": richText(order.deliveryEstimate),
    "注文日時": { date: { start: order.createdAt } },
  };
}

// 新規注文をNotionデータベースに登録する。fileUrl があれば「ファイル」プロパティに
// 外部リンクとして貼る(S3の署名付きURLを想定)。失敗しても注文自体は成立させたいので
// 例外を投げず null を返す。
export async function createNotionOrderPage(
  order: OrderRecord,
  fileUrl?: string | null
): Promise<string | null> {
  if (!isNotionConfigured()) return null;
  try {
    const properties = buildNotionProperties(order);
    if (fileUrl) {
      properties["ファイル"] = {
        type: "files",
        files: [
          {
            type: "external",
            name: order.file.name.slice(0, 900),
            external: { url: fileUrl },
          },
        ],
      };
    }

    const data = (await notionJson("/pages", {
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties,
    })) as { id: string };
    return data.id;
  } catch (err) {
    console.error("[notion] 受注ページの作成に失敗しました:", err);
    return null;
  }
}

// 注文ステータス変更をNotion側にも反映する。
export async function updateNotionOrderStatus(
  pageId: string,
  status: OrderStatus
): Promise<void> {
  if (!isNotionConfigured()) return;
  try {
    await notionJson(
      `/pages/${pageId}`,
      {
        properties: {
          "ステータス": { select: { name: ORDER_STATUS_LABELS[status] } },
        },
      },
      "PATCH"
    );
  } catch (err) {
    console.error("[notion] ステータス更新の反映に失敗しました:", err);
  }
}
