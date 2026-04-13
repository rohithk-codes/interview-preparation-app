"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = __importDefault(require("./config/db"));
const auth_1 = __importDefault(require("./routes/auth"));
const question_1 = __importDefault(require("./routes/question"));
const submission_1 = __importDefault(require("./routes/submission"));
const interview_1 = __importDefault(require("./routes/interview"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/api/auth', auth_1.default);
app.use('/api/questions', question_1.default);
app.use("/api/submissions", submission_1.default);
app.use("/api/interview", interview_1.default);
app.get("/", (req, res) => {
    res.json({ message: "Interview prepration app is running" });
});
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});
const PORT = process.env.PORT || "";
const startServer = async () => {
    try {
        await (0, db_1.default)();
        app.listen(PORT, () => {
            console.log(`server runnig on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server", error);
        process.exit(1);
    }
};
startServer();
