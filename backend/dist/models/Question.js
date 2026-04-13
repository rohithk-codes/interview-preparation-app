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
// Test Case Schema
const testCaseSchema = new mongoose_1.Schema({
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
}, { _id: false });
// Example Schema
const exampleSchema = new mongoose_1.Schema({
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
}, { _id: false });
// Question Schema
const questionSchema = new mongoose_1.Schema({
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
            validator: function (v) {
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
});
// Indexes for faster queries
questionSchema.index({ difficulty: 1 });
questionSchema.index({ topic: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ title: "text", description: "text" });
// Method to update acceptance rate
questionSchema.methods.updateAcceptanceRate = function () {
    if (this.totalSubmissions > 0) {
        this.acceptanceRate = Math.round((this.successfulSubmissions / this.totalSubmissions) * 100);
    }
};
const Question = mongoose_1.default.model("Question", questionSchema);
exports.default = Question;
