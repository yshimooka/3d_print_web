import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Notion連携の疎通確認用(一時的な診断エンドポイント)。
// ADMIN_TOKENで保護し、Notion APIの生レスポンス(ステータス/本文)をそのまま返すことで、
// 本番環境でログを追わなくても設定ミスの原因(401=キー不正, 404=DB未接続/ID不正 等)を特定できるようにする。
// 原因判明後はこのファイルごと削除して問題ない。
export async function GET(req: NextRequest) {
  const token = process.env.ADMIN_TOKEN;
  if (token && req.headers.get("x-admin-token") !== token) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;

  const env = {
    NOTION_API_KEY: apiKey ? `設定あり(先頭: ${apiKey.slice(0, 7)}..., 長さ: ${apiKey.length})` : "未設定",
    NOTION_DATABASE_ID: databaseId ? `設定あり(値: ${databaseId})` : "未設定",
  };

  if (!apiKey || !databaseId) {
    return NextResponse.json({ env, result: "環境変数が未設定のためNotion APIへの疎通確認をスキップしました" });
  }

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2022-06-28",
      },
    });
    const bodyText = await res.text();
    let body: unknown = bodyText;
    try {
      body = JSON.parse(bodyText);
    } catch {
      // JSONでなければテキストのまま
    }
    return NextResponse.json({
      env,
      request: `GET https://api.notion.com/v1/databases/${databaseId}`,
      status: res.status,
      ok: res.ok,
      body,
    });
  } catch (err) {
    return NextResponse.json({
      env,
      error: "Notion APIへのリクエスト自体が失敗しました(ネットワーク到達性の問題の可能性)",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}
