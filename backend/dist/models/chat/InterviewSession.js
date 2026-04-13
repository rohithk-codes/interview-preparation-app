"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Answer Result Schema
const answerResultSchema = new mongoose_1.Schema({
    questionId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, { _id: false });
// Interview Session Schema
const interviewSessionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: [mongoose_1.Schema.Types.ObjectId],
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
}, {
    timestamps: true
});
// Indexes
interviewSessionSchema.index({ userId: 1, status: 1 });
interviewSessionSchema.index({ createdAt: -1 });
// Methods
interviewSessionSchema.methods.calculateOverallScore = function () {
    if (this.answers.length === 0) {
        this.overallPercentage = 0;
        return;
    }
    const totalPercentage = this.answers.reduce((sum, answer) => sum + answer.percentage, 0);
    this.overallPercentage = Math.round(totalPercentage / this.answers.length);
};
const InterviewSession = mongoose_1.default.model('InterviewSession', interviewSessionSchema);
exports.default = InterviewSession;
