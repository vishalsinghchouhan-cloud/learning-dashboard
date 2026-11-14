import mongoose, { Schema, Document } from "mongoose";

export interface ISubtopic {
  _id?: mongoose.Types.ObjectId;
  title: string;
  isCompleted: boolean;
  subtopics?: ISubtopic[]; // Recursive nesting!
}

export interface ITopic extends Document {
  roadmapId: mongoose.Types.ObjectId;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedHours: number;
  status: "Not Started" | "In Progress" | "Completed";
  subtopics: ISubtopic[];
  reflection?: {
    learnedTakeaway?: string;
    struggledWith?: string;
    completedAt?: Date;
  };
}

// 1. Define the Subtopic schema first
const SubtopicSchema = new Schema<ISubtopic>({
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
});

// 2. Add the recursive self-reference field
SubtopicSchema.add({
  subtopics: [SubtopicSchema],
});

// 3. Attach it to the main Topic schema
const TopicSchema = new Schema<ITopic>(
  {
    roadmapId: { type: Schema.Types.ObjectId, ref: "Roadmap", required: true },
    title: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    estimatedHours: { type: Number, default: 2 },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started",
    },
    subtopics: [SubtopicSchema],
    reflection: {
      learnedTakeaway: { type: String },
      struggledWith: { type: String },
      completedAt: { type: Date },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Topic || mongoose.model<ITopic>("Topic", TopicSchema);
