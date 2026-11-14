import mongoose, { Schema, Document } from "mongoose";

export interface IFlashcard extends Document {
  topicId: mongoose.Types.ObjectId;
  frontQuestion: string;
  backAnswer: string;
  intervalDays: number;
  nextReviewDate: Date;
}

const FlashcardSchema = new Schema<IFlashcard>(
  {
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true },
    frontQuestion: { type: String, required: true },
    backAnswer: { type: String, required: true },
    intervalDays: { type: Number, default: 1 },
    nextReviewDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export interface IResource extends Document {
  topicId: mongoose.Types.ObjectId;
  title: string;
  url: string;
  type: "Video" | "Article" | "PDF" | "Docs";
}

const ResourceSchema = new Schema<IResource>(
  {
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ["Video", "Article", "PDF", "Docs"], default: "Article" },
  },
  { timestamps: true }
);

export const Flashcard =
  mongoose.models.Flashcard || mongoose.model<IFlashcard>("Flashcard", FlashcardSchema);
export const Resource =
  mongoose.models.Resource || mongoose.model<IResource>("Resource", ResourceSchema);
