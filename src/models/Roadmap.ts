import mongoose, { Schema, Document } from "mongoose";

export interface IRoadmap extends Document {
  title: string;
  description?: string;
  source: "manual" | "json_import";
  targetFinishDate?: Date;
  weeklyStudyTargetHours: number;
  createdAt: Date;
}

const RoadmapSchema = new Schema<IRoadmap>(
  {
    title: { type: String, required: true },
    description: { type: String },
    source: { type: String, enum: ["manual", "json_import"], default: "manual" },
    targetFinishDate: { type: Date },
    weeklyStudyTargetHours: { type: Number, default: 10 },
  },
  { timestamps: true }
);

export default mongoose.models.Roadmap || mongoose.model<IRoadmap>("Roadmap", RoadmapSchema);
