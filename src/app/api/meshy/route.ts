import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: "画像ファイルが必要です" },
        { status: 400 }
      );
    }

    // Convert image to base64 for imgbb upload
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // Upload to imgbb to get a public URL (required by Meshy)
    const imgbbForm = new FormData();
    imgbbForm.append("image", base64);

    const imgbbRes = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      { method: "POST", body: imgbbForm }
    );
    const imgbbData = await imgbbRes.json();

    if (!imgbbData.success) {
      console.error("imgbb error:", imgbbData);
      return NextResponse.json(
        { error: "画像のアップロードに失敗しました" },
        { status: 500 }
      );
    }

    const imageUrl: string = imgbbData.data.url;

    // Create Meshy image-to-3D task
    const meshyRes = await fetch(
      "https://api.meshy.ai/openapi/v2/image-to-3d",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.MESHY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: imageUrl,
          enable_pbr: true,
          ai_model: "meshy-4",
          topology: "triangle",
          target_polycount: 30000,
        }),
      }
    );

    const meshyData = await meshyRes.json();

    if (!meshyRes.ok) {
      console.error("Meshy error:", meshyData);
      return NextResponse.json(
        { error: meshyData.message || "3D生成タスクの作成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ taskId: meshyData.result });
  } catch (err) {
    console.error("Meshy POST error:", err);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
