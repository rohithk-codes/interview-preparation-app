import mongoose, { Document, Schema } from 'mongoose';

// Answer result interface
export interface IAnswer {
  questionId: mongoose.Types.ObjectId;
  questionText: string;
  userAnswer: string;
  isVoiceAnswer: boolean; 
  score: number;
  maxScore: number;
  percentage: number;
  matchedKeywords: string[];
  missedKeywords: string[];
  feedback: string;
  timeSpent: number; 
  answeredAt: Date;
}


export type SessionStatus = 'in-progress' | 'completed' | 'abandoned';

// Interview Session interface
export interface IInterviewSession extends Document {
  userId: mongoose.Types.ObjectId;
  category: 'javascript' | 'python' | 'java' | 'general';
  type: 'frontend' | 'backend' | 'fullstack';
  difficulty: 'easy' | 'medium' | 'hard';
  status: SessionStatus;
  currentQuestionIndex: number;
  questionIds: mongoose.Types.ObjectId[];
  answers: IAnswer[];
  totalScore: number;
  maxPossibleScore: number;
  overallPercentage: number;
  calculateOverallScore():void;
  totalTimeSpent: number;
  voiceAnswersCount: number; 
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Answer Result Schema
const answerResultSchema = new Schema<IAnswer>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'InterviewQuestion',
      required: true
    },
    questionText: {
      type: String,
      required: true
    },
    userAnswer: {
      type: String,
      required: true
    },
    isVoiceAnswer: {
      type: Boolean,
      default: false
    },
    score: {
      type: Number,
      required: true,
      min: 0
    },
    maxScore: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    matchedKeywords: {
      type: [String],
      default: []
    },
    missedKeywords: {
      type: [String],
      default: []
    },
    feedback: {
      type: String,
      required: true
    },
    timeSpent: {
      type: Number,
      default: 0
    },
    answeredAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

// Interview Session Schema
const interviewSessionSchema = new Schema<IInterviewSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    category: {
      type: String,
      enum: ['javascript', 'python', 'java', 'general'],
      required: true
    },
    type: {
      type: String,
      enum: ['frontend', 'backend', 'fullstack'],
      required: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
      index: true
    },
    currentQuestionIndex: {
      type: Number,
      default: 0
    },
    questionIds: {
      type: [Schema.Types.ObjectId],
      ref: 'InterviewQuestion',
      required: true
    },
    answers: {
      type: [answerResultSchema],
      default: []
    },
    totalScore: {
      type: Number,
      default: 0
    },
    maxPossibleScore: {
      type: Number,
      default: 0
    },
    overallPercentage: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number,
      default: 0
    },
    voiceAnswersCount: {
      type: Number,
      default: 0
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes
interviewSessionSchema.index({ userId: 1, status: 1 });
interviewSessionSchema.index({ createdAt: -1 });

// Methods
interviewSessionSchema.methods.calculateOverallScore = function(this:IInterviewSession) {
  if (this.answers.length === 0) {
    this.overallPercentage = 0;
    return;
  }

  const totalPercentage = this.answers.reduce((sum, answer:IAnswer) => sum + answer.percentage, 0);
  this.overallPercentage = Math.round(totalPercentage / this.answers.length);
};

const InterviewSession = mongoose.model<IInterviewSession>(
  'InterviewSession',
  interviewSessionSchema
);

export default InterviewSession;