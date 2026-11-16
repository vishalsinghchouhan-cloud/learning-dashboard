import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Roadmap from "@/models/Roadmap";
import Topic from "@/models/Topic";
import StudyLog from "@/models/StudyLog";

export async function GET() {
  try {
    await connectDB();
    const roadmaps = await Roadmap.find().sort({ createdAt: -1 });
    return NextResponse.json(roadmaps);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.title) {
      return NextResponse.json({ error: "Roadmap title is required" }, { status: 400 });
    }

    const roadmap = await Roadmap.create({
      title: body.title,
      description: body.description || "",
      source: "manual",
      targetFinishDate: body.targetFinishDate ? new Date(body.targetFinishDate) : undefined,
      weeklyStudyTargetHours: Number(body.weeklyStudyTargetHours) || 10,
    });

    return NextResponse.json(roadmap, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { roadmapId, title, description, weeklyStudyTargetHours, targetFinishDate } =
      await req.json();

    if (!roadmapId) {
      return NextResponse.json({ error: "roadmapId is required" }, { status: 400 });
    }

    const updated = await Roadmap.findByIdAndUpdate(
      roadmapId,
      {
        $set: {
          title,
          description,
          weeklyStudyTargetHours: Math.min(168, Math.max(1, Number(weeklyStudyTargetHours) || 10)),
          targetFinishDate: targetFinishDate ? new Date(targetFinishDate) : undefined,
        },
      },
      { new: true }
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const roadmapId = searchParams.get("roadmapId");

    if (!roadmapId) {
      return NextResponse.json({ error: "roadmapId is required" }, { status: 400 });
    }

    await Promise.all([
      Roadmap.findByIdAndDelete(roadmapId),
      Topic.deleteMany({ roadmapId }),
      StudyLog.deleteMany({ roadmapId }),
    ]);

    return NextResponse.json({ message: "Roadmap deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}