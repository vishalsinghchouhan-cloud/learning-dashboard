import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Roadmap from "@/models/Roadmap";
import Topic from "@/models/Topic";
import { parseExternalRoadmapJSON } from "@/lib/jsonParser";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { jsonData, fileName, weeklyStudyTargetHours, targetFinishDate } = await req.json();

    if (!jsonData) {
      return NextResponse.json({ error: "No JSON data provided" }, { status: 400 });
    }

    const parsed = parseExternalRoadmapJSON(jsonData, fileName);

    if (parsed.topics.length === 0) {
      return NextResponse.json(
        { error: "Could not find any valid topics in the uploaded JSON file" },
        { status: 400 }
      );
    }

    // 1. Create the parent Roadmap
    const roadmap = await Roadmap.create({
      title: parsed.title,
      description: parsed.description,
      source: "json_import",
      weeklyStudyTargetHours: weeklyStudyTargetHours || 10,
      targetFinishDate: targetFinishDate ? new Date(targetFinishDate) : undefined,
    });

    // 2. Insert all parsed Topics with their recursive subtopics
    const topicDocs = parsed.topics.map((t) => ({
      ...t,
      roadmapId: roadmap._id,
    }));

    const createdTopics = await Topic.insertMany(topicDocs);

    return NextResponse.json(
      {
        message: "Roadmap imported successfully",
        roadmap,
        topicsCount: createdTopics.length,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to import JSON" }, { status: 500 });
  }
}
