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
//Test Result Schema
const testResultSchema = new mongoose_1.Schema({
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
}, { _id: false });
// Submission Schema
const submissionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
        index: true,
    },
    questionId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
//Indexes
submissionSchema.index({ userId: 1, questionId: 1 });
submissionSchema.index({ userId: 1, status: 1 });
submissionSchema.index({ questionId: 1, status: 1 });
submissionSchema.index({ submittedAt: -1 });
// Virtual for pass percentage
submissionSchema.virtual("passPercentage").get(function () {
    if (this.totalTestCases === 0)
        return 0;
    return Math.round((this.passedTestCases / this.totalTestCases) * 100);
});
// Method to check if submission is successful
submissionSchema.methods.isSuccess = function () {
    return (this.status === "Accepted" && this.passedTestCases === this.totalTestCases);
};
const Submission = mongoose_1.default.model("Submission", submissionSchema);
exports.default = Submission;
