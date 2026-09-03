// 3Dデータ本体をAmazon S3に保存する。
// Notionには直接ファイルを置かず、S3に保存した上でダウンロード用の署名付きURLをリンクする。
// 環境変数(S3_REGION, S3_BUCKET_NAME, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY)が
// 未設定の場合は何もしない(通常の注文フローは阻害しない)。
//
// バケットは非公開(Block Public Access有効)のまま運用し、
// ダウンロードは都度 getPresignedFileUrl() で発行する短命なURL経由でのみ許可する想定。

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const REGION = process.env.S3_REGION;
const BUCKET = process.env.S3_BUCKET_NAME;

function isS3Configured(): boolean {
  return Boolean(
    REGION && BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
  );
}

let client: S3Client | null = null;
function getClient(): S3Client {
  if (!client) client = new S3Client({ region: REGION });
  return client;
}

function keyFor(orderId: string, filename: string): string {
  const safeName = filename.replace(/[^\w.\-()（）ぁ-んァ-ン一-龥]/g, "_");
  return `orders/${orderId}/${safeName || "model"}`;
}

// 注文の3DデータをS3にアップロードする。失敗/未設定時は null を返し、注文自体は継続させる。
export async function uploadOrderFileToS3(
  orderId: string,
  file: File
): Promise<{ key: string } | null> {
  if (!isS3Configured()) return null;
  try {
    const key = keyFor(orderId, file.name);
    const buf = Buffer.from(await file.arrayBuffer());
    await getClient().send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buf,
        ContentType: file.type || "application/octet-stream",
      })
    );
    return { key };
  } catch (err) {
    console.error("[s3] 3Dデータのアップロードに失敗しました:", err);
    return null;
  }
}

// S3オブジェクトへの一時的なダウンロードURLを発行する(既定7日=SigV4署名の最大有効期限)。
export async function getPresignedFileUrl(
  key: string,
  expiresInSeconds = 60 * 60 * 24 * 7
): Promise<string | null> {
  if (!isS3Configured()) return null;
  try {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    return await getSignedUrl(getClient(), command, { expiresIn: expiresInSeconds });
  } catch (err) {
    console.error("[s3] 署名付きURLの発行に失敗しました:", err);
    return null;
  }
}
