import mongoose, { Document, Schema } from "mongoose";

// Test case interface
export interface ITestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

// Question interface
export interface IQuestion extends Document {
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  tags: string[];
  testCases: ITestCase[];
  solution: string;
  constraints?: string;
  examples?: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  hints?: string[];
  acceptanceRate?: number;
  totalSubmissions: number;
  successfulSubmissions: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Test Case Schema
const testCaseSchema = new Schema<ITestCase>(
  {
    input: {
      type: String,
      required: true,
    },
    expectedOutput: {
      type: String,
      required: true,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

// Example Schema
const exampleSchema = new Schema(
  {
    input: {
      type: String,
      required: true,
    },
    output: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
    },
  },
  { _id: false }
);

// Question Schema
const questionSchema = new Schema<IQuestion>(
  {
    title: {
      type: String,
      required: [true, "Question title is required"],
      trim: true,
      unique: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Question description is required"],
      minlength: [20, "Description must be at least 20 characters"],
    },
    difficulty: {
      type: String,
      enum: {
        values: ["Easy", "Medium", "Hard"],
        message: "Difficulty must be Easy, Medium, or Hard",
      },
      required: [true, "Difficulty level is required"],
    },
    topic: {
      type: String,
      required: [true, "Topic is required"],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    testCases: {
      type: [testCaseSchema],
      required: [true, "At least one test case is required"],
      validate: {
        validator: function (v: ITestCase[]) {
          return v && v.length > 0;
        },
        message: "At least one test case is required",
      },
    },
    solution: {
      type: String,
      required: [true, "Solution is required"],
    },
    constraints: {
      type: String,
    },
    examples: {
      type: [exampleSchema],
      default: [],
    },
    hints: {
      type: [String],
      default: [],
    },
    acceptanceRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalSubmissions: {
      type: Number,
      default: 0,
      min: 0,
    },
    successfulSubmissions: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
questionSchema.index({ difficulty: 1 });
questionSchema.index({ topic: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ title: "text", description: "text" });

// Method to update acceptance rate
questionSchema.methods.updateAcceptanceRate = function () {
  if (this.totalSubmissions > 0) {
    this.acceptanceRate = Math.round(
      (this.successfulSubmissions / this.totalSubmissions) * 100
    );
  }
};

const Question = mongoose.model<IQuestion>("Question", questionSchema);

export default Question;
