import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    const res = await fetch(
      `https://api.meshy.ai/openapi/v2/image-to-3d/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MESHY_API_KEY}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "ステータス取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: data.status as "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED",
      progress: data.progress ?? 0,
      modelUrl: data.model_urls?.glb ?? null,
    });
  } catch (err) {
    console.error("Meshy GET error:", err);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
