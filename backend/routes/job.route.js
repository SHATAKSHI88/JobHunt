import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";

import {
    getAdminJobs,
    getAllJobs,
    getFilterOptions,
    getJobById,
    postJob,
    updateJob,
    deleteJob,
} from "../controllers/job.controller.js";

const router = express.Router();

router.route("/post").post(isAuthenticated, postJob);

// Public routes
router.route("/get").get(getAllJobs);
router.route("/filters").get(getFilterOptions);

// Protected routes
router.route("/getadminjobs").get(isAuthenticated, getAdminJobs);
router.route("/get/:id").get(isAuthenticated, getJobById);
router.route("/update/:id").put(isAuthenticated, updateJob);
router.route("/delete/:id").delete(isAuthenticated, deleteJob);

export default router;