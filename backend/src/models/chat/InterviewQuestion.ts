import mongoose, { Document, Schema } from 'mongoose';


export interface IKeyword {
  word: string;
  weight: number; 
  synonyms?: string[]; // Alternative words that count
}

export interface IExampleAnswer {
  text: string;
  score: number;
}


export interface IInterviewQuestion extends Document {
  question: string;
  category: 'javascript' | 'python' | 'java' | 'general';
  type: 'frontend' | 'backend' | 'fullstack';
  difficulty: 'easy' | 'medium' | 'hard';
  keywords: IKeyword[];
  idealAnswer: string;
  hints: string[];
  followUpQuestions: string[];
  exampleAnswers: IExampleAnswer[];
  timeLimit?: number;
  createdAt: Date;
  updatedAt: Date;
}


const keywordSchema = new Schema<IKeyword>(
  {
    word: {
      type: String,
      required: true,
      lowercase: true
    },
    weight: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    synonyms: {
      type: [String],
      default: []
    }
  },
  { _id: false }
);


const exampleAnswerSchema = new Schema<IExampleAnswer>(
  {
    text: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  { _id: false }
);


const interviewQuestionSchema = new Schema<IInterviewQuestion>(
  {
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['javascript', 'python', 'java', 'general'],
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['frontend', 'backend', 'fullstack'],
      required: true,
      index: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
      default: 'medium'
    },
    keywords: {
      type: [keywordSchema],
      required: true,
      validate: {
        validator: function(v: IKeyword[]) {
          return v && v.length > 0;
        },
        message: 'At least one keyword is required'
      }
    },
    idealAnswer: {
      type: String,
      required: true
    },
    hints: {
      type: [String],
      default: []
    },
    followUpQuestions: {
      type: [String],
      default: []
    },
    exampleAnswers: {
      type: [exampleAnswerSchema],
      default: []
    },
    timeLimit: {
      type: Number,
      default: 120
    }
  },
  {
    timestamps: true
  }
);


interviewQuestionSchema.index({ category: 1, type: 1, difficulty: 1 });

const InterviewQuestion = mongoose.model<IInterviewQuestion>(
  'InterviewQuestion',
  interviewQuestionSchema
);

export default InterviewQuestion;