import mongoose, { Schema, Document } from "mongoose";

export interface IQuizScore extends Document {
  roadmapId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  testName: string;
  score: number;
  totalMarks: number;
  date: Date;
}

const QuizScoreSchema = new Schema<IQuizScore>(
  {
    roadmapId: { type: Schema.Types.ObjectId, ref: "Roadmap", required: true },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true },
    testName: { type: String, required: true },
    score: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export interface IWeeklyReview extends Document {
  weekStartDate: Date;
  topicsCovered: string[];
  keyLearnings: string;
  biggestStruggle: string;
}

const WeeklyReviewSchema = new Schema<IWeeklyReview>(
  {
    weekStartDate: { type: Date, required: true },
    topicsCovered: [{ type: String }],
    keyLearnings: { type: String, required: true },
    biggestStruggle: { type: String, required: true },
  },
  { timestamps: true }
);

export const QuizScore =
  mongoose.models.QuizScore || mongoose.model<IQuizScore>("QuizScore", QuizScoreSchema);
export const WeeklyReview =
  mongoose.models.WeeklyReview || mongoose.model<IWeeklyReview>("WeeklyReview", WeeklyReviewSchema);
