import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Flashcard } from "@/models/KnowledgeHub";
import "@/models/Topic";
import "@/models/Roadmap";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get("topicId");
    const dueOnly = searchParams.get("dueOnly") === "true";

    const filter: any = {};
    if (topicId) filter.topicId = topicId;
    if (dueOnly) filter.nextReviewDate = { $lte: new Date() };

    const cards = await Flashcard.find(filter)
      .populate({
        path: "topicId",
        select: "title roadmapId",
        populate: {
          path: "roadmapId",
          select: "title",
        },
      })
      .sort({ nextReviewDate: 1 });

    return NextResponse.json(cards);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.topicId || !body.frontQuestion || !body.backAnswer) {
      return NextResponse.json({ error: "topicId, frontQuestion, and backAnswer are required" }, { status: 400 });
    }

    const tomorrow = new Date(Date.now() + 86400000);
    const card = await Flashcard.create({
      topicId: body.topicId,
      frontQuestion: body.frontQuestion,
      backAnswer: body.backAnswer,
      intervalDays: 1,
      nextReviewDate: tomorrow,
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Update Spaced Repetition interval after review rating
export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { cardId, rating } = await req.json(); // rating: "hard" | "good" | "easy"

    const card = await Flashcard.findById(cardId);
    if (!card) return NextResponse.json({ error: "Flashcard not found" }, { status: 404 });

    let nextInterval = 1;
    if (rating === "good") nextInterval = Math.max(2, Math.round(card.intervalDays * 2.5));
    if (rating === "easy") nextInterval = Math.max(4, Math.round(card.intervalDays * 4));

    card.intervalDays = nextInterval;
    card.nextReviewDate = new Date(Date.now() + nextInterval * 86400000);
    await card.save();

    return NextResponse.json(card);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
