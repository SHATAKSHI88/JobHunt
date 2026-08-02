import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
    applyJob,
    getApplicants,
    getAppliedJobs,
    getApplicationById,
    generateApplicantAnalysis,
    updateStatus,
} from "../controllers/application.controller.js";

const router = express.Router();

// POST because the candidate now submits a screening form (gender,
// disability, relative-at-company, nationality, terms) alongside applying —
// this used to be a one-click GET, now it carries a body.
router.route("/apply/:id").post(isAuthenticated, applyJob);
router.route("/get").get(isAuthenticated, getAppliedJobs);
router.route("/:id/applicants").get(isAuthenticated, getApplicants);
router.route("/status/:id/update").post(isAuthenticated, updateStatus);
router.route("/:id/analyze").post(isAuthenticated, generateApplicantAnalysis);
router.route("/:id").get(isAuthenticated, getApplicationById);

export default router;
