import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
    scheduleInterview,
    rescheduleInterview,
    cancelInterview,
    getInterviewByApplication,
    getMyInterviews,
    joinInterview,
} from "../controllers/interview.controller.js";

const router = express.Router();

router.route("/schedule/:applicationId").post(isAuthenticated, scheduleInterview);
router.route("/:id/reschedule").patch(isAuthenticated, rescheduleInterview);
router.route("/:id/cancel").patch(isAuthenticated, cancelInterview);
router.route("/application/:applicationId").get(isAuthenticated, getInterviewByApplication);
router.route("/my").get(isAuthenticated, getMyInterviews);
router.route("/:id/join").get(isAuthenticated, joinInterview);

export default router;
