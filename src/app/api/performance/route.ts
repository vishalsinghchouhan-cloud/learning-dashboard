import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { QuizScore, WeeklyReview } from "@/models/Performance";
import { getPaginationParams, paginateQuery } from "@/lib/paginate";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const reviewPage = parseInt(searchParams.get("reviewPage") || "1", 10);
    const reviewLimit = parseInt(searchParams.get("reviewLimit") || "5", 10);
    const skip = (Math.max(1, reviewPage) - 1) * reviewLimit;

    const [scores, reviews, totalReviews] = await Promise.all([
      QuizScore.find().populate("topicId", "title").populate("roadmapId", "title").sort({ date: 1 }),
      WeeklyReview.find().sort({ weekStartDate: -1 }).skip(skip).limit(reviewLimit),
      WeeklyReview.countDocuments(),
    ]);

    return NextResponse.json({
      scores,
      reviews,
      hasMoreReviews: skip + reviews.length < totalReviews,
    });
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
