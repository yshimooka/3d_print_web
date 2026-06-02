import { NextRequest, NextResponse } from "next/server";

// Proxy the GLB download from Meshy CDN to avoid CORS issues on the client
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "urlパラメータが必要です" }, { status: 400 });
  }

  try {
    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json(
        { error: "モデルの取得に失敗しました" },
        { status: 500 }
      );
    }

    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "model/gltf-binary",
        "Content-Disposition": 'attachment; filename="generated_model.glb"',
      },
    });
  } catch (err) {
    console.error("Model proxy error:", err);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
