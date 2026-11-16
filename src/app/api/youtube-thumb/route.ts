import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("v");

  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return new NextResponse("Invalid video ID", { status: 400 });
  }

  const candidates = [
    `https://ytimg.com{videoId}/hqdefault.jpg`,
    `https://youtube.com{videoId}/mqdefault.jpg`,
    `https://ytimg.com{videoId}/default.jpg`,
  ];

  for (const targetUrl of candidates) {
    try {
      const res = await fetch(targetUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        cache: "no-store",
      });

      if (res.ok) {
        const buffer = await res.arrayBuffer();
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": res.headers.get("Content-Type") || "image/jpeg",
            "Cache-Control": "public, max-age=86400",
          },
        });
      }
    } catch {
      // Try next candidate
    }
  }

  return new NextResponse("Thumbnail unavailable", { status: 404 });
}
