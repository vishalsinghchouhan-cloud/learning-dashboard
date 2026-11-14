import mongoose, { Schema, Document } from "mongoose";

export interface IStudyLog extends Document {
  roadmapId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  subtopicTitle?: string;
  durationMinutes: number;
  date: Date;
}

const StudyLogSchema = new Schema<IStudyLog>(
  {
    roadmapId: { type: Schema.Types.ObjectId, ref: "Roadmap", required: true },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true },
    subtopicTitle: { type: String },
    durationMinutes: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.StudyLog || mongoose.model<IStudyLog>("StudyLog", StudyLogSchema);
