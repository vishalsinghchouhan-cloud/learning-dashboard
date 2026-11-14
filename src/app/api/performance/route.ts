import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { QuizScore, WeeklyReview } from "@/models/Performance";

export async function GET() {
  try {
    await connectDB();
    const scores = await QuizScore.find()
      .populate("topicId", "title")
      .populate("roadmapId", "title")
      .sort({ date: 1 });
    const reviews = await WeeklyReview.find().sort({ weekStartDate: -1 }).limit(10);

    return NextResponse.json({ scores, reviews });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    if (body.entryType === "quiz") {
      const scoreEntry = await QuizScore.create({
        roadmapId: body.roadmapId,
        topicId: body.topicId,
        testName: body.testName,
        score: Number(body.score),
        totalMarks: Number(body.totalMarks),
        date: body.date ? new Date(body.date) : new Date(),
      });
      return NextResponse.json(scoreEntry, { status: 201 });
    }

    if (body.entryType === "review") {
      const reviewEntry = await WeeklyReview.create({
        weekStartDate: body.weekStartDate ? new Date(body.weekStartDate) : new Date(),
        topicsCovered: body.topicsCovered || [],
        keyLearnings: body.keyLearnings,
        biggestStruggle: body.biggestStruggle,
      });
      return NextResponse.json(reviewEntry, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid entryType" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
