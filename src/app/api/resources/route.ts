import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Resource } from "@/models/KnowledgeHub";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get("topicId");

    const filter = topicId ? { topicId } : {};
    const resources = await Resource.find(filter).populate("topicId", "title").sort({ createdAt: -1 });
    return NextResponse.json(resources);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.topicId || !body.title || !body.url) {
      return NextResponse.json({ error: "topicId, title, and url are required" }, { status: 400 });
    }

    const resource = await Resource.create({
      topicId: body.topicId,
      title: body.title,
      url: body.url,
      type: body.type || "Article",
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
