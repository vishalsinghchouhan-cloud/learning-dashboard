import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Topic from "@/models/Topic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const topic = await Topic.findById(id);
    if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    return NextResponse.json(topic);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    // If marking as Completed with reflection data, attach timestamp
    if (body.status === "Completed" && body.reflection) {
      body.reflection.completedAt = new Date();
    }

    const updatedTopic = await Topic.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!updatedTopic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });

    return NextResponse.json(updatedTopic);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    await Topic.findByIdAndDelete(id);
    return NextResponse.json({ message: "Topic deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
