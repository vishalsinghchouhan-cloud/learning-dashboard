import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import StudyLog from "@/models/StudyLog";

function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const uniqueDays = Array.from(
    new Set(dates.map((d) => new Date(d).toISOString().split("T")[0]))
  ).sort((a, b) => (a > b ? -1 : 1)); // Sort newest to oldest

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // If the most recent study log wasn't today or yesterday, streak is broken
  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 0; i < uniqueDays.length - 1; i++) {
    const curr = new Date(uniqueDays[i]).getTime();
    const next = new Date(uniqueDays[i + 1]).getTime();
    const diffDays = Math.round((curr - next) / 86400000);

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}


export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const roadmapId = searchParams.get("roadmapId");

    const filter = roadmapId ? { roadmapId } : {};
    const logs = await StudyLog.find(filter).populate("topicId", "title estimatedHours").sort({ date: -1 });

    const streak = calculateStreak(logs.map((l) => l.date));
    return NextResponse.json({ logs, streak });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.roadmapId || !body.topicId || !body.durationMinutes) {
      return NextResponse.json(
        { error: "roadmapId, topicId, and durationMinutes are required" },
        { status: 400 }
      );
    }

    const log = await StudyLog.create({
      roadmapId: body.roadmapId,
      topicId: body.topicId,
      subtopicTitle: body.subtopicTitle || undefined,
      notes: body.notes || undefined,
      durationMinutes: Number(body.durationMinutes),
      date: body.date ? new Date(body.date) : new Date(),
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
