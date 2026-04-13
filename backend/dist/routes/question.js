"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const questionController_1 = __importDefault(require("../controllers/questionController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get("/stats", auth_1.protect, questionController_1.default.getQuestionStats);
router.get("/topics", auth_1.protect, questionController_1.default.getTopics);
// Question CRUD
router
    .route("/")
    .get(questionController_1.default.getAllQuestions)
    .post(auth_1.protect, (0, auth_1.authorize)("admin"), questionController_1.default.createQuestion);
router
    .route("/:id")
    .get(auth_1.protect, questionController_1.default.getQuestionById)
    .put(auth_1.protect, (0, auth_1.authorize)("admin"), questionController_1.default.updateQuestion)
    .delete(auth_1.protect, (0, auth_1.authorize)("admin"), questionController_1.default.deleteQuestion);
exports.default = router;
