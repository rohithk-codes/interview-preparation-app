"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const interviewController_1 = __importDefault(require("../controllers/interviewController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.protect);
// Session management
router.post('/start', interviewController_1.default.startSession);
router.post('/answer', interviewController_1.default.submitAnswer);
router.post('/session/:sessionId/abandon', interviewController_1.default.abandonSession);
// Get data
router.get('/session/:sessionId', interviewController_1.default.getSession);
router.get('/session/:sessionId/current', interviewController_1.default.getCurrentQuestion);
router.get('/history', interviewController_1.default.getHistory);
router.get('/stats', interviewController_1.default.getStats);
router.get('/filters', interviewController_1.default.getFilters);
router.get('/count', interviewController_1.default.getQuestionCount);
exports.default = router;
