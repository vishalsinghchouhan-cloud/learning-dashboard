import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Topic from "@/models/Topic";
import { getPaginationParams, paginateQuery } from "@/lib/paginate";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const roadmapId = searchParams.get("roadmapId");
    const difficulty = searchParams.get("difficulty");

    const filter: any = {};
    if (roadmapId) filter.roadmapId = roadmapId;
    if (difficulty && difficulty !== "All") filter.difficulty = difficulty;

    const pagination = getPaginationParams(req.url, 10);
    if (pagination) {
      const result = await paginateQuery(Topic, filter, {
        ...pagination,
        sort: { createdAt: 1 },
      });
      return NextResponse.json(result);
    }

    const topics = await Topic.find(filter).sort({ createdAt: 1 });
    return NextResponse.json(topics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.roadmapId || !body.title) {
      return NextResponse.json({ error: "roadmapId and title are required" }, { status: 400 });
    }

    const topic = await Topic.create({
      roadmapId: body.roadmapId,
      title: body.title,
      difficulty: body.difficulty || "Beginner",
      estimatedHours: Number(body.estimatedHours) || 2,
      status: "Not Started",
      subtopics: body.subtopics || [], // Supports nested subtopics array
    });

    return NextResponse.json(topic, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
