import mongoose, { Document, Schema } from "mongoose";

//Test result interface
export interface ITestResult {
  testCaseIndex: number;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  executionTime?: number;
  error?: string;
}

//Submission status type
export type SubmissionStatus =
  | "Pending"
  | "Running"
  | "Accepted"
  | "Wrong Answer"
  | "Runtime Error"
  | "Time Limit Exceeded"
  | "Compilation Error";

export interface ISubmission extends Document {
  userId: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  code: string;
  language: string;
  status: SubmissionStatus;
  testResults: ITestResult[];
  totalTestCases: number;
  passedTestCases: number;
  executionTime?: number;
  memory?: number;
  error?: string;
  submittedAt: Date;
}

//Test Result Schema
const testResultSchema = new Schema<ITestResult>(
  {
    testCaseIndex: {
      type: Number,
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    input: {
      type: String,
      required: true,
    },
    expectedOutput: {
      type: String,
      required: true,
    },
    actualOutput: {
      type: String,
      required: true,
    },
    executionTime: {
      type: Number,
    },
    error: {
      type: String,
    },
  },
  { _id: false }
);

// Submission Schema

const submissionSchema = new Schema<ISubmission>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: [true, "Question ID is required"],
      index: true,
    },
    code: {
      type: String,
      required: [true, "Code is required"],
      trim: true,
    },
    language: {
      type: String,
      required: [true, "Language is required"],
      enum: ["javascript", "python", "java", "cpp"],
      default: "javascript",
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Running",
        "Accepted",
        "Wrong Answer",
        "Runtime Error",
        "Time Limit Exceeded",
        "Compilation Error",
      ],
      default: "Pending",
      index: true,
    },
    testResults: {
      type: [testResultSchema],
      default: [],
    },
    totalTestCases: {
      type: Number,
      default: 0,
    },
    passedTestCases: {
      type: Number,
      default: 0,
    },
    executionTime: {
      type: Number,
    },
    memory: {
      type: Number,
    },
    error: {
      type: String,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

//Indexes
submissionSchema.index({ userId: 1, questionId: 1 });
submissionSchema.index({ userId: 1, status: 1 });
submissionSchema.index({ questionId: 1, status: 1 });
submissionSchema.index({ submittedAt: -1 });

// Virtual for pass percentage
submissionSchema.virtual("passPercentage").get(function () {
  if (this.totalTestCases === 0) return 0;
  return Math.round((this.passedTestCases / this.totalTestCases) * 100);
});

// Method to check if submission is successful
submissionSchema.methods.isSuccess = function (): boolean {
  return (
    this.status === "Accepted" && this.passedTestCases === this.totalTestCases
  );
};

const Submission = mongoose.model<ISubmission>("Submission", submissionSchema);

export default Submission;
